/**
 * Tauri RAG Service Wrapper
 * Wraps Rust backend RAG functions for use in the frontend
 */

import { invoke } from "@tauri-apps/api/core"

interface SearchResult {
  chunk: {
    id: string
    text: string
    metadata: {
      document_id: string
      chunk_index: number
      user_id?: string
      case_id?: string
      document_type: string
      source_title?: string
      section?: string
    }
  }
  distance: number
  similarity: number
}

interface ProcessedDocument {
  chunks: Array<{
    id: string
    text: string
    metadata: any
  }>
  totalChunks: number
}

class TauriRAGService {
  private apiKey: string

  constructor() {
    this.apiKey = process.env.NEXT_PUBLIC_OPENROUTER_API_KEY || ""
  }

  /**
   * Generate embedding using Rust backend
   */
  async generateEmbedding(text: string): Promise<number[]> {
    if (!this.apiKey) {
      throw new Error("OpenRouter API key is not configured")
    }

    try {
      const embedding = await invoke<number[]>("generate_embedding", {
        text,
        apiKey: this.apiKey,
      })
      return embedding
    } catch (error) {
      console.error("Error generating embedding:", error)
      throw error
    }
  }

  /**
   * Generate embeddings for multiple texts
   */
  async generateEmbeddings(texts: string[]): Promise<number[][]> {
    if (!this.apiKey) {
      throw new Error("OpenRouter API key is not configured")
    }

    try {
      const embeddings = await invoke<number[][]>("generate_embeddings", {
        texts,
        apiKey: this.apiKey,
      })
      return embeddings
    } catch (error) {
      console.error("Error generating embeddings:", error)
      throw error
    }
  }

  /**
   * Search documents using semantic similarity
   */
  async search(
    query: string,
    options: {
      limit?: number
      userId?: string
      caseIds?: string[]
      includeKnowledgeBase?: boolean
    } = {}
  ): Promise<SearchResult[]> {
    if (!this.apiKey) {
      throw new Error("OpenRouter API key is not configured")
    }

    try {
      const results = await invoke<SearchResult[]>("search_documents", {
        query,
        apiKey: this.apiKey,
        limit: options.limit,
        userId: options.userId,
        caseIds: options.caseIds,
        includeKnowledgeBase: options.includeKnowledgeBase ?? true,
      })
      return results
    } catch (error) {
      console.error("Error searching documents:", error)
      throw error
    }
  }

  /**
   * Process PDF document and generate chunks
   */
  async processPDF(
    pdfData: Uint8Array,
    metadata: {
      userId: string
      caseId?: string
      title: string
      documentType: string
    }
  ): Promise<ProcessedDocument> {
    try {
      const result = await invoke<ProcessedDocument>("process_pdf_document", {
        pdfData: Array.from(pdfData),
        userId: metadata.userId,
        caseId: metadata.caseId,
        title: metadata.title,
        documentType: metadata.documentType,
      })
      return result
    } catch (error) {
      console.error("Error processing PDF:", error)
      throw error
    }
  }

  /**
   * Process text document and generate chunks
   */
  async processText(
    text: string,
    metadata: {
      userId: string
      caseId?: string
      title: string
      documentType: string
    }
  ): Promise<ProcessedDocument> {
    try {
      const result = await invoke<ProcessedDocument>("process_text_document", {
        text,
        userId: metadata.userId,
        caseId: metadata.caseId,
        title: metadata.title,
        documentType: metadata.documentType,
      })
      return result
    } catch (error) {
      console.error("Error processing text:", error)
      throw error
    }
  }
}

// Export singleton instance
export const tauriRAGService = new TauriRAGService()

// Export types
export type { SearchResult, ProcessedDocument }


