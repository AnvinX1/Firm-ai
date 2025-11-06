/**
 * Document Processing Service
 * Handles PDF text extraction, semantic chunking, and document preparation for RAG
 */

import * as pdfParse from "pdf-parse"
import { ragService } from "./rag"
import { randomUUID } from "crypto"

interface DocumentMetadata {
  user_id?: string
  case_id?: string
  title: string
  document_type: "user_case" | "knowledge_base"
  document_id?: string // UUID from documents table
}

interface ChunkMetadata {
  document_id: string
  chunk_index: number
  user_id?: string
  case_id?: string
  document_type: "user_case" | "knowledge_base"
  source_title: string
  section?: string
}

class DocumentProcessor {
  /**
   * Extract text from PDF buffer
   */
  async extractTextFromPDF(pdfBuffer: Buffer): Promise<string> {
    try {
      const data = await pdfParse(pdfBuffer)
      return data.text
    } catch (error) {
      console.error("Error extracting text from PDF:", error)
      throw new Error("Failed to extract text from PDF")
    }
  }

  /**
   * Clean and normalize text
   */
  private cleanText(text: string): string {
    // Remove excessive whitespace
    let cleaned = text.replace(/\s+/g, " ")
    
    // Remove special characters but keep legal citations
    cleaned = cleaned.replace(/[^\w\s.,;:()\[\]{}\-–—'"]/g, "")
    
    // Trim
    cleaned = cleaned.trim()
    
    return cleaned
  }

  /**
   * Semantic chunking: Split text by paragraphs with overlap
   */
  semanticChunk(text: string, overlapWords: number = 200): string[] {
    const cleaned = this.cleanText(text)
    
    // Split by paragraphs (double newlines or newline followed by space)
    const paragraphs = cleaned
      .split(/\n\s*\n|\n(?=\s+[A-Z])/)
      .map(p => p.trim())
      .filter(p => p.length > 0)
    
    // Group paragraphs into chunks with overlap
    const chunks: string[] = []
    const wordsPerChunk = 500 // Target words per chunk
    const wordsPerParagraph = paragraphs.map(p => p.split(/\s+/).length)
    
    let currentChunk: string[] = []
    let currentWordCount = 0
    
    for (let i = 0; i < paragraphs.length; i++) {
      const paragraph = paragraphs[i]
      const wordCount = wordsPerParagraph[i]
      
      // If adding this paragraph would exceed the limit, save current chunk
      if (currentWordCount + wordCount > wordsPerChunk && currentChunk.length > 0) {
        chunks.push(currentChunk.join("\n\n"))
        
        // Start new chunk with overlap
        const overlapParagraphs = Math.floor(overlapWords / 200) // approx paragraphs for overlap
        currentChunk = paragraphs.slice(Math.max(0, i - overlapParagraphs), i)
        currentWordCount = wordsPerParagraph
          .slice(Math.max(0, i - overlapParagraphs), i)
          .reduce((sum, count) => sum + count, 0)
      }
      
      currentChunk.push(paragraph)
      currentWordCount += wordCount
    }
    
    // Add last chunk
    if (currentChunk.length > 0) {
      chunks.push(currentChunk.join("\n\n"))
    }
    
    // If text is too short for chunking, return as single chunk
    if (chunks.length === 0 && cleaned.length > 0) {
      return [cleaned]
    }
    
    return chunks
  }

  /**
   * Process PDF and generate chunks with embeddings
   */
  async processPDF(
    pdfBuffer: Buffer,
    metadata: DocumentMetadata
  ): Promise<{
    chunks: Array<{
      id: string
      text: string
      metadata: ChunkMetadata
    }>
    totalChunks: number
  }> {
    try {
      // Extract text from PDF
      const text = await this.extractTextFromPDF(pdfBuffer)
      
      if (!text || text.trim().length === 0) {
        throw new Error("PDF contains no extractable text")
      }
      
      // Generate semantic chunks
      const chunkTexts = this.semanticChunk(text)
      
      // Create chunk objects
      const documentId = metadata.document_id || metadata.case_id || randomUUID()
      const chunks = chunkTexts.map((chunkText, index) => {
        const chunkId = randomUUID()
        
        return {
          id: chunkId,
          text: chunkText,
          metadata: {
            document_id: documentId,
            chunk_index: index,
            user_id: metadata.user_id,
            case_id: metadata.case_id,
            document_type: metadata.document_type,
            source_title: metadata.title,
          } as ChunkMetadata,
        }
      })
      
      return {
        chunks,
        totalChunks: chunks.length,
      }
    } catch (error) {
      console.error("Error processing PDF:", error)
      throw error
    }
  }

  /**
   * Process plain text and generate chunks with embeddings
   */
  async processText(
    text: string,
    metadata: DocumentMetadata
  ): Promise<{
    chunks: Array<{
      id: string
      text: string
      metadata: ChunkMetadata
    }>
    totalChunks: number
  }> {
    try {
      const cleaned = this.cleanText(text)
      
      if (!cleaned || cleaned.trim().length === 0) {
        throw new Error("Text is empty")
      }
      
      // Generate semantic chunks
      const chunkTexts = this.semanticChunk(cleaned)
      
      // Create chunk objects
      const documentId = metadata.document_id || metadata.case_id || randomUUID()
      const chunks = chunkTexts.map((chunkText, index) => {
        const chunkId = randomUUID()
        
        return {
          id: chunkId,
          text: chunkText,
          metadata: {
            document_id: documentId,
            chunk_index: index,
            user_id: metadata.user_id,
            case_id: metadata.case_id,
            document_type: metadata.document_type,
            source_title: metadata.title,
          } as ChunkMetadata,
        }
      })
      
      return {
        chunks,
        totalChunks: chunks.length,
      }
    } catch (error) {
      console.error("Error processing text:", error)
      throw error
    }
  }

  /**
   * Process and embed a document (PDF or text)
   */
  async processAndEmbed(
    content: Buffer | string,
    metadata: DocumentMetadata,
    collectionName: "user-cases" | "legal-knowledge" = "user-cases"
  ): Promise<{
    documentId: string
    totalChunks: number
  }> {
    try {
      // Process content
      const isBuffer = Buffer.isBuffer(content)
      const processed = isBuffer
        ? await this.processPDF(content as Buffer, metadata)
        : await this.processText(content as string, metadata)
      
      // Add chunks to Supabase with embeddings
      await ragService.addChunks(processed.chunks)
      
      return {
        documentId: processed.chunks[0]?.metadata.document_id || "",
        totalChunks: processed.totalChunks,
      }
    } catch (error) {
      console.error("Error processing and embedding document:", error)
      throw error
    }
  }
}

// Export singleton instance
export const documentProcessor = new DocumentProcessor()

