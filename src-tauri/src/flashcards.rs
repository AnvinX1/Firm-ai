/**
 * Flashcards Module
 * Manages flashcard sets and individual flashcards with CRUD operations
 */

use crate::db::HybridStorage;
use crate::error::{AppError, AppResult};
use crate::validation::{validate_flashcard_content, validate_not_empty, validate_uuid};
use chrono::Utc;
use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct FlashcardSet {
    pub id: String,
    pub user_id: String,
    pub title: String,
    pub description: Option<String>,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Flashcard {
    pub id: String,
    pub set_id: String,
    pub front: String,
    pub back: String,
    pub created_at: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct CreateFlashcardSetRequest {
    pub user_id: String,
    pub title: String,
    pub description: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct CreateFlashcardRequest {
    pub set_id: String,
    pub front: String,
    pub back: String,
}

pub struct FlashcardService {
    storage: HybridStorage,
}

impl FlashcardService {
    pub fn new(storage: HybridStorage) -> Self {
        Self { storage }
    }

    /// Create a new flashcard set
    pub async fn create_set(&self, request: CreateFlashcardSetRequest) -> AppResult<FlashcardSet> {
        validate_uuid(&request.user_id, "User ID")?;
        validate_not_empty(&request.title, "Set title")?;

        let set = FlashcardSet {
            id: Uuid::new_v4().to_string(),
            user_id: request.user_id.clone(),
            title: request.title.clone(),
            description: request.description.clone(),
            created_at: Utc::now().to_rfc3339(),
            updated_at: Utc::now().to_rfc3339(),
        };

        // Try to save to Supabase if online
        if self.storage.is_online().await {
            if let Some(supabase) = self.storage.supabase() {
                let data = serde_json::json!({
                    "id": set.id,
                    "user_id": set.user_id,
                    "title": set.title,
                    "description": set.description,
                    "created_at": set.created_at,
                    "updated_at": set.updated_at,
                });

                supabase
                    .insert("flashcard_sets", &data.to_string())
                    .await?
                    .execute()
                    .await
                    .map_err(|e| AppError::Supabase(format!("Failed to create set: {}", e)))?;
            }
        }

        // Save locally
        self.storage.sqlite().execute(move |conn| {
            conn.execute(
                "INSERT INTO flashcard_sets 
                 (id, user_id, title, description, created_at, updated_at, synced, dirty)
                 VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)",
                rusqlite::params![
                    &set.id,
                    &set.user_id,
                    &set.title,
                    &set.description,
                    &set.created_at,
                    &set.updated_at,
                    if self.storage.is_online().await { 1 } else { 0 },
                    if self.storage.is_online().await { 0 } else { 1 },
                ],
            )?;
            Ok(())
        }).await?;

        Ok(set)
    }

    /// Get all flashcard sets for a user
    pub async fn get_sets(&self, user_id: &str) -> AppResult<Vec<FlashcardSet>> {
        validate_uuid(user_id, "User ID")?;

        // Try Supabase first if online
        if self.storage.is_online().await {
            if let Some(supabase) = self.storage.supabase() {
                let response = supabase
                    .select("flashcard_sets")
                    .await?
                    .eq("user_id", user_id)
                    .execute()
                    .await
                    .map_err(|e| AppError::Supabase(format!("Failed to fetch sets: {}", e)))?;

                let body = response.text().await?;
                let sets: Vec<FlashcardSet> = serde_json::from_str(&body)?;
                return Ok(sets);
            }
        }

        // Fallback to local
        let user_id = user_id.to_string();
        self.storage.sqlite().execute(move |conn| {
            let mut stmt = conn.prepare(
                "SELECT id, user_id, title, description, created_at, updated_at
                 FROM flashcard_sets
                 WHERE user_id = ?1
                 ORDER BY updated_at DESC"
            )?;

            let sets = stmt
                .query_map([&user_id], |row| {
                    Ok(FlashcardSet {
                        id: row.get(0)?,
                        user_id: row.get(1)?,
                        title: row.get(2)?,
                        description: row.get(3)?,
                        created_at: row.get(4)?,
                        updated_at: row.get(5)?,
                    })
                })?
                .collect::<Result<Vec<_>, _>>()?;

            Ok(sets)
        }).await
    }

    /// Delete a flashcard set
    pub async fn delete_set(&self, set_id: &str) -> AppResult<()> {
        validate_uuid(set_id, "Set ID")?;

        // Try Supabase if online
        if self.storage.is_online().await {
            if let Some(supabase) = self.storage.supabase() {
                supabase
                    .delete("flashcard_sets")
                    .await?
                    .eq("id", set_id)
                    .execute()
                    .await
                    .map_err(|e| AppError::Supabase(format!("Failed to delete set: {}", e)))?;
            }
        }

        // Delete locally
        let set_id = set_id.to_string();
        self.storage.sqlite().execute(move |conn| {
            conn.execute("DELETE FROM flashcard_sets WHERE id = ?1", [&set_id])?;
            Ok(())
        }).await
    }

    /// Add a flashcard to a set
    pub async fn add_flashcard(&self, request: CreateFlashcardRequest) -> AppResult<Flashcard> {
        validate_uuid(&request.set_id, "Set ID")?;
        let front = validate_flashcard_content(&request.front, "Front")?;
        let back = validate_flashcard_content(&request.back, "Back")?;

        let flashcard = Flashcard {
            id: Uuid::new_v4().to_string(),
            set_id: request.set_id.clone(),
            front,
            back,
            created_at: Utc::now().to_rfc3339(),
        };

        // Try Supabase if online
        if self.storage.is_online().await {
            if let Some(supabase) = self.storage.supabase() {
                let data = serde_json::json!({
                    "id": flashcard.id,
                    "set_id": flashcard.set_id,
                    "front": flashcard.front,
                    "back": flashcard.back,
                    "created_at": flashcard.created_at,
                });

                supabase
                    .insert("flashcards", &data.to_string())
                    .await?
                    .execute()
                    .await
                    .map_err(|e| AppError::Supabase(format!("Failed to add flashcard: {}", e)))?;
            }
        }

        // Save locally
        self.storage.sqlite().execute(move |conn| {
            conn.execute(
                "INSERT INTO flashcards (id, set_id, front, back, created_at, synced, dirty)
                 VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)",
                rusqlite::params![
                    &flashcard.id,
                    &flashcard.set_id,
                    &flashcard.front,
                    &flashcard.back,
                    &flashcard.created_at,
                    if self.storage.is_online().await { 1 } else { 0 },
                    if self.storage.is_online().await { 0 } else { 1 },
                ],
            )?;
            Ok(())
        }).await?;

        Ok(flashcard)
    }

    /// Get all flashcards in a set
    pub async fn get_flashcards(&self, set_id: &str) -> AppResult<Vec<Flashcard>> {
        validate_uuid(set_id, "Set ID")?;

        // Try Supabase first if online
        if self.storage.is_online().await {
            if let Some(supabase) = self.storage.supabase() {
                let response = supabase
                    .select("flashcards")
                    .await?
                    .eq("set_id", set_id)
                    .execute()
                    .await
                    .map_err(|e| AppError::Supabase(format!("Failed to fetch flashcards: {}", e)))?;

                let body = response.text().await?;
                let flashcards: Vec<Flashcard> = serde_json::from_str(&body)?;
                return Ok(flashcards);
            }
        }

        // Fallback to local
        let set_id = set_id.to_string();
        self.storage.sqlite().execute(move |conn| {
            let mut stmt = conn.prepare(
                "SELECT id, set_id, front, back, created_at
                 FROM flashcards
                 WHERE set_id = ?1
                 ORDER BY created_at ASC"
            )?;

            let flashcards = stmt
                .query_map([&set_id], |row| {
                    Ok(Flashcard {
                        id: row.get(0)?,
                        set_id: row.get(1)?,
                        front: row.get(2)?,
                        back: row.get(3)?,
                        created_at: row.get(4)?,
                    })
                })?
                .collect::<Result<Vec<_>, _>>()?;

            Ok(flashcards)
        }).await
    }

    /// Delete a flashcard
    pub async fn delete_flashcard(&self, flashcard_id: &str) -> AppResult<()> {
        validate_uuid(flashcard_id, "Flashcard ID")?;

        // Try Supabase if online
        if self.storage.is_online().await {
            if let Some(supabase) = self.storage.supabase() {
                supabase
                    .delete("flashcards")
                    .await?
                    .eq("id", flashcard_id)
                    .execute()
                    .await
                    .map_err(|e| AppError::Supabase(format!("Failed to delete flashcard: {}", e)))?;
            }
        }

        // Delete locally
        let flashcard_id = flashcard_id.to_string();
        self.storage.sqlite().execute(move |conn| {
            conn.execute("DELETE FROM flashcards WHERE id = ?1", [&flashcard_id])?;
            Ok(())
        }).await
    }
}

