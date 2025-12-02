/**
 * Database Layer - Hybrid Local/Cloud Storage
 * Manages Supabase (cloud) and SQLite (local) databases with sync capabilities
 */

use crate::error::{AppError, AppResult};
use postgrest::Postgrest;
use sqlx::{sqlite::SqlitePoolOptions, Pool, Sqlite};
use serde::{Deserialize, Serialize};
use std::path::PathBuf;
use std::sync::Arc;
use tokio::sync::Mutex;

/// Supabase client wrapper
#[derive(Clone)]
pub struct SupabaseClient {
    client: Postgrest,
    api_key: String,
}

impl SupabaseClient {
    pub fn new(url: String, api_key: String) -> Self {
        let client = Postgrest::new(url)
            .insert_header("apikey", &api_key)
            .insert_header("Authorization", format!("Bearer {}", api_key));

        Self { client, api_key }
    }

    pub fn client(&self) -> &Postgrest {
        &self.client
    }

    pub fn api_key(&self) -> &str {
        &self.api_key
    }

    pub async fn select(&self, table: &str) -> AppResult<postgrest::Builder> {
        Ok(self.client.from(table).select("*"))
    }

    pub async fn insert(&self, table: &str, data: &str) -> AppResult<postgrest::Builder> {
        Ok(self.client.from(table).insert(data))
    }

    pub async fn update(&self, table: &str, data: &str) -> AppResult<postgrest::Builder> {
        Ok(self.client.from(table).update(data))
    }

    pub async fn delete(&self, table: &str) -> AppResult<postgrest::Builder> {
        Ok(self.client.from(table).delete())
    }
}

/// SQLite local cache manager
#[derive(Clone)]
pub struct SqliteCache {
    db_path: PathBuf,
    pool: Arc<Mutex<Option<Pool<Sqlite>>>>,
}

impl SqliteCache {
    pub fn new(db_path: PathBuf) -> Self {
        Self {
            db_path,
            pool: Arc::new(Mutex::new(None)),
        }
    }

    /// Initialize the SQLite database with schema
    pub async fn initialize(&self) -> AppResult<()> {
        let mut pool_guard = self.pool.lock().await;
        
        // Create parent directory if it doesn't exist
        if let Some(parent) = self.db_path.parent() {
            std::fs::create_dir_all(parent)?;
        }

        let pool = SqlitePoolOptions::new()
            .max_connections(5)
            .connect_with(
                sqlx::sqlite::SqliteConnectOptions::new()
                    .filename(&self.db_path)
                    .create_if_missing(true)
                    .foreign_keys(true)
            )
            .await?;

        // Create tables
        self.create_schema(&pool).await?;

        *pool_guard = Some(pool);
        Ok(())
    }

    /// Create the local database schema
    async fn create_schema(&self, pool: &Pool<Sqlite>) -> AppResult<()> {
        // Cases table
        sqlx::query(
            "CREATE TABLE IF NOT EXISTS cases (
                id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL,
                title TEXT NOT NULL,
                case_name TEXT,
                file_url TEXT,
                issue TEXT,
                rule TEXT,
                analysis TEXT,
                conclusion TEXT,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL,
                synced INTEGER DEFAULT 0,
                dirty INTEGER DEFAULT 0
            )"
        ).execute(pool).await?;

