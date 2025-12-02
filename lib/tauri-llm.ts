/**
 * Tauri LLM Service Wrapper
 * Wraps Rust backend LLM functions for use in the frontend
 */

import { invoke } from "@tauri-apps/api/core"

interface Message {
  role: "system" | "user" | "assistant"
  content: string
}

interface IRACResult {
  issue: string
  rule: string
  analysis: string
  conclusion: string
}

interface CaseHistory {
  title: string
  summary: string
}

class TauriLLMService {
  constructor() {
    // API key is managed by the backend
  }

  /**
   * Generate embedding using Rust backend
   */
  async generateEmbedding(text: string): Promise<number[]> {
    try {
      // Note: This command needs to be implemented in backend if used
      const embedding = await invoke<number[]>("generate_embedding", {
        text,
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
    try {
      // Note: This command needs to be implemented in backend if used
      const embeddings = await invoke<number[][]>("generate_embeddings", {
        texts,
      })
      return embeddings
    } catch (error) {
      console.error("Error generating embeddings:", error)
      throw error
    }
  }

  /**
   * Chat with LLM
   */
  async chat(
    messages: Message[],
    options: {
      model?: string
      temperature?: number
      max_tokens?: number
    } = {}
  ): Promise<string> {
    try {
      const response = await invoke<string>("llm_chat", {
        messages: messages.map((m) => ({
          role: m.role,
          content: m.content,
        })),
        model: options.model,
        temperature: options.temperature,
        max_tokens: options.max_tokens,
      })
      return response
    } catch (error) {
      console.error("Error in LLM chat:", error)
      throw error
    }
  }

  /**
   * Generate IRAC analysis
   */
  async generateIRAC(
    caseText: string,
    options: {
      userId?: string
      caseIds?: string[]
      includeContext?: boolean
    } = {}
  ): Promise<IRACResult> {
    try {
      const result = await invoke<IRACResult>("generate_irac", {
        caseText,
        userId: options.userId,
        caseIds: options.caseIds,
        includeContext: options.includeContext ?? true,
      })
      return result
    } catch (error) {
      console.error("Error generating IRAC:", error)
      throw error
    }
  }

  /**
   * Chat with AI tutor
   */
  async tutorChat(
    userMessage: string,
    context: {
      caseHistory?: CaseHistory[]
      studyTopic?: string
      userId?: string
      includeContext?: boolean
    } = {}
  ): Promise<string> {
    try {
      const response = await invoke<string>("tutor_chat", {
        userMessage,
        caseHistory: context.caseHistory,
        studyTopic: context.studyTopic,
        userId: context.userId,
        includeContext: context.includeContext ?? true,
      })
      return response
    } catch (error) {
      console.error("Error in tutor chat:", error)
      throw error
    }
  }

  /**
   * Generate quiz questions from case content
   */
  async generateQuizQuestions(
    caseContent: string,
    numQuestions: number = 5,
    options: {
      userId?: string
      caseIds?: string[]
      includeContext?: boolean
    } = {}
  ): Promise<QuizQuestion[]> {
    try {
      // Note: This command needs to be implemented in backend if used
      const response = await invoke<QuizQuestion[]>("generate_quiz_questions", {
        caseContent,
        numQuestions,
        userId: options.userId,
        caseIds: options.caseIds,
        includeContext: options.includeContext ?? true,
      })
      return response
    } catch (error) {
      console.error("Error generating quiz questions:", error)
      throw error
    }
  }
}

// Export singleton instance
export const tauriLLMService = new TauriLLMService()

// Export types
export type { Message, IRACResult, CaseHistory }

// Quiz question type
export interface QuizQuestion {
  question: string
  options: string[]
  correct_answer: number
  explanation: string
}
