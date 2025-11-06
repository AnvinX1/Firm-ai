/**
 * Document Processing Module
 * Handles PDF extraction, text chunking, and document preparation for RAG
 */

use crate::error::{AppError, AppResult};
use crate::validation::{sanitize_text, validate_not_empty};
use lopdf::Document;
use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DocumentMetadata {
    pub user_id: Option<String>,
    pub case_id: Option<String>,
    pub title: String,
    pub document_type: String, // "user_case" | "knowledge_base"
    pub document_id: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ChunkMetadata {
    pub document_id: String,
    pub chunk_index: i32,
    pub user_id: Option<String>,
    pub case_id: Option<String>,
    pub document_type: String,
    pub source_title: String,
    pub section: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DocumentChunk {
    pub id: String,
    pub text: String,
    pub metadata: ChunkMetadata,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ProcessedDocument {
    pub chunks: Vec<DocumentChunk>,
    pub total_chunks: usize,
}

pub struct DocumentProcessor;

impl DocumentProcessor {
    /// Extract text from PDF file
    pub fn extract_text_from_pdf(pdf_data: &[u8]) -> AppResult<String> {
        let document = Document::load_mem(pdf_data)
            .map_err(|e| AppError::PdfExtraction(format!("Failed to load PDF: {}", e)))?;

        let mut text = String::new();

        // Iterate through all pages
        let pages = document.get_pages();
        for (page_num, _) in pages.iter() {
            match document.extract_text(&[*page_num]) {
                Ok(page_text) => {
                    text.push_str(&page_text);
                    text.push('\n');
                }
                Err(e) => {
                    eprintln!("Warning: Failed to extract text from page {}: {}", page_num, e);
                    // Continue with other pages even if one fails
                    continue;
                }
            }
        }

        if text.trim().is_empty() {
            return Err(AppError::PdfExtraction(
                "PDF contains no extractable text".to_string()
            ));
        }

        Ok(text)
    }

    /// Clean and normalize text
    fn clean_text(text: &str) -> String {
        // Remove excessive whitespace
        let cleaned = text
            .split_whitespace()
            .collect::<Vec<&str>>()
            .join(" ");

        // Sanitize text
        sanitize_text(&cleaned)
    }

    /// Semantic chunking: Split text by paragraphs with overlap
    pub fn semantic_chunk(text: &str, overlap_words: usize) -> AppResult<Vec<String>> {
        validate_not_empty(text, "Text for chunking")?;

        let cleaned = Self::clean_text(text);

        // Split by paragraphs (double newlines or single newlines followed by capitals)
        let paragraphs: Vec<&str> = cleaned
            .split('\n')
            .map(|p| p.trim())
            .filter(|p| !p.is_empty())
            .collect();

        let mut chunks: Vec<String> = Vec::new();
        let words_per_chunk = 500; // Target words per chunk

        let mut current_chunk: Vec<String> = Vec::new();
        let mut current_word_count = 0;

        for paragraph in paragraphs {
            let words: Vec<&str> = paragraph.split_whitespace().collect();
            let word_count = words.len();

            // If adding this paragraph exceeds the limit, save current chunk
            if current_word_count + word_count > words_per_chunk && !current_chunk.is_empty() {
                chunks.push(current_chunk.join("\n\n"));

                // Start new chunk with overlap
                let overlap_paragraphs = if current_chunk.len() > 1 {
                    // Calculate how many paragraphs to keep for overlap
                    let mut overlap_count = 0;
                    let mut overlap_words = 0;
                    
                    for para in current_chunk.iter().rev() {
                        let para_words = para.split_whitespace().count();
                        if overlap_words + para_words <= overlap_words {
                            overlap_count += 1;
                            overlap_words += para_words;
                        } else {
                            break;
                        }
                    }
                    
                    let start_idx = current_chunk.len().saturating_sub(overlap_count.max(1));
                    current_chunk[start_idx..].to_vec()
                } else {
                    Vec::new()
                };

                current_chunk = overlap_paragraphs;
                current_word_count = current_chunk
                    .iter()
                    .map(|p| p.split_whitespace().count())
                    .sum();
            }

            current_chunk.push(paragraph.to_string());
            current_word_count += word_count;
        }

        // Add last chunk
        if !current_chunk.is_empty() {
            chunks.push(current_chunk.join("\n\n"));
        }

        // If text is too short for chunking, return as single chunk
        if chunks.is_empty() && !cleaned.is_empty() {
            return Ok(vec![cleaned]);
        }

        Ok(chunks)
    }

    /// Process PDF and generate chunks
    pub fn process_pdf(
        pdf_data: &[u8],
        metadata: DocumentMetadata,
    ) -> AppResult<ProcessedDocument> {
        // Extract text from PDF
        let text = Self::extract_text_from_pdf(pdf_data)?;

        if text.trim().is_empty() {
            return Err(AppError::DocumentProcessing(
                "PDF contains no extractable text".to_string()
            ));
        }

        // Generate semantic chunks
        let chunk_texts = Self::semantic_chunk(&text, 200)?;

        // Create chunk objects
        let document_id = metadata
            .document_id
            .clone()
            .or_else(|| metadata.case_id.clone())
            .unwrap_or_else(|| Uuid::new_v4().to_string());

        let chunks: Vec<DocumentChunk> = chunk_texts
            .into_iter()
            .enumerate()
            .map(|(index, chunk_text)| {
                let chunk_id = Uuid::new_v4().to_string();

                DocumentChunk {
                    id: chunk_id,
                    text: chunk_text,
                    metadata: ChunkMetadata {
                        document_id: document_id.clone(),
                        chunk_index: index as i32,
                        user_id: metadata.user_id.clone(),
                        case_id: metadata.case_id.clone(),
                        document_type: metadata.document_type.clone(),
                        source_title: metadata.title.clone(),
                        section: None,
                    },
                }
            })
            .collect();

        Ok(ProcessedDocument {
            total_chunks: chunks.len(),
            chunks,
        })
    }

    /// Process plain text and generate chunks
    pub fn process_text(
        text: &str,
        metadata: DocumentMetadata,
    ) -> AppResult<ProcessedDocument> {
        validate_not_empty(text, "Text for processing")?;

        let cleaned = Self::clean_text(text);

        if cleaned.trim().is_empty() {
            return Err(AppError::DocumentProcessing("Text is empty".to_string()));
        }

        // Generate semantic chunks
        let chunk_texts = Self::semantic_chunk(&cleaned, 200)?;

        // Create chunk objects
        let document_id = metadata
            .document_id
            .clone()
            .or_else(|| metadata.case_id.clone())
            .unwrap_or_else(|| Uuid::new_v4().to_string());

        let chunks: Vec<DocumentChunk> = chunk_texts
            .into_iter()
            .enumerate()
            .map(|(index, chunk_text)| {
                let chunk_id = Uuid::new_v4().to_string();

                DocumentChunk {
                    id: chunk_id,
                    text: chunk_text,
                    metadata: ChunkMetadata {
                        document_id: document_id.clone(),
                        chunk_index: index as i32,
                        user_id: metadata.user_id.clone(),
                        case_id: metadata.case_id.clone(),
                        document_type: metadata.document_type.clone(),
                        source_title: metadata.title.clone(),
                        section: None,
                    },
                }
            })
            .collect();

        Ok(ProcessedDocument {
            total_chunks: chunks.len(),
            chunks,
        })
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_clean_text() {
        let text = "This   is  a   test\n\nwith  multiple    spaces";
        let cleaned = DocumentProcessor::clean_text(text);
        assert!(!cleaned.contains("  "));
    }

    #[test]
    fn test_semantic_chunk() {
        let text = "This is a test paragraph.\n\nThis is another paragraph with more text to make it longer.";
        let chunks = DocumentProcessor::semantic_chunk(text, 50).unwrap();
        assert!(!chunks.is_empty());
    }

    #[test]
    fn test_process_text() {
        let metadata = DocumentMetadata {
            user_id: Some("user123".to_string()),
            case_id: Some("case123".to_string()),
            title: "Test Case".to_string(),
            document_type: "user_case".to_string(),
            document_id: None,
        };

        let text = "This is a test case with some content.";
        let result = DocumentProcessor::process_text(text, metadata);
        assert!(result.is_ok());

        let processed = result.unwrap();
        assert!(!processed.chunks.is_empty());
        assert_eq!(processed.total_chunks, processed.chunks.len());
    }
}

