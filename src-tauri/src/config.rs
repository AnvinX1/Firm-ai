// Configuration Module
// OpenRouter AI model configuration and recommendations for optimal RAG performance

use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ModelConfig {
    /// Model for generating embeddings (must be consistent for vector compatibility)
    pub embedding_model: String,
    /// Model for general chat and tutoring
    pub chat_model: String,
    /// Model for IRAC legal analysis
    pub irac_model: String,
    /// Model for quiz generation (better at structured output)
    pub quiz_model: String,
    /// Model for mock test generation
    pub mock_test_model: String,
    /// Fallback model if primary fails
    pub fallback_model: String,
}

impl Default for ModelConfig {
    fn default() -> Self {
        Self {
            // OpenAI text-embedding-3-small: 1536 dimensions, best price/performance for embeddings
            embedding_model: "openai/text-embedding-3-small".to_string(),
            
            // Gemini 2.0 Flash: Fast, good quality, low cost for real-time interactions
            chat_model: "google/gemini-2.0-flash-exp".to_string(),
            
            // Gemini 2.0 Flash: Good at legal analysis with structured output
            irac_model: "google/gemini-2.0-flash-exp".to_string(),
            
            // Claude 3.5 Sonnet: Better at following strict JSON schemas for quizzes
            quiz_model: "anthropic/claude-3.5-sonnet".to_string(),
            
            // Claude 3.5 Sonnet: Complex multi-topic test generation
            mock_test_model: "anthropic/claude-3.5-sonnet".to_string(),
            
            // LLaMA 3.1 70B: Good fallback, widely available
            fallback_model: "meta-llama/llama-3.1-70b-instruct".to_string(),
        }
    }
}

impl ModelConfig {
    /// Create from environment variables (allows override)
    pub fn from_env() -> Self {
        Self {
            embedding_model: std::env::var("EMBEDDING_MODEL")
                .unwrap_or_else(|_| "openai/text-embedding-3-small".to_string()),
            chat_model: std::env::var("CHAT_MODEL")
                .unwrap_or_else(|_| "google/gemini-2.0-flash-exp".to_string()),
            irac_model: std::env::var("IRAC_MODEL")
                .unwrap_or_else(|_| "google/gemini-2.0-flash-exp".to_string()),
            quiz_model: std::env::var("QUIZ_MODEL")
                .unwrap_or_else(|_| "anthropic/claude-3.5-sonnet".to_string()),
            mock_test_model: std::env::var("MOCK_TEST_MODEL")
                .unwrap_or_else(|_| "anthropic/claude-3.5-sonnet".to_string()),
            fallback_model: std::env::var("FALLBACK_MODEL")
                .unwrap_or_else(|_| "meta-llama/llama-3.1-70b-instruct".to_string()),
        }
    }

    /// Get recommended temperature for a task
    pub fn temperature_for_task(&self, task: &str) -> f64 {
        match task {
            "irac" => 0.3,           // Low temp for consistent legal analysis
            "quiz" => 0.5,           // Medium-low for structured questions
            "mock_test" => 0.5,      // Medium-low for exam generation
            "chat" => 0.7,           // Higher for conversational responses
            "tutor" => 0.7,          // Natural tutoring conversations
            _ => 0.5,                // Default medium temperature
        }
    }

    /// Get recommended max tokens for a task
    pub fn max_tokens_for_task(&self, task: &str) -> u32 {
        match task {
            "embedding" => 0,        // N/A for embeddings
            "irac" => 2000,          // IRAC analysis is concise
            "quiz" => 3000,          // Multiple questions with explanations
            "mock_test" => 4000,     // Full exam with many questions
            "chat" => 1000,          // Short conversational responses
            "tutor" => 1500,         // Detailed tutoring explanations
            _ => 2000,               // Default
        }
    }