        // Documents table
        sqlx::query(
            "CREATE TABLE IF NOT EXISTS documents (
                id TEXT PRIMARY KEY,
                user_id TEXT,
                case_id TEXT,
                document_type TEXT NOT NULL,
                title TEXT NOT NULL,
                original_text TEXT,
                embedding_status TEXT DEFAULT 'pending',
                total_chunks INTEGER DEFAULT 0,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL,
                synced INTEGER DEFAULT 0,
                dirty INTEGER DEFAULT 0,
                FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE CASCADE
            )"
        ).execute(pool).await?;

        // Document chunks table (cached)
        sqlx::query(
            "CREATE TABLE IF NOT EXISTS document_chunks (
                id TEXT PRIMARY KEY,
                document_id TEXT NOT NULL,
                chunk_index INTEGER NOT NULL,
                chunk_text TEXT NOT NULL,
                metadata TEXT,
                embedding BLOB,
                created_at TEXT NOT NULL,
                synced INTEGER DEFAULT 0,
                FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE
            )"
        ).execute(pool).await?;

        // Flashcard sets table
        sqlx::query(
            "CREATE TABLE IF NOT EXISTS flashcard_sets (
                id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL,
                title TEXT NOT NULL,
                description TEXT,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL,
                synced INTEGER DEFAULT 0,
                dirty INTEGER DEFAULT 0
            )"
        ).execute(pool).await?;

        // Flashcards table
        sqlx::query(
            "CREATE TABLE IF NOT EXISTS flashcards (
                id TEXT PRIMARY KEY,
                set_id TEXT NOT NULL,
                front TEXT NOT NULL,
                back TEXT NOT NULL,
                created_at TEXT NOT NULL,
                synced INTEGER DEFAULT 0,
                dirty INTEGER DEFAULT 0,
                FOREIGN KEY (set_id) REFERENCES flashcard_sets(id) ON DELETE CASCADE
            )"
        ).execute(pool).await?;

        // Mock tests table
        sqlx::query(
            "CREATE TABLE IF NOT EXISTS mock_tests (
                id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL,
                title TEXT NOT NULL,
                description TEXT,
                questions TEXT NOT NULL,
                created_at TEXT NOT NULL,
                synced INTEGER DEFAULT 0,
                dirty INTEGER DEFAULT 0
            )"
        ).execute(pool).await?;

        // Test results table
        sqlx::query(
            "CREATE TABLE IF NOT EXISTS test_results (
                id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL,
                test_id TEXT NOT NULL,
                score REAL,
                total_questions INTEGER,
                answers TEXT,
                completed_at TEXT NOT NULL,
                synced INTEGER DEFAULT 0,
                dirty INTEGER DEFAULT 0,
                FOREIGN KEY (test_id) REFERENCES mock_tests(id) ON DELETE CASCADE
            )"
        ).execute(pool).await?;

        // Study plans table
        sqlx::query(
            "CREATE TABLE IF NOT EXISTS study_plans (
                id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL,
                title TEXT NOT NULL,
                description TEXT,
                start_date TEXT,
                end_date TEXT,
                progress INTEGER DEFAULT 0,
                tasks TEXT,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL,
                synced INTEGER DEFAULT 0,
                dirty INTEGER DEFAULT 0
            )"
        ).execute(pool).await?;

        // Sync queue table
        sqlx::query(
            "CREATE TABLE IF NOT EXISTS sync_queue (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                operation_type TEXT NOT NULL,
                table_name TEXT NOT NULL,
                record_id TEXT NOT NULL,
                data TEXT NOT NULL,
                created_at TEXT NOT NULL,
                attempts INTEGER DEFAULT 0
            )"
        ).execute(pool).await?;

        // Create indexes
        sqlx::query("CREATE INDEX IF NOT EXISTS idx_cases_user ON cases(user_id)").execute(pool).await?;
        sqlx::query("CREATE INDEX IF NOT EXISTS idx_documents_user ON documents(user_id)").execute(pool).await?;
        sqlx::query("CREATE INDEX IF NOT EXISTS idx_documents_case ON documents(case_id)").execute(pool).await?;
        sqlx::query("CREATE INDEX IF NOT EXISTS idx_chunks_document ON document_chunks(document_id)").execute(pool).await?;
        sqlx::query("CREATE INDEX IF NOT EXISTS idx_flashcard_sets_user ON flashcard_sets(user_id)").execute(pool).await?;
        sqlx::query("CREATE INDEX IF NOT EXISTS idx_flashcards_set ON flashcards(set_id)").execute(pool).await?;
        sqlx::query("CREATE INDEX IF NOT EXISTS idx_mock_tests_user ON mock_tests(user_id)").execute(pool).await?;
        sqlx::query("CREATE INDEX IF NOT EXISTS idx_test_results_user ON test_results(user_id)").execute(pool).await?;
        sqlx::query("CREATE INDEX IF NOT EXISTS idx_study_plans_user ON study_plans(user_id)").execute(pool).await?;
        sqlx::query("CREATE INDEX IF NOT EXISTS idx_sync_queue_table ON sync_queue(table_name, record_id)").execute(pool).await?;

        Ok(())
    }

    /// Get the connection pool
    pub async fn get_pool(&self) -> AppResult<Pool<Sqlite>> {
        let guard = self.pool.lock().await;
        guard.clone().ok_or(AppError::Database("Database not initialized".to_string()))
    }
}

/// Hybrid storage manager - decides whether to use local or cloud storage
#[derive(Clone)]
pub struct HybridStorage {
    supabase: Option<SupabaseClient>,
    sqlite: SqliteCache,
    online: Arc<Mutex<bool>>,
}

impl HybridStorage {
    pub fn new(sqlite_path: PathBuf, supabase_url: Option<String>, supabase_key: Option<String>) -> Self {
        let supabase = match (supabase_url, supabase_key) {
            (Some(url), Some(key)) => Some(SupabaseClient::new(url, key)),
            _ => None,
        };

        Self {
            supabase,
            sqlite: SqliteCache::new(sqlite_path),
            online: Arc::new(Mutex::new(false)),
        }
    }

    /// Initialize both storage layers
    pub async fn initialize(&self) -> AppResult<()> {
        // Always initialize SQLite
        self.sqlite.initialize().await?;

        // Check if we're online by testing Supabase connection
        if let Some(_supabase) = &self.supabase {
            // Try to ping Supabase
            let is_online = self.check_online().await;
            *self.online.lock().await = is_online;
        }

        Ok(())
    }

    /// Check if we're online
    pub async fn check_online(&self) -> bool {
        if let Some(supabase) = &self.supabase {
            // Try a simple query to check connectivity
            match supabase.select("profiles").await {
                Ok(_) => true,
                Err(_) => false,
            }
        } else {
            false
        }
    }

    /// Get online status
    pub async fn is_online(&self) -> bool {
        *self.online.lock().await
    }

    /// Set online status
    pub async fn set_online(&self, online: bool) {
        *self.online.lock().await = online;
    }

    /// Get Supabase client if available
    pub fn supabase(&self) -> Option<&SupabaseClient> {
        self.supabase.as_ref()
    }

    /// Get SQLite cache
    pub fn sqlite(&self) -> &SqliteCache {
        &self.sqlite
    }
}

/// Sync operation for the queue
#[derive(Debug, Serialize, Deserialize)]
pub struct SyncOperation {
    pub operation_type: String, // "insert", "update", "delete"
    pub table_name: String,
    pub record_id: String,
    pub data: String,
}
