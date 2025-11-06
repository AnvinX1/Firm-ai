/**
 * Sync Manager
 * Handles background synchronization between local SQLite and Supabase
 */

use crate::db::{HybridStorage, SyncOperation};
use crate::error::{AppError, AppResult};
use chrono::Utc;
use serde::{Deserialize, Serialize};
use std::sync::Arc;
use tokio::sync::Mutex;
use tokio::time::{interval, Duration};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct SyncStatus {
    pub is_syncing: bool,
    pub last_sync: Option<String>,
    pub pending_operations: usize,
    pub is_online: bool,
}

#[derive(Clone)]
pub struct SyncManager {
    storage: Arc<HybridStorage>,
    is_syncing: Arc<Mutex<bool>>,
    last_sync: Arc<Mutex<Option<String>>>,
}

impl SyncManager {
    pub fn new(storage: Arc<HybridStorage>) -> Self {
        Self {
            storage,
            is_syncing: Arc::new(Mutex::new(false)),
            last_sync: Arc::new(Mutex::new(None)),
        }
    }

    /// Start periodic background sync
    pub async fn start_periodic_sync(self: Arc<Self>) {
        let sync_manager = self.clone();
        
        tokio::spawn(async move {
            let mut ticker = interval(Duration::from_secs(300)); // Sync every 5 minutes

            loop {
                ticker.tick().await;
                
                // Check if online
                let is_online = sync_manager.storage.is_online().await;
                if !is_online {
                    // Try to reconnect
                    let new_status = sync_manager.storage.check_online().await;
                    sync_manager.storage.set_online(new_status).await;
                    
                    if !new_status {
                        continue; // Still offline, skip this sync
                    }
                }

                // Perform sync
                if let Err(e) = sync_manager.sync_now().await {
                    eprintln!("Background sync error: {}", e);
                }
            }
        });
    }

    /// Manually trigger sync
    pub async fn sync_now(&self) -> AppResult<()> {
        // Check if already syncing
        {
            let mut is_syncing = self.is_syncing.lock().await;
            if *is_syncing {
                return Err(AppError::Sync("Sync already in progress".to_string()));
            }
            *is_syncing = true;
        }

        // Perform sync operations
        let result = self.perform_sync().await;

        // Update status
        {
            let mut is_syncing = self.is_syncing.lock().await;
            *is_syncing = false;
            
            if result.is_ok() {
                let mut last_sync = self.last_sync.lock().await;
                *last_sync = Some(Utc::now().to_rfc3339());
            }
        }

        result
    }

    /// Perform actual sync operations
    async fn perform_sync(&self) -> AppResult<()> {
        // Check if online
        if !self.storage.is_online().await {
            return Err(AppError::Offline);
        }

        // Process sync queue
        self.process_sync_queue().await?;

        // Sync dirty records
        self.sync_dirty_records().await?;

        Ok(())
    }

    /// Process queued operations
    async fn process_sync_queue(&self) -> AppResult<()> {
        let operations = self.get_queued_operations().await?;

        for operation in operations {
            match self.execute_sync_operation(&operation).await {
                Ok(_) => {
                    // Remove from queue on success
                    self.remove_from_queue(operation.id).await?;
                }
                Err(e) => {
                    eprintln!("Failed to sync operation {}: {}", operation.id, e);
                    // Increment attempt counter
                    self.increment_sync_attempts(operation.id).await?;
                }
            }
        }

        Ok(())
    }

    /// Get queued sync operations
    async fn get_queued_operations(&self) -> AppResult<Vec<QueuedOperation>> {
        self.storage.sqlite().execute(|conn| {
            let mut stmt = conn.prepare(
                "SELECT id, operation_type, table_name, record_id, data, attempts
                 FROM sync_queue
                 WHERE attempts < 5
                 ORDER BY created_at ASC
                 LIMIT 50"
            )?;

            let operations = stmt
                .query_map([], |row| {
                    Ok(QueuedOperation {
                        id: row.get(0)?,
                        operation_type: row.get(1)?,
                        table_name: row.get(2)?,
                        record_id: row.get(3)?,
                        data: row.get(4)?,
                        attempts: row.get(5)?,
                    })
                })?
                .collect::<Result<Vec<_>, _>>()?;

            Ok(operations)
        }).await
    }

    /// Execute a single sync operation
    async fn execute_sync_operation(&self, operation: &QueuedOperation) -> AppResult<()> {
        let supabase = self
            .storage
            .supabase()
            .ok_or_else(|| AppError::Internal("Supabase not configured".to_string()))?;

        match operation.operation_type.as_str() {
            "insert" => {
                supabase
                    .insert(&operation.table_name, &operation.data)
                    .await?
                    .execute()
                    .await
                    .map_err(|e| AppError::Sync(format!("Insert failed: {}", e)))?;
            }
            "update" => {
                supabase
                    .update(&operation.table_name, &operation.data)
                    .await?
                    .eq("id", &operation.record_id)
                    .execute()
                    .await
                    .map_err(|e| AppError::Sync(format!("Update failed: {}", e)))?;
            }
            "delete" => {
                supabase
                    .delete(&operation.table_name)
                    .await?
                    .eq("id", &operation.record_id)
                    .execute()
                    .await
                    .map_err(|e| AppError::Sync(format!("Delete failed: {}", e)))?;
            }
            _ => {
                return Err(AppError::Sync(format!(
                    "Unknown operation type: {}",
                    operation.operation_type
                )));
            }
        }

        Ok(())
    }