    /// Get model for specific task
    pub fn model_for_task(&self, task: &str) -> String {
        match task {
            "embedding" => self.embedding_model.clone(),
            "irac" => self.irac_model.clone(),
            "quiz" => self.quiz_model.clone(),
            "mock_test" => self.mock_test_model.clone(),
            "chat" | "tutor" => self.chat_model.clone(),
            _ => self.chat_model.clone(),
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AppConfig {
    /// OpenRouter API key
    pub openrouter_api_key: Option<String>,
    /// Supabase URL
    pub supabase_url: Option<String>,
    /// Supabase API key
    pub supabase_key: Option<String>,
    /// Database path for SQLite
    pub database_path: String,
    /// Model configuration
    pub models: ModelConfig,
    /// Sync interval in seconds
    pub sync_interval_seconds: u64,
    /// Enable offline mode
    pub offline_mode: bool,
}

impl Default for AppConfig {
    fn default() -> Self {
        Self {
            openrouter_api_key: std::env::var("OPENROUTER_API_KEY").ok(),
            supabase_url: std::env::var("SUPABASE_URL").ok(),
            supabase_key: std::env::var("SUPABASE_KEY").ok(),
            database_path: "firm_ai.db".to_string(),
            models: ModelConfig::default(),
            sync_interval_seconds: 300, // 5 minutes

            offline_mode: true, // Force local storage as requested
        }
    }
}

impl AppConfig {
    /// Load configuration from environment
    pub fn from_env() -> Self {
        Self {
            openrouter_api_key: std::env::var("OPENROUTER_API_KEY").ok(),
            supabase_url: std::env::var("SUPABASE_URL")
                .or_else(|_| std::env::var("NEXT_PUBLIC_SUPABASE_URL"))
                .ok(),
            supabase_key: std::env::var("SUPABASE_KEY")
                .or_else(|_| std::env::var("NEXT_PUBLIC_SUPABASE_ANON_KEY"))
                .ok(),
            database_path: std::env::var("DATABASE_PATH")
                .unwrap_or_else(|_| "firm_ai.db".to_string()),
            models: ModelConfig::from_env(),
            sync_interval_seconds: std::env::var("SYNC_INTERVAL")
                .ok()
                .and_then(|s| s.parse().ok())
                .unwrap_or(300),
            offline_mode: std::env::var("OFFLINE_MODE")
                .ok()
                .and_then(|s| s.parse().ok())
                .unwrap_or(true), // Default to true for local storage
        }
    }

    /// Validate configuration
    pub fn validate(&self) -> Result<(), String> {
        if self.openrouter_api_key.is_none() {
            return Err("OPENROUTER_API_KEY is required".to_string());
        }

        // Supabase is optional (can run fully offline)
        if !self.offline_mode {
            if self.supabase_url.is_none() || self.supabase_key.is_none() {
                eprintln!("Warning: Supabase credentials not set. Running in offline mode.");
            }
        }

        Ok(())
    }
}

/// Model performance characteristics
#[derive(Debug)]
pub struct ModelPerformance {
    pub speed: ModelSpeed,
    pub quality: ModelQuality,
    pub cost: ModelCost,
}

#[derive(Debug)]
pub enum ModelSpeed {
    Fast,      // < 1s response time
    Medium,    // 1-3s response time
    Slow,      // > 3s response time
}

#[derive(Debug)]
pub enum ModelQuality {
    High,      // Best quality output
    Good,      // Good quality, slight compromise
    Adequate,  // Acceptable for most tasks
}

#[derive(Debug)]
pub enum ModelCost {
    Low,       // < $0.001 per request
    Medium,    // $0.001-$0.01 per request
    High,      // > $0.01 per request
}

/// Get performance characteristics for a model
pub fn model_performance(model_name: &str) -> ModelPerformance {
    match model_name {
        "google/gemini-2.0-flash-exp" => ModelPerformance {
            speed: ModelSpeed::Fast,
            quality: ModelQuality::Good,
            cost: ModelCost::Low,
        },
        "anthropic/claude-3.5-sonnet" => ModelPerformance {
            speed: ModelSpeed::Medium,
            quality: ModelQuality::High,
            cost: ModelCost::Medium,
        },
        "meta-llama/llama-3.1-70b-instruct" => ModelPerformance {
            speed: ModelSpeed::Medium,
            quality: ModelQuality::Good,
            cost: ModelCost::Low,
        },
        "openai/text-embedding-3-small" => ModelPerformance {
            speed: ModelSpeed::Fast,
            quality: ModelQuality::High,
            cost: ModelCost::Low,
        },
        _ => ModelPerformance {
            speed: ModelSpeed::Medium,
            quality: ModelQuality::Good,
            cost: ModelCost::Medium,
        },
    }
}

