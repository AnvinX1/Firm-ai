/**
 * Study Plans Module
 * Manages study plans, tasks, and progress tracking
 */

use crate::db::HybridStorage;
use crate::error::{AppError, AppResult};
use crate::validation::{validate_not_empty, validate_percentage, validate_study_plan_dates, validate_uuid};
use chrono::Utc;
use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct StudyPlan {
    pub id: String,
    pub user_id: String,
    pub title: String,
    pub description: Option<String>,
    pub start_date: Option<String>,
    pub end_date: Option<String>,
    pub progress: f64,
    pub tasks: Vec<StudyTask>,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct StudyTask {
    pub id: String,
    pub title: String,
    pub description: Option<String>,
    pub completed: bool,
    pub due_date: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct CreateStudyPlanRequest {
    pub user_id: String,
    pub title: String,
    pub description: Option<String>,
    pub start_date: Option<String>,
    pub end_date: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct UpdateProgressRequest {
    pub plan_id: String,
    pub progress: f64,
    pub tasks: Option<Vec<StudyTask>>,
}

pub struct StudyPlanService {
    storage: HybridStorage,
}

impl StudyPlanService {
    pub fn new(storage: HybridStorage) -> Self {
        Self { storage }
    }

    /// Create a new study plan
    pub async fn create_plan(&self, request: CreateStudyPlanRequest) -> AppResult<StudyPlan> {
        validate_uuid(&request.user_id, "User ID")?;
        validate_not_empty(&request.title, "Plan title")?;

        // Validate dates if provided
        if let (Some(start), Some(end)) = (&request.start_date, &request.end_date) {
            validate_study_plan_dates(start, end)?;
        }

        let plan = StudyPlan {
            id: Uuid::new_v4().to_string(),
            user_id: request.user_id.clone(),
            title: request.title.clone(),
            description: request.description.clone(),
            start_date: request.start_date.clone(),
            end_date: request.end_date.clone(),
            progress: 0.0,
            tasks: Vec::new(),
            created_at: Utc::now().to_rfc3339(),
            updated_at: Utc::now().to_rfc3339(),
        };

        // Try to save to Supabase if online
        if self.storage.is_online().await {
            if let Some(supabase) = self.storage.supabase() {
                let tasks_json = serde_json::to_string(&plan.tasks)?;
                let data = serde_json::json!({
                    "id": plan.id,
                    "user_id": plan.user_id,
                    "title": plan.title,
                    "description": plan.description,
                    "start_date": plan.start_date,
                    "end_date": plan.end_date,
                    "progress": plan.progress,
                    "tasks": tasks_json,
                    "created_at": plan.created_at,
                    "updated_at": plan.updated_at,
                });

                supabase
                    .insert("study_plans", &data.to_string())
                    .await?
                    .execute()
                    .await
                    .map_err(|e| AppError::Supabase(format!("Failed to create plan: {}", e)))?;
            }
        }

        // Save locally
        let tasks_json = serde_json::to_string(&plan.tasks)?;
        self.storage.sqlite().execute(move |conn| {
            conn.execute(
                "INSERT INTO study_plans 
                 (id, user_id, title, description, start_date, end_date, progress, tasks, created_at, updated_at, synced, dirty)
                 VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12)",
                rusqlite::params![
                    &plan.id,
                    &plan.user_id,
                    &plan.title,
                    &plan.description,
                    &plan.start_date,
                    &plan.end_date,
                    plan.progress,
                    &tasks_json,
                    &plan.created_at,
                    &plan.updated_at,
                    if self.storage.is_online().await { 1 } else { 0 },
                    if self.storage.is_online().await { 0 } else { 1 },
                ],
            )?;
            Ok(())
        }).await?;

        Ok(plan)
    }

    /// Get all study plans for a user
    pub async fn get_plans(&self, user_id: &str) -> AppResult<Vec<StudyPlan>> {
        validate_uuid(user_id, "User ID")?;

        // Try Supabase first if online
        if self.storage.is_online().await {
            if let Some(supabase) = self.storage.supabase() {
                let response = supabase
                    .select("study_plans")
                    .await?
                    .eq("user_id", user_id)
                    .execute()
                    .await
                    .map_err(|e| AppError::Supabase(format!("Failed to fetch plans: {}", e)))?;

                let body = response.text().await?;
                let plans: Vec<StudyPlan> = serde_json::from_str(&body)?;
                return Ok(plans);
            }
        }

        // Fallback to local
        let user_id = user_id.to_string();
        self.storage.sqlite().execute(move |conn| {
            let mut stmt = conn.prepare(
                "SELECT id, user_id, title, description, start_date, end_date, progress, tasks, created_at, updated_at
                 FROM study_plans
                 WHERE user_id = ?1
                 ORDER BY updated_at DESC"
            )?;

            let plans = stmt
                .query_map([&user_id], |row| {
                    let tasks_json: String = row.get(7)?;
                    let tasks: Vec<StudyTask> = serde_json::from_str(&tasks_json).unwrap_or_default();

                    Ok(StudyPlan {
                        id: row.get(0)?,
                        user_id: row.get(1)?,
                        title: row.get(2)?,
                        description: row.get(3)?,
                        start_date: row.get(4)?,
                        end_date: row.get(5)?,
                        progress: row.get(6)?,
                        tasks,
                        created_at: row.get(8)?,
                        updated_at: row.get(9)?,
                    })
                })?
                .collect::<Result<Vec<_>, _>>()?;

            Ok(plans)
        }).await
    }

    /// Get a specific study plan
    pub async fn get_plan(&self, plan_id: &str) -> AppResult<StudyPlan> {
        validate_uuid(plan_id, "Plan ID")?;

        // Try Supabase first if online
        if self.storage.is_online().await {
            if let Some(supabase) = self.storage.supabase() {
                let response = supabase
                    .select("study_plans")
                    .await?
                    .eq("id", plan_id)
                    .execute()
                    .await
                    .map_err(|e| AppError::Supabase(format!("Failed to fetch plan: {}", e)))?;

                let body = response.text().await?;
                let mut plans: Vec<StudyPlan> = serde_json::from_str(&body)?;
                return plans.pop().ok_or_else(|| AppError::NotFound("Plan not found".to_string()));
            }
        }

        // Fallback to local
        let plan_id = plan_id.to_string();
        self.storage.sqlite().execute(move |conn| {
            let mut stmt = conn.prepare(
                "SELECT id, user_id, title, description, start_date, end_date, progress, tasks, created_at, updated_at
                 FROM study_plans
                 WHERE id = ?1"
            )?;

            let plan = stmt.query_row([&plan_id], |row| {
                let tasks_json: String = row.get(7)?;
                let tasks: Vec<StudyTask> = serde_json::from_str(&tasks_json).unwrap_or_default();

                Ok(StudyPlan {
                    id: row.get(0)?,
                    user_id: row.get(1)?,
                    title: row.get(2)?,
                    description: row.get(3)?,
                    start_date: row.get(4)?,
                    end_date: row.get(5)?,
                    progress: row.get(6)?,
                    tasks,
                    created_at: row.get(8)?,
                    updated_at: row.get(9)?,
                })
            }).map_err(|_| AppError::NotFound("Plan not found".to_string()))?;

            Ok(plan)
        }).await
    }

    /// Update study plan progress
    pub async fn update_progress(&self, request: UpdateProgressRequest) -> AppResult<StudyPlan> {
        validate_uuid(&request.plan_id, "Plan ID")?;
        validate_percentage(request.progress, "Progress")?;

        // Get existing plan
        let mut plan = self.get_plan(&request.plan_id).await?;

        // Update fields
        plan.progress = request.progress;
        if let Some(tasks) = request.tasks {
            plan.tasks = tasks;
        }
        plan.updated_at = Utc::now().to_rfc3339();

        // Try to update in Supabase if online
        if self.storage.is_online().await {
            if let Some(supabase) = self.storage.supabase() {
                let tasks_json = serde_json::to_string(&plan.tasks)?;
                let data = serde_json::json!({
                    "progress": plan.progress,
                    "tasks": tasks_json,
                    "updated_at": plan.updated_at,
                });

                supabase
                    .update("study_plans", &data.to_string())
                    .await?
                    .eq("id", &plan.id)
                    .execute()
                    .await
                    .map_err(|e| AppError::Supabase(format!("Failed to update plan: {}", e)))?;
            }
        }

        // Update locally
        let tasks_json = serde_json::to_string(&plan.tasks)?;
        self.storage.sqlite().execute(move |conn| {
            conn.execute(
                "UPDATE study_plans 
                 SET progress = ?1, tasks = ?2, updated_at = ?3, dirty = ?4
                 WHERE id = ?5",
                rusqlite::params![
                    plan.progress,
                    &tasks_json,
                    &plan.updated_at,
                    if self.storage.is_online().await { 0 } else { 1 },
                    &plan.id,
                ],
            )?;
            Ok(())
        }).await?;

        Ok(plan)
    }

    /// Delete a study plan
    pub async fn delete_plan(&self, plan_id: &str) -> AppResult<()> {
        validate_uuid(plan_id, "Plan ID")?;

        // Try Supabase if online
        if self.storage.is_online().await {
            if let Some(supabase) = self.storage.supabase() {
                supabase
                    .delete("study_plans")
                    .await?
                    .eq("id", plan_id)
                    .execute()
                    .await
                    .map_err(|e| AppError::Supabase(format!("Failed to delete plan: {}", e)))?;
            }
        }

        // Delete locally
        let plan_id = plan_id.to_string();
        self.storage.sqlite().execute(move |conn| {
            conn.execute("DELETE FROM study_plans WHERE id = ?1", [&plan_id])?;
            Ok(())
        }).await
    }
}

