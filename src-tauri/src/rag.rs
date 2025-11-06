/**
 * RAG (Retrieval-Augmented Generation) Service in Rust
 * Handles vector storage, embedding generation, and semantic search
 */

use crate::db::{HybridStorage, SupabaseClient};
use crate::document::DocumentChunk;
use crate::error::{AppError, AppResult};
use crate::validation::validate_embedding;
use serde::{Deserialize, Serialize};
use serde_json::json;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ChunkMetadata {
    pub document_id: String,
    pub chunk_index: i32,
    pub user_id: Option<String>,
    pub case_id: Option<String>,
    pub document_type: String, // "user_case" | "knowledge_base"
    pub source_title: Option<String>,
    pub section: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct SearchResult {
    pub chunk: DocumentChunk,
    pub distance: f64,
    pub similarity: f64,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct SearchOptions {
    pub limit: Option<usize>,
    pub user_id: Option<String>,
    pub case_ids: Option<Vec<String>>,
    pub include_knowledge_base: Option<bool>,
    pub min_similarity: Option<f64>,
}

impl Default for SearchOptions {
    fn default() -> Self {
        Self {
            limit: Some(5),
            user_id: None,
            case_ids: None,
            include_knowledge_base: Some(true),
            min_similarity: Some(0.3),
        }
    }
}

pub struct RAGService {
    api_key: String,
    base_url: String,
    storage: Option<HybridStorage>,
}

impl RAGService {
    pub fn new(api_key: String) -> Self {
        Self {
            api_key,
            base_url: "https://openrouter.ai/api/v1".to_string(),
            storage: None,
        }
    }

    pub fn with_storage(api_key: String, storage: HybridStorage) -> Self {
        Self {
            api_key,
            base_url: "https://openrouter.ai/api/v1".to_string(),
            storage: Some(storage),
        }
    }

    /// Generate embeddings for text using OpenRouter
    pub async fn generate_embedding(&self, text: &str) -> AppResult<Vec<f64>> {
        let client = reqwest::Client::new();
        
        let payload = json!({
            "model": "openai/text-embedding-3-small",
            "input": text
        });

        let response = client
            .post(format!("{}/embeddings", self.base_url))
            .header("Authorization", format!("Bearer {}", self.api_key))
            .header("Content-Type", "application/json")
            .header("HTTP-Referer", "https://firmai.com")
            .header("X-Title", "FIRM AI")
            .json(&payload)
            .send()
            .await?;

        if !response.status().is_success() {
            let status = response.status().as_u16();
            let error_text = response.text().await.unwrap_or_default();
            return Err(AppError::OpenRouter {
                status,
                message: error_text,
            });
        }

        let data: serde_json::Value = response.json().await?;

        let embedding: Vec<f64> = data["data"][0]["embedding"]
            .as_array()
            .ok_or_else(|| AppError::Embedding("Invalid embedding format".to_string()))?
            .iter()
            .map(|v| v.as_f64().unwrap_or(0.0))
            .collect();

        validate_embedding(&embedding)?;
        Ok(embedding)
    }

    /// Generate embeddings for multiple texts
    pub async fn generate_embeddings(&self, texts: Vec<String>) -> AppResult<Vec<Vec<f64>>> {
        let client = reqwest::Client::new();
        
        let payload = json!({
            "model": "openai/text-embedding-3-small",
            "input": texts
        });

        let response = client
            .post(format!("{}/embeddings", self.base_url))
            .header("Authorization", format!("Bearer {}", self.api_key))
            .header("Content-Type", "application/json")
            .header("HTTP-Referer", "https://firmai.com")
            .header("X-Title", "FIRM AI")
            .json(&payload)
            .send()
            .await?;

        if !response.status().is_success() {
            let status = response.status().as_u16();
            let error_text = response.text().await.unwrap_or_default();
            return Err(AppError::OpenRouter {
                status,
                message: error_text,
            });
        }

        let data: serde_json::Value = response.json().await?;

        let embeddings: AppResult<Vec<Vec<f64>>> = data["data"]
            .as_array()
            .ok_or_else(|| AppError::Embedding("Invalid embeddings format".to_string()))?
            .iter()
            .map(|item| {
                let embedding: Vec<f64> = item["embedding"]
                    .as_array()
                    .ok_or_else(|| AppError::Embedding("Invalid embedding format".to_string()))?
                    .iter()
                    .map(|v| v.as_f64().ok_or_else(|| AppError::Embedding("Invalid number".to_string())))
                    .collect::<Result<Vec<f64>, _>>()?;
                
                validate_embedding(&embedding)?;
                Ok(embedding)
            })
            .collect();

        embeddings
    }

    /// Add document chunks to storage with embeddings
    pub async fn add_chunks(&self, chunks: Vec<DocumentChunk>) -> AppResult<()> {
        if chunks.is_empty() {
            return Ok(());
        }

        let storage = self
            .storage
            .as_ref()
            .ok_or_else(|| AppError::Internal("Storage not initialized".to_string()))?;

        // Generate embeddings for all chunks
        let texts: Vec<String> = chunks.iter().map(|c| c.text.clone()).collect();
        let embeddings = self.generate_embeddings(texts).await?;

        // Store in Supabase if online
        if storage.is_online().await {
            if let Some(supabase) = storage.supabase() {
                self.store_chunks_supabase(supabase, &chunks, &embeddings).await?;
            }
        }

        // Also cache locally
        self.cache_chunks_locally(storage, &chunks).await?;

        Ok(())
    }

    /// Store chunks in Supabase
    async fn store_chunks_supabase(
        &self,
        supabase: &SupabaseClient,
        chunks: &[DocumentChunk],
        embeddings: &[Vec<f64>],
    ) -> AppResult<()> {
        let batch_size = 50;
        
        for i in (0..chunks.len()).step_by(batch_size) {
            let end = (i + batch_size).min(chunks.len());
            let batch_chunks = &chunks[i..end];
            let batch_embeddings = &embeddings[i..end];

            let batch_data: Vec<serde_json::Value> = batch_chunks
                .iter()
                .zip(batch_embeddings.iter())
                .map(|(chunk, embedding)| {
                    let embedding_str = format!("[{}]", embedding.iter().map(|v| v.to_string()).collect::<Vec<_>>().join(","));
                    
                    json!({
                        "id": chunk.id,
                        "document_id": chunk.metadata.document_id,
                        "chunk_text": chunk.text,
                        "chunk_index": chunk.metadata.chunk_index,
                        "metadata": serde_json::to_value(&chunk.metadata).unwrap_or(json!({})),
                        "embedding": embedding_str,
                    })
                })
                .collect();

            let data_str = serde_json::to_string(&batch_data)?;
            
            supabase
                .insert("document_chunks", &data_str)
                .await?
                .execute()
                .await
                .map_err(|e| AppError::Supabase(format!("Failed to insert chunks: {}", e)))?;
        }

        Ok(())
    }

    /// Cache chunks locally in SQLite
    async fn cache_chunks_locally(
        &self,
        storage: &HybridStorage,
        chunks: &[DocumentChunk],
    ) -> AppResult<()> {
        storage.sqlite().execute(move |conn| {
            for chunk in chunks {
                let metadata_json = serde_json::to_string(&chunk.metadata)?;
                
                conn.execute(
                    "INSERT OR REPLACE INTO document_chunks 
                     (id, document_id, chunk_index, chunk_text, metadata, created_at, synced)
                     VALUES (?1, ?2, ?3, ?4, ?5, datetime('now'), 1)",
                    rusqlite::params![
                        &chunk.id,
                        &chunk.metadata.document_id,
                        chunk.metadata.chunk_index,
                        &chunk.text,
                        &metadata_json,
                    ],
                )?;
            }
            Ok(())
        }).await?;

        Ok(())
    }

    /// Search for relevant chunks using semantic similarity
    pub async fn search(
        &self,
        query: &str,
        options: SearchOptions,
    ) -> AppResult<Vec<SearchResult>> {
        let storage = self
            .storage
            .as_ref()
            .ok_or_else(|| AppError::Internal("Storage not initialized".to_string()))?;

        // Generate query embedding
        let query_embedding = self.generate_embedding(query).await?;

        // Try Supabase search if online
        if storage.is_online().await {
            if let Some(supabase) = storage.supabase() {
                return self.search_supabase(supabase, &query_embedding, options).await;
            }
        }

        // Fallback to local search (basic implementation)
        self.search_local(storage, query, options).await
    }

    /// Search using Supabase pgvector
    async fn search_supabase(
        &self,
        supabase: &SupabaseClient,
        query_embedding: &[f64],
        options: SearchOptions,
    ) -> AppResult<Vec<SearchResult>> {
        let limit = options.limit.unwrap_or(5);
        let min_similarity = options.min_similarity.unwrap_or(0.3);

        // Format embedding as vector string for pgvector
        let embedding_str = format!("[{}]", query_embedding.iter().map(|v| v.to_string()).collect::<Vec<_>>().join(","));

        // Call the search_similar_vectors function
        let mut query_builder = supabase.client()
            .rpc("search_similar_vectors", &format!(
                r#"{{"query_embedding": "{}", "match_type": "{}", "result_limit": {}, "similarity_threshold": {}}}"#,
                embedding_str,
                if options.include_knowledge_base.unwrap_or(true) { "all" } else { "user_case" },
                limit,
                min_similarity
            ));

        if let Some(user_id) = &options.user_id {
            query_builder = query_builder.eq("match_user_id", user_id);
        }

        let response = query_builder
            .execute()
            .await
            .map_err(|e| AppError::VectorSearch(format!("Search failed: {}", e)))?;

        let body = response
            .text()
            .await
            .map_err(|e| AppError::VectorSearch(format!("Failed to read response: {}", e)))?;

        let results: Vec<serde_json::Value> = serde_json::from_str(&body)
            .map_err(|e| AppError::VectorSearch(format!("Failed to parse results: {}", e)))?;

        let search_results: Vec<SearchResult> = results
            .into_iter()
            .map(|row| {
                let metadata: ChunkMetadata = serde_json::from_value(row["metadata"].clone())
                    .unwrap_or_else(|_| ChunkMetadata {
                        document_id: String::new(),
                        chunk_index: 0,
                        user_id: None,
                        case_id: None,
                        document_type: "user_case".to_string(),
                        source_title: None,
                        section: None,
                    });

                let similarity = row["similarity"].as_f64().unwrap_or(0.0);

                SearchResult {
                    chunk: DocumentChunk {
                        id: row["id"].as_str().unwrap_or("").to_string(),
                        text: row["chunk_text"].as_str().unwrap_or("").to_string(),
                        metadata,
                    },
                    distance: 1.0 - similarity,
                    similarity,
                }
            })
            .collect();

        Ok(search_results)
    }

    /// Search locally in SQLite (basic text search fallback)
    async fn search_local(
        &self,
        storage: &HybridStorage,
        query: &str,
        options: SearchOptions,
    ) -> AppResult<Vec<SearchResult>> {
        let limit = options.limit.unwrap_or(5);
        let query_lower = query.to_lowercase();

        let results = storage.sqlite().execute(move |conn| {
            let mut stmt = conn.prepare(
                "SELECT id, document_id, chunk_index, chunk_text, metadata
                 FROM document_chunks
                 WHERE chunk_text LIKE ?1
                 LIMIT ?2"
            )?;

            let chunks: Vec<SearchResult> = stmt
                .query_map(rusqlite::params![format!("%{}%", query_lower), limit], |row| {
                    let metadata_str: String = row.get(4)?;
                    let metadata: ChunkMetadata = serde_json::from_str(&metadata_str)
                        .unwrap_or_else(|_| ChunkMetadata {
                            document_id: String::new(),
                            chunk_index: 0,
                            user_id: None,
                            case_id: None,
                            document_type: "user_case".to_string(),
                            source_title: None,
                            section: None,
                        });

                    Ok(SearchResult {
                        chunk: DocumentChunk {
                            id: row.get(0)?,
                            text: row.get(3)?,
                            metadata,
                        },
                        distance: 0.5, // Approximate distance for text search
                        similarity: 0.5,
                    })
                })?
                .collect::<Result<Vec<_>, _>>()?;

            Ok(chunks)
        }).await?;

        Ok(results)
    }

    /// Format search results into context string for LLM
    pub fn format_context_for_llm(&self, results: &[SearchResult]) -> String {
        if results.is_empty() {
            return String::new();
        }

        results
            .iter()
            .enumerate()
            .map(|(idx, result)| {
                let metadata = &result.chunk.metadata;
                let source_label = metadata
                    .source_title
                    .as_ref()
                    .unwrap_or(&"Case Document".to_string());
                let section_label = metadata
                    .section
                    .as_ref()
                    .map(|s| format!(" ({})", s))
                    .unwrap_or_default();

                format!(
                    "[Source {}: {}{}]\n{}",
                    idx + 1,
                    source_label,
                    section_label,
                    result.chunk.text
                )
            })
            .collect::<Vec<_>>()
            .join("\n\n")
    }
}

