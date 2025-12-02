use crate::db::HybridStorage;
use fastembed::{TextEmbedding, InitOptions, EmbeddingModel};
use tauri::State;
use std::sync::Mutex;
use uuid::Uuid;
use sqlx::Row;

pub struct RagState {
    model: Mutex<TextEmbedding>,
}

impl RagState {
    pub fn new() -> Self {
        let mut options = InitOptions::default();
        options.model_name = EmbeddingModel::AllMiniLML6V2;
        options.show_download_progress = true;
        
        let model = TextEmbedding::try_new(options).expect("Failed to load embedding model");
        Self { model: Mutex::new(model) }
    }
}

#[tauri::command]
pub async fn ingest_document(
    storage: State<'_, HybridStorage>,
    rag: State<'_, RagState>,
    path: String
) -> Result<String, String> {
    // Read file
    let content = std::fs::read_to_string(&path).map_err(|e| e.to_string())?;
    let filename = std::path::Path::new(&path)
        .file_name()
        .and_then(|n| n.to_str())
        .unwrap_or("unknown")
        .to_string();
    
    // Chunk (simple split by double newline for paragraphs)
    let chunks: Vec<String> = content
        .split("\n\n")
        .map(|s| s.trim().to_string())
        .filter(|s| !s.is_empty())
        .collect();
        
    if chunks.is_empty() {
        return Err("No content found in file".to_string());
    }

    // Embed
    let embeddings = {
        let model = rag.model.lock().map_err(|e| e.to_string())?;
        model.embed(chunks.clone(), None).map_err(|e| e.to_string())?
    };
    
    // Store in DB
    let pool = storage.sqlite().get_pool().await.map_err(|e| e.to_string())?;
    
    let doc_id = Uuid::new_v4().to_string();
    
    // Insert document
    sqlx::query(
        "INSERT INTO documents (id, title, document_type, created_at, updated_at) VALUES (?, ?, 'text', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)"
    )
    .bind(&doc_id)
    .bind(&filename)
    .execute(&pool)
    .await
    .map_err(|e| e.to_string())?;
    
    // Insert chunks
    for (i, (chunk, embedding)) in chunks.iter().zip(embeddings.iter()).enumerate() {
        let chunk_id = Uuid::new_v4().to_string();
        // Serialize embedding to bytes (f32 array to u8 vector)
        let embedding_bytes: Vec<u8> = embedding
            .iter()
            .flat_map(|f| f.to_le_bytes().to_vec())
            .collect();
            
        sqlx::query(
            "INSERT INTO document_chunks (id, document_id, chunk_index, chunk_text, embedding, created_at) VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)"
        )
        .bind(&chunk_id)
        .bind(&doc_id)
        .bind(i as i32)
        .bind(chunk)
        .bind(&embedding_bytes)
        .execute(&pool)
        .await
        .map_err(|e| e.to_string())?;
    }
    
    Ok(format!("Ingested {} chunks", chunks.len()))
}

#[tauri::command]
pub async fn query_context(
    storage: State<'_, HybridStorage>,
    rag: State<'_, RagState>,
    query: String,
    limit: usize
) -> Result<Vec<String>, String> {
    search_context(storage, rag, query, limit).await
}

pub async fn search_context(
    storage: State<'_, HybridStorage>,
    rag: State<'_, RagState>,
    query: String,
    limit: usize
) -> Result<Vec<String>, String> {
    // Embed query
    let query_embedding = {
        let model = rag.model.lock().map_err(|e| e.to_string())?;
        let embeddings = model.embed(vec![query], None).map_err(|e| e.to_string())?;
        embeddings[0].clone()
    };
    
    // Search DB (Manual Cosine Similarity in Rust)
    let pool = storage.sqlite().get_pool().await.map_err(|e| e.to_string())?;
    
    let rows = sqlx::query("SELECT chunk_text, embedding FROM document_chunks WHERE embedding IS NOT NULL")
        .fetch_all(&pool)
        .await
        .map_err(|e| e.to_string())?;
    
    let mut scored_chunks: Vec<(f32, String)> = Vec::new();
    
    for row in rows {
        let text: String = row.get("chunk_text");
        let embedding_bytes: Vec<u8> = row.get("embedding");
        
        // Deserialize embedding
        let embedding: Vec<f32> = embedding_bytes
            .chunks_exact(4)
            .map(|b| f32::from_le_bytes(b.try_into().unwrap()))
            .collect();
            
        // Cosine similarity
        let similarity = cosine_similarity(&query_embedding, &embedding);
        scored_chunks.push((similarity, text));
    }
    
    // Sort by similarity descending
    scored_chunks.sort_by(|a, b| b.0.partial_cmp(&a.0).unwrap_or(std::cmp::Ordering::Equal));
    
    // Take top N
    let results: Vec<String> = scored_chunks
        .into_iter()
        .take(limit)
        .map(|(_score, text)| text)
        .collect();
        
    Ok(results)
}

fn cosine_similarity(a: &[f32], b: &[f32]) -> f32 {
    let dot_product: f32 = a.iter().zip(b).map(|(x, y)| x * y).sum();
    let norm_a: f32 = a.iter().map(|x| x * x).sum::<f32>().sqrt();
    let norm_b: f32 = b.iter().map(|x| x * x).sum::<f32>().sqrt();
    
    if norm_a == 0.0 || norm_b == 0.0 {
        0.0
    } else {
        dot_product / (norm_a * norm_b)
    }
}
