/**
 * RAG (Retrieval-Augmented Generation) Service
 * Handles vector storage, embedding generation, and semantic search using Supabase + pgvector
 */

import { createServerClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { Client } from "pg"

interface DocumentChunk {
  id: string
  text: string
  metadata: {
    document_id: string
    chunk_index: number
    user_id?: string
    case_id?: string
    document_type: "user_case" | "knowledge_base"
    source_title?: string
    section?: string
  }
}

interface SearchResult {
  chunk: DocumentChunk
  distance: number
}

class RAGService {
  /**
   * Generate embeddings for text using OpenRouter
   */
  async generateEmbedding(text: string): Promise<number[]> {
    const apiKey = process.env.OPENROUTER_API_KEY
    if (!apiKey) {
      throw new Error("OpenRouter API key is not configured")
    }

    try {
      const response = await fetch("https://openrouter.ai/api/v1/embeddings", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL || "https://firmai.com",
          "X-Title": "FIRM AI",
        },
        body: JSON.stringify({
          model: "openai/text-embedding-3-small",
          input: text,
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error("OpenRouter embedding error:", errorText)
        throw new Error(`Failed to generate embedding: ${response.status}`)
      }

      const data = await response.json()
      return data.data[0].embedding
    } catch (error) {
      console.error("Error generating embedding:", error)
      throw error
    }
  }

  /**
   * Generate embeddings for multiple texts
   */
  async generateEmbeddings(texts: string[]): Promise<number[][]> {
    const apiKey = process.env.OPENROUTER_API_KEY
    if (!apiKey) {
      throw new Error("OpenRouter API key is not configured")
    }

    try {
      const response = await fetch("https://openrouter.ai/api/v1/embeddings", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL || "https://firmai.com",
          "X-Title": "FIRM AI",
        },
        body: JSON.stringify({
          model: "openai/text-embedding-3-small",
          input: texts,
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error("OpenRouter embeddings error:", errorText)
        throw new Error(`Failed to generate embeddings: ${response.status}`)
      }

      const data = await response.json()
      return data.data.map((item: any) => item.embedding)
    } catch (error) {
      console.error("Error generating embeddings:", error)
      throw error
    }
  }

  /**
   * Get Supabase client (admin for scripts, server for API routes)
   */
  private async getSupabaseClient() {
    try {
      return await createServerClient()
    } catch {
      // If cookies() fails, use admin client (e.g., in scripts)
      return createAdminClient()
    }
  }

  /**
   * Get direct Postgres client for advanced queries
   */
  private async getPostgresClient(): Promise<Client> {
    const postgresUrl = process.env.SUPABASE_POSTGRES_URL_NON_POOLING
    if (!postgresUrl) {
      throw new Error("Database URL not configured")
    }

    const url = new URL(postgresUrl)
    const client = new Client({
      host: url.hostname,
      port: parseInt(url.port) || 5432,
      database: url.pathname.slice(1),
      user: url.username,
      password: url.password,
      ssl: { rejectUnauthorized: false },
    })

    await client.connect()
    return client
  }

  /**
   * Add document chunks to Supabase with embeddings
   */
  async addChunks(chunks: DocumentChunk[]): Promise<void> {
    if (chunks.length === 0) return

    try {
      // Generate embeddings for all chunks
      const texts = chunks.map((chunk) => chunk.text)
      const embeddings = await this.generateEmbeddings(texts)

      // Prepare data for Supabase with correct pgvector format
      const supabase = await this.getSupabaseClient()
      const batchSize = 50
      
      for (let i = 0; i < chunks.length; i += batchSize) {
        const batch = chunks.slice(i, i + batchSize).map((chunk, idx) => {
          const embedding = embeddings[i + idx]
          return {
            id: chunk.id,
            document_id: chunk.metadata.document_id, // Reference to documents table
            chunk_text: chunk.text,
            chunk_index: chunk.metadata.chunk_index,
            metadata: chunk.metadata,
            embedding: `[${embedding.join(",")}]`, // pgvector format string
          }
        })
        
        const { error } = await supabase
          .from("document_chunks")
          .insert(batch)

        if (error) {
          console.error("Error inserting batch:", error)
          throw error
        }
      }
    } catch (error) {
      console.error("Error adding chunks:", error)
      throw error
    }
  }

  /**
   * Search for relevant chunks using semantic similarity via pgvector
   */
  async search(
    query: string,
    options: {
      limit?: number
      userId?: string
      caseIds?: string[]
      includeKnowledgeBase?: boolean
      minSimilarity?: number
    } = {}
  ): Promise<SearchResult[]> {
    const {
      limit = 5,
      userId,
      caseIds,
      includeKnowledgeBase = true,
      minSimilarity = 0.3, // Lower threshold for better recall
    } = options

    try {
      // Generate query embedding
      const queryEmbedding = await this.generateEmbedding(query)

      const client = await this.getPostgresClient()
      const results: SearchResult[] = []

      try {
        // Search user cases and knowledge base separately if needed
        const searches = []
        
        // Always search knowledge base if enabled
        if (includeKnowledgeBase) {
          searches.push({
            type: 'knowledge_base',
          })
        }
        
        // Search user cases if filtering by user/case
        if (userId || caseIds) {
          searches.push({
            type: 'user_case',
            userId,
            caseIds,
          })
        }

        for (const searchParams of searches) {
          // pgvector expects array format string: [1,2,3,...]
          // Note: We need to inline the vector string because pg doesn't support vector types in prepared statements
          const vectorStr = `'[${queryEmbedding.join(",")}]'::vector(1536)`
          
          const { rows } = await client.query(
            `SELECT * FROM search_similar_vectors(
              ${vectorStr},
              $1,
              $2,
              $3,
              $4,
              $5
            )`,
            [
              searchParams.type,
              searchParams.userId || null,
              searchParams.caseIds || null,
              searchParams.type === 'knowledge_base' ? Math.min(limit, 3) : limit,
              minSimilarity,
            ]
          )

          for (const row of rows) {
            results.push({
              chunk: {
                id: row.id,
                text: row.chunk_text,
                metadata: {
                  document_id: row.metadata?.document_id || "",
                  chunk_index: row.chunk_index || 0,
                  user_id: row.metadata?.user_id,
                  case_id: row.metadata?.case_id,
                  document_type: row.metadata?.document_type,
                  source_title: row.metadata?.source_title,
                  section: row.metadata?.section,
                },
              },
              distance: 1 - row.similarity,
            })
          }
        }
      } finally {
        await client.end()
      }

      // Sort by distance (lower is better) and limit results
      return results
        .sort((a, b) => a.distance - b.distance)
        .slice(0, limit)
    } catch (error) {
      console.error("Error searching:", error)
      throw error
    }
  }

  /**
   * Delete chunks by document ID
   */
  async deleteChunks(documentId: string): Promise<void> {
    try {
      const supabase = await this.getSupabaseClient()
      
      const { error } = await supabase
        .from("document_chunks")
        .delete()
        .eq("metadata->>document_id", documentId)

      if (error) {
        console.error("Error deleting chunks:", error)
        throw error
      }
    } catch (error) {
      console.error("Error deleting chunks:", error)
      throw error
    }
  }

  /**
   * Format search results into context string for LLM
   */
  formatContextForLLM(results: SearchResult[]): string {
    if (results.length === 0) return ""

    const contextParts = results.map((result, index) => {
      const metadata = result.chunk.metadata
      const sourceLabel = metadata.source_title || "Case Document"
      const sectionLabel = metadata.section ? ` (${metadata.section})` : ""
      
      return `[Source ${index + 1}: ${sourceLabel}${sectionLabel}]
${result.chunk.text}`
    })

    return contextParts.join("\n\n")
  }
}

// Export singleton instance
export const ragService = new RAGService()
