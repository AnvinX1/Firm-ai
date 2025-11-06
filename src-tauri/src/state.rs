/**
 * Application State Management
 * Manages shared state across Tauri commands
 */

use crate::config::AppConfig;
use crate::db::HybridStorage;
use crate::error::{AppError, AppResult};
use crate::flashcards::FlashcardService;
use crate::llm::LLMService;
use crate::mock_tests::MockTestService;
use crate::rag::RAGService;
use crate::study_plans::StudyPlanService;
use crate::sync::SyncManager;
use std::sync::Arc;
use tokio::sync::Mutex;

/// Application state accessible from all Tauri commands
#[derive(Clone)]
pub struct AppState {
    /// Application configuration
    pub config: Arc<AppConfig>,
    /// Hybrid storage (SQLite + Supabase)
    pub storage: Arc<HybridStorage>,
    /// Sync manager for background synchronization
    pub sync_manager: Arc<SyncManager>,
    /// LLM service (lazily initialized)
    llm_service: Arc<Mutex<Option<LLMService>>>,
    /// RAG service (lazily initialized)
    rag_service: Arc<Mutex<Option<RAGService>>>,
    /// Flashcard service
    flashcard_service: Arc<Mutex<Option<FlashcardService>>>,
    /// Mock test service
    mock_test_service: Arc<Mutex<Option<MockTestService>>>,
    /// Study plan service
    study_plan_service: Arc<Mutex<Option<StudyPlanService>>>,
}

impl AppState {
    /// Create new app state
    pub fn new(
        config: AppConfig,
        storage: HybridStorage,
        sync_manager: SyncManager,
    ) -> Self {
        let storage = Arc::new(storage);
        let sync_manager = Arc::new(sync_manager);

        Self {
            config: Arc::new(config),
            storage: storage.clone(),
            sync_manager,
            llm_service: Arc::new(Mutex::new(None)),
            rag_service: Arc::new(Mutex::new(None)),
            flashcard_service: Arc::new(Mutex::new(None)),
            mock_test_service: Arc::new(Mutex::new(None)),
            study_plan_service: Arc::new(Mutex::new(None)),
        }
    }

    /// Get or create LLM service
    pub async fn llm_service(&self) -> AppResult<LLMService> {
        let mut service = self.llm_service.lock().await;
        
        if service.is_none() {
            let api_key = self
                .config
                .openrouter_api_key
                .clone()
                .ok_or_else(|| AppError::Config("OpenRouter API key not configured".to_string()))?;
            
            *service = Some(LLMService::new(api_key));
        }
        
        Ok(service.as_ref().unwrap().clone())
    }

    /// Get or create RAG service
    pub async fn rag_service(&self) -> AppResult<RAGService> {
        let mut service = self.rag_service.lock().await;
        
        if service.is_none() {
            let api_key = self
                .config
                .openrouter_api_key
                .clone()
                .ok_or_else(|| AppError::Config("OpenRouter API key not configured".to_string()))?;
            
            let rag = RAGService::with_storage(api_key, (*self.storage).clone());
            *service = Some(rag);
        }
        
        Ok(service.as_ref().unwrap().clone())
    }

    /// Get or create flashcard service
    pub async fn flashcard_service(&self) -> AppResult<FlashcardService> {
        let mut service = self.flashcard_service.lock().await;
        
        if service.is_none() {
            *service = Some(FlashcardService::new((*self.storage).clone()));
        }
        
        Ok(service.as_ref().unwrap().clone())
    }

    /// Get or create mock test service
    pub async fn mock_test_service(&self) -> AppResult<MockTestService> {
        let mut service = self.mock_test_service.lock().await;
        
        if service.is_none() {
            let llm = self.llm_service().await?;
            let rag = self.rag_service().await?;
            *service = Some(MockTestService::new((*self.storage).clone(), llm, rag));
        }
        
        Ok(service.as_ref().unwrap().clone())
    }

    /// Get or create study plan service
    pub async fn study_plan_service(&self) -> AppResult<StudyPlanService> {
        let mut service = self.study_plan_service.lock().await;
        
        if service.is_none() {
            *service = Some(StudyPlanService::new((*self.storage).clone()));
        }
        
        Ok(service.as_ref().unwrap().clone())
    }

    /// Check if online
    pub async fn is_online(&self) -> bool {
        self.storage.is_online().await
    }

    /// Get sync status
    pub async fn sync_status(&self) -> AppResult<crate::sync::SyncStatus> {
        self.sync_manager.get_status().await
    }
}

// Make services cloneable by wrapping in Arc
impl Clone for LLMService {
    fn clone(&self) -> Self {
        // Create a new instance with the same API key
        LLMService::new(self.api_key.clone())
    }
}

impl Clone for RAGService {
    fn clone(&self) -> Self {
        // Create a new instance with the same API key
        RAGService::new(self.api_key.clone())
    }
}

impl Clone for FlashcardService {
    fn clone(&self) -> Self {
        FlashcardService::new(self.storage.clone())
    }
}

impl Clone for MockTestService {
    fn clone(&self) -> Self {
        MockTestService::new(
            self.storage.clone(),
            self.llm_service.clone(),
            self.rag_service.clone(),
        )
    }
}

impl Clone for StudyPlanService {
    fn clone(&self) -> Self {
        StudyPlanService::new(self.storage.clone())
    }
}

// Add pub api_key field access for LLMService
impl LLMService {
    pub fn api_key(&self) -> &str {
        &self.api_key
    }
}

// Add pub storage field access for services that need it
impl FlashcardService {
    pub fn storage(&self) -> &HybridStorage {
        &self.storage
    }
}

impl MockTestService {
    pub fn storage(&self) -> &HybridStorage {
        &self.storage
    }
    
    pub fn llm_service(&self) -> &LLMService {
        &self.llm_service
    }
    
    pub fn rag_service(&self) -> &RAGService {
        &self.rag_service
    }
}

impl StudyPlanService {
    pub fn storage(&self) -> &HybridStorage {
        &self.storage
    }
}

impl RAGService {
    pub fn api_key(&self) -> &str {
        &self.api_key
    }
}