    /// Sync dirty records (records modified locally but not synced)
    async fn sync_dirty_records(&self) -> AppResult<()> {
        let tables = vec![
            "cases",
            "flashcard_sets",
            "flashcards",
            "mock_tests",
            "test_results",
            "study_plans",
        ];

        for table in tables {
            self.sync_dirty_table(table).await?;
        }

        Ok(())
    }

    /// Sync dirty records from a specific table
    async fn sync_dirty_table(&self, table_name: &str) -> AppResult<()> {
        let supabase = self
            .storage
            .supabase()
            .ok_or_else(|| AppError::Internal("Supabase not configured".to_string()))?;

        // Get dirty records
        let table = table_name.to_string();
        let dirty_records = self.storage.sqlite().execute(move |conn| {
            let query = format!("SELECT * FROM {} WHERE dirty = 1 LIMIT 20", table);
            let mut stmt = conn.prepare(&query)?;
            
            let column_count = stmt.column_count();
            let mut records: Vec<serde_json::Value> = Vec::new();

            let rows = stmt.query_map([], |row| {
                let mut record = serde_json::Map::new();
                
                for i in 0..column_count {
                    let column_name = stmt.column_name(i)?.to_string();
                    
                    // Skip internal sync columns
                    if column_name == "synced" || column_name == "dirty" {
                        continue;
                    }

                    // Try to get value as different types
                    let value: serde_json::Value = if let Ok(s) = row.get::<_, String>(i) {
                        serde_json::Value::String(s)
                    } else if let Ok(n) = row.get::<_, i64>(i) {
                        serde_json::Value::Number(n.into())
                    } else if let Ok(f) = row.get::<_, f64>(i) {
                        serde_json::json!(f)
                    } else if let Ok(b) = row.get::<_, bool>(i) {
                        serde_json::Value::Bool(b)
                    } else {
                        serde_json::Value::Null
                    };

                    record.insert(column_name, value);
                }

                Ok(serde_json::Value::Object(record))
            })?;

            for row_result in rows {
                if let Ok(record) = row_result {
                    records.push(record);
                }
            }

            Ok(records)
        }).await?;

        // Upload to Supabase (using upsert to handle both insert and update)
        for record in dirty_records {
            let record_id = record["id"].as_str().unwrap_or("").to_string();
            let data = serde_json::to_string(&record)?;

            // Try upsert (insert or update)
            supabase
                .insert(table_name, &data)
                .await?
                .execute()
                .await
                .map_err(|e| AppError::Sync(format!("Upsert failed: {}", e)))?;

            // Mark as synced locally
            let table_name_clone = table_name.to_string();
            self.storage.sqlite().execute(move |conn| {
                let query = format!("UPDATE {} SET synced = 1, dirty = 0 WHERE id = ?1", table_name_clone);
                conn.execute(&query, [&record_id])?;
                Ok(())
            }).await?;
        }

        Ok(())
    }

    /// Remove operation from sync queue
    async fn remove_from_queue(&self, operation_id: i64) -> AppResult<()> {
        self.storage.sqlite().execute(move |conn| {
            conn.execute("DELETE FROM sync_queue WHERE id = ?1", [operation_id])?;
            Ok(())
        }).await
    }

    /// Increment sync attempt counter
    async fn increment_sync_attempts(&self, operation_id: i64) -> AppResult<()> {
        self.storage.sqlite().execute(move |conn| {
            conn.execute(
                "UPDATE sync_queue SET attempts = attempts + 1 WHERE id = ?1",
                [operation_id],
            )?;
            Ok(())
        }).await
    }

    /// Get current sync status
    pub async fn get_status(&self) -> AppResult<SyncStatus> {
        let is_syncing = *self.is_syncing.lock().await;
        let last_sync = self.last_sync.lock().await.clone();
        let is_online = self.storage.is_online().await;

        let pending_operations = self.storage.sqlite().execute(|conn| {
            let mut stmt = conn.prepare("SELECT COUNT(*) FROM sync_queue WHERE attempts < 5")?;
            let count: i64 = stmt.query_row([], |row| row.get(0))?;
            Ok(count as usize)
        }).await?;

        Ok(SyncStatus {
            is_syncing,
            last_sync,
            pending_operations,
            is_online,
        })
    }

    /// Add operation to sync queue
    pub async fn queue_operation(&self, operation: SyncOperation) -> AppResult<()> {
        self.storage.sqlite().execute(move |conn| {
            conn.execute(
                "INSERT INTO sync_queue (operation_type, table_name, record_id, data, created_at, attempts)
                 VALUES (?1, ?2, ?3, ?4, datetime('now'), 0)",
                rusqlite::params![
                    &operation.operation_type,
                    &operation.table_name,
                    &operation.record_id,
                    &operation.data,
                ],
            )?;
            Ok(())
        }).await
    }
}

#[derive(Debug)]
struct QueuedOperation {
    id: i64,
    operation_type: String,
    table_name: String,
    record_id: String,
    data: String,
    attempts: i32,
}

