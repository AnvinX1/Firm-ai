/**
 * Error types for FIRM AI Tauri application
 * Provides comprehensive error handling across all modules
 */

use thiserror::Error;

#[derive(Error, Debug)]
pub enum AppError {
    // Database errors
    #[error("Database error: {0}")]
    Database(String),
    
    #[error("Supabase error: {0}")]
    Supabase(String),
    
    #[error("SQLite error: {0}")]
    Sqlite(#[from] rusqlite::Error),
    
    #[error("Tokio SQLite error: {0}")]
    TokioSqlite(#[from] tokio_rusqlite::Error),
    
    // Network errors
    #[error("Network request failed: {0}")]
    Network(#[from] reqwest::Error),
    
    #[error("API error: {0}")]
    Api(String),
    
    // LLM/AI errors
    #[error("LLM service error: {0}")]
    Llm(String),
    
    #[error("OpenRouter API error (status {status}): {message}")]
    OpenRouter {
        status: u16,
        message: String,
    },
    
    #[error("Embedding generation failed: {0}")]
    Embedding(String),
    
    // RAG errors
    #[error("RAG service error: {0}")]
    Rag(String),
    
    #[error("Document processing error: {0}")]
    DocumentProcessing(String),
    
    #[error("Vector search error: {0}")]
    VectorSearch(String),
    
    // Document errors
    #[error("PDF extraction failed: {0}")]
    PdfExtraction(String),
    
    #[error("Text chunking error: {0}")]
    TextChunking(String),
    
    // Validation errors
    #[error("Validation error: {0}")]
    Validation(String),
    
    #[error("Invalid input: {0}")]
    InvalidInput(String),
    
    #[error("Missing required field: {0}")]
    MissingField(String),
    
    // Authentication errors
    #[error("Authentication error: {0}")]
    Auth(String),
    
    #[error("Unauthorized: {0}")]
    Unauthorized(String),
    
    // Sync errors
    #[error("Sync error: {0}")]
    Sync(String),
    
    #[error("Offline: operation requires network connection")]
    Offline,
    
    #[error("Sync conflict: {0}")]
    SyncConflict(String),
    
    // File system errors
    #[error("File system error: {0}")]
    FileSystem(#[from] std::io::Error),
    
    #[error("File not found: {0}")]
    FileNotFound(String),
    
    // Serialization errors
    #[error("JSON serialization error: {0}")]
    JsonSerialization(#[from] serde_json::Error),
    
    // Configuration errors
    #[error("Configuration error: {0}")]
    Config(String),
    
    #[error("Missing environment variable: {0}")]
    MissingEnv(String),
    
    // Generic errors
    #[error("Internal error: {0}")]
    Internal(String),
    
    #[error("Not found: {0}")]
    NotFound(String),
    
    #[error("Operation failed: {0}")]
    OperationFailed(String),
}

impl AppError {
    /// Convert error to user-friendly message
    pub fn user_message(&self) -> String {
        match self {
            Self::Database(_) | Self::Sqlite(_) | Self::TokioSqlite(_) => {
                "A database error occurred. Please try again.".to_string()
            }
            Self::Supabase(_) => {
                "Unable to connect to the cloud service. Please check your internet connection.".to_string()
            }
            Self::Network(_) => {
                "Network connection failed. Please check your internet connection.".to_string()
            }
            Self::Api(msg) | Self::Llm(msg) => {
                format!("Service error: {}", msg)
            }
            Self::OpenRouter { message, .. } => {
                format!("AI service error: {}", message)
            }
            Self::Embedding(_) => {
                "Failed to process document embedding. Please try again.".to_string()
            }
            Self::Rag(_) | Self::VectorSearch(_) => {
                "Search service error. Please try again.".to_string()
            }
            Self::DocumentProcessing(_) | Self::PdfExtraction(_) => {
                "Failed to process document. Please ensure the file is a valid PDF.".to_string()
            }
            Self::TextChunking(_) => {
                "Failed to process document text. Please try again.".to_string()
            }
            Self::Validation(msg) | Self::InvalidInput(msg) => {
                format!("Invalid input: {}", msg)
            }
            Self::MissingField(field) => {
                format!("Required field missing: {}", field)
            }
            Self::Auth(_) | Self::Unauthorized(_) => {
                "Authentication required. Please log in.".to_string()
            }
            Self::Sync(_) => {
                "Synchronization error. Your changes have been saved locally.".to_string()
            }
            Self::Offline => {
                "This operation requires an internet connection. Your changes have been saved locally.".to_string()
            }
            Self::SyncConflict(_) => {
                "A conflict was detected during sync. Please refresh and try again.".to_string()
            }
            Self::FileSystem(_) | Self::FileNotFound(_) => {
                "File operation failed. Please check file permissions.".to_string()
            }
            Self::JsonSerialization(_) => {
                "Data format error. Please try again.".to_string()
            }
            Self::Config(_) | Self::MissingEnv(_) => {
                "Application configuration error. Please contact support.".to_string()
            }
            Self::Internal(_) => {
                "An unexpected error occurred. Please try again.".to_string()
            }
            Self::NotFound(msg) => {
                format!("Not found: {}", msg)
            }
            Self::OperationFailed(msg) => {
                format!("Operation failed: {}", msg)
            }
        }
    }
}

/// Convert AppError to String for Tauri command results
impl From<AppError> for String {
    fn from(error: AppError) -> Self {
        error.to_string()
    }
}

/// Result type alias for application operations
pub type AppResult<T> = Result<T, AppError>;

