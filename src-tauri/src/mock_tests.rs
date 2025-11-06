/**
 * Mock Tests Module
 * Handles test generation, storage, and result tracking
 */

use crate::db::HybridStorage;
use crate::error::{AppError, AppResult};
use crate::llm::{LLMService, Message};
use crate::rag::{RAGService, SearchOptions};
use crate::validation::{validate_not_empty, validate_positive_integer, validate_score, validate_uuid};
use chrono::Utc;
use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct MockTest {
    pub id: String,
    pub user_id: String,
    pub title: String,
    pub description: Option<String>,
    pub questions: Vec<TestQuestion>,
    pub created_at: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct TestQuestion {
    pub question: String,
    pub options: Vec<String>,
    pub correct_answer: usize,
    pub explanation: String,
    pub topic: Option<String>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct TestResult {
    pub id: String,
    pub user_id: String,
    pub test_id: String,
    pub score: f64,
    pub total_questions: i32,
    pub answers: Vec<UserAnswer>,
    pub completed_at: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct UserAnswer {
    pub question_index: usize,
    pub selected_answer: usize,
    pub is_correct: bool,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct GenerateMockTestRequest {
    pub user_id: String,
    pub topics: Vec<String>,
    pub num_questions: i32,
    pub include_rag_context: Option<bool>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct SubmitTestResultRequest {
    pub user_id: String,
    pub test_id: String,
    pub answers: Vec<UserAnswer>,
}

pub struct MockTestService {
    storage: HybridStorage,
    llm_service: LLMService,
    rag_service: RAGService,
}

impl MockTestService {
    pub fn new(storage: HybridStorage, llm_service: LLMService, rag_service: RAGService) -> Self {
        Self {
            storage,
            llm_service,
            rag_service,
        }
    }

    /// Generate a mock test using LLM and RAG
    pub async fn generate_test(&self, request: GenerateMockTestRequest) -> AppResult<MockTest> {
        validate_uuid(&request.user_id, "User ID")?;
        validate_positive_integer(request.num_questions, "Number of questions")?;

        if request.topics.is_empty() {
            return Err(AppError::Validation("At least one topic is required".to_string()));
        }

        // Search for relevant context using RAG if enabled
        let mut context_info = String::new();
        if request.include_rag_context.unwrap_or(true) {
            for topic in &request.topics {
                let search_results = self
                    .rag_service
                    .search(
                        topic,
                        SearchOptions {
                            limit: Some(2),
                            user_id: Some(request.user_id.clone()),
                            include_knowledge_base: Some(true),
                            ..Default::default()
                        },
                    )
                    .await
                    .unwrap_or_default();

                if !search_results.is_empty() {
                    context_info.push_str(&format!(
                        "\n\n{}:\n{}",
                        topic,
                        self.rag_service.format_context_for_llm(&search_results)
                    ));
                }
            }
        }

        // Generate questions using LLM
        let system_prompt = "You are an expert legal AI assistant specializing in creating comprehensive law school mock examinations.
Your task is to create realistic exam questions that test deep understanding of legal principles across multiple topics.

Guidelines:
- Create challenging questions appropriate for law school level
- Provide 4 multiple-choice options (A, B, C, D)
- Ensure clear, unambiguous correct answers
- Include detailed explanations that aid learning
- Cover multiple legal principles and applications
- Use realistic case scenarios
- Format responses as JSON";

        let user_prompt = format!(
            "Create a comprehensive mock law school exam with {} questions covering the following topics:
{}{}

Provide your response as a JSON object with this structure:
{{
  \"title\": \"Descriptive exam title\",
  \"questions\": [
    {{
      \"question\": \"The question text\",
      \"options\": [\"Option A\", \"Option B\", \"Option C\", \"Option D\"],
      \"correct_answer\": 0,
      \"explanation\": \"Why this answer is correct\",
      \"topic\": \"Contract Law\"
    }}
  ]
}}",
            request.num_questions,
            request.topics.iter().enumerate().map(|(i, t)| format!("{}. {}", i + 1, t)).collect::<Vec<_>>().join("\n"),
            context_info
        );

        let messages = vec![
            Message {
                role: "system".to_string(),
                content: system_prompt.to_string(),
            },
            Message {
                role: "user".to_string(),
                content: user_prompt,
            },
        ];

        let response = self
            .llm_service
            .chat(messages, crate::llm::ChatOptions {
                temperature: Some(0.5),
                max_tokens: Some(4000),
                model: None,
            })
            .await?;

        // Parse JSON response
        let test_data: serde_json::Value = self.parse_json_response(&response)?;

        let title = test_data["title"]
            .as_str()
            .unwrap_or("Mock Law Exam")
            .to_string();

        let questions: Vec<TestQuestion> = test_data["questions"]
            .as_array()
            .ok_or_else(|| AppError::Llm("Invalid questions format".to_string()))?
            .iter()
            .map(|q| TestQuestion {
                question: q["question"].as_str().unwrap_or("").to_string(),
                options: q["options"]
                    .as_array()
                    .unwrap_or(&Vec::new())
                    .iter()
                    .map(|o| o.as_str().unwrap_or("").to_string())
                    .collect(),
                correct_answer: q["correct_answer"].as_u64().unwrap_or(0) as usize,
                explanation: q["explanation"].as_str().unwrap_or("").to_string(),
                topic: q["topic"].as_str().map(|s| s.to_string()),
            })
            .collect();

        let test = MockTest {
            id: Uuid::new_v4().to_string(),
            user_id: request.user_id.clone(),
            title,
            description: Some(format!("Mock test covering: {}", request.topics.join(", "))),
            questions,
            created_at: Utc::now().to_rfc3339(),
        };

        // Save test to storage
        self.save_test(&test).await?;

        Ok(test)
    }

    /// Save a mock test to storage
    async fn save_test(&self, test: &MockTest) -> AppResult<()> {
        let questions_json = serde_json::to_string(&test.questions)?;

        // Try Supabase if online
        if self.storage.is_online().await {
            if let Some(supabase) = self.storage.supabase() {
                let data = serde_json::json!({
                    "id": test.id,
                    "user_id": test.user_id,
                    "title": test.title,
                    "description": test.description,
                    "questions": questions_json,
                    "created_at": test.created_at,
                });

                supabase
                    .insert("mock_tests", &data.to_string())
                    .await?
                    .execute()
                    .await
                    .map_err(|e| AppError::Supabase(format!("Failed to save test: {}", e)))?;
            }
        }

        // Save locally
        self.storage.sqlite().execute(move |conn| {
            conn.execute(
                "INSERT INTO mock_tests (id, user_id, title, description, questions, created_at, synced, dirty)
                 VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)",
                rusqlite::params![
                    &test.id,
                    &test.user_id,
                    &test.title,
                    &test.description,
                    &questions_json,
                    &test.created_at,
                    if self.storage.is_online().await { 1 } else { 0 },
                    if self.storage.is_online().await { 0 } else { 1 },
                ],
            )?;
            Ok(())
        }).await
    }

    /// Get all mock tests for a user
    pub async fn get_tests(&self, user_id: &str) -> AppResult<Vec<MockTest>> {
        validate_uuid(user_id, "User ID")?;

        // Try Supabase first if online
        if self.storage.is_online().await {
            if let Some(supabase) = self.storage.supabase() {
                let response = supabase
                    .select("mock_tests")
                    .await?
                    .eq("user_id", user_id)
                    .execute()
                    .await
                    .map_err(|e| AppError::Supabase(format!("Failed to fetch tests: {}", e)))?;

                let body = response.text().await?;
                let tests: Vec<MockTest> = serde_json::from_str(&body)?;
                return Ok(tests);
            }
        }

        // Fallback to local
        let user_id = user_id.to_string();
        self.storage.sqlite().execute(move |conn| {
            let mut stmt = conn.prepare(
                "SELECT id, user_id, title, description, questions, created_at
                 FROM mock_tests
                 WHERE user_id = ?1
                 ORDER BY created_at DESC"
            )?;

            let tests = stmt
                .query_map([&user_id], |row| {
                    let questions_json: String = row.get(4)?;
                    let questions: Vec<TestQuestion> = serde_json::from_str(&questions_json).unwrap_or_default();

                    Ok(MockTest {
                        id: row.get(0)?,
                        user_id: row.get(1)?,
                        title: row.get(2)?,
                        description: row.get(3)?,
                        questions,
                        created_at: row.get(5)?,
                    })
                })?
                .collect::<Result<Vec<_>, _>>()?;

            Ok(tests)
        }).await
    }

    /// Submit test results
    pub async fn submit_result(&self, request: SubmitTestResultRequest) -> AppResult<TestResult> {
        validate_uuid(&request.user_id, "User ID")?;
        validate_uuid(&request.test_id, "Test ID")?;

        // Calculate score
        let total_questions = request.answers.len() as i32;
        let correct_answers = request.answers.iter().filter(|a| a.is_correct).count() as f64;
        let score = correct_answers;

        validate_score(score, total_questions)?;

        let result = TestResult {
            id: Uuid::new_v4().to_string(),
            user_id: request.user_id.clone(),
            test_id: request.test_id.clone(),
            score,
            total_questions,
            answers: request.answers.clone(),
            completed_at: Utc::now().to_rfc3339(),
        };

        // Save result
        let answers_json = serde_json::to_string(&result.answers)?;

        // Try Supabase if online
        if self.storage.is_online().await {
            if let Some(supabase) = self.storage.supabase() {
                let data = serde_json::json!({
                    "id": result.id,
                    "user_id": result.user_id,
                    "test_id": result.test_id,
                    "score": result.score,
                    "total_questions": result.total_questions,
                    "answers": answers_json,
                    "completed_at": result.completed_at,
                });

                supabase
                    .insert("test_results", &data.to_string())
                    .await?
                    .execute()
                    .await
                    .map_err(|e| AppError::Supabase(format!("Failed to save result: {}", e)))?;
            }
        }

        // Save locally
        self.storage.sqlite().execute(move |conn| {
            conn.execute(
                "INSERT INTO test_results (id, user_id, test_id, score, total_questions, answers, completed_at, synced, dirty)
                 VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9)",
                rusqlite::params![
                    &result.id,
                    &result.user_id,
                    &result.test_id,
                    result.score,
                    result.total_questions,
                    &answers_json,
                    &result.completed_at,
                    if self.storage.is_online().await { 1 } else { 0 },
                    if self.storage.is_online().await { 0 } else { 1 },
                ],
            )?;
            Ok(())
        }).await?;

        Ok(result)
    }

    /// Parse JSON response from LLM (handles markdown code blocks)
    fn parse_json_response(&self, response: &str) -> AppResult<serde_json::Value> {
        // Try direct parse
        if let Ok(val) = serde_json::from_str(response) {
            return Ok(val);
        }

        // Try to extract from markdown code blocks
        if let Some(caps) = regex::Regex::new(r"```json\n([\s\S]*?)```")
            .ok()
            .and_then(|re| re.captures(response))
        {
            if let Some(matched) = caps.get(1) {
                if let Ok(val) = serde_json::from_str(matched.as_str()) {
                    return Ok(val);
                }
            }
        }

        if let Some(caps) = regex::Regex::new(r"```\n([\s\S]*?)```")
            .ok()
            .and_then(|re| re.captures(response))
        {
            if let Some(matched) = caps.get(1) {
                if let Ok(val) = serde_json::from_str(matched.as_str()) {
                    return Ok(val);
                }
            }
        }

        Err(AppError::Llm("Failed to parse LLM response as JSON".to_string()))
    }
}

