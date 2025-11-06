/**
 * Unified LLM Service
 * Uses Tauri backend when available, otherwise falls back to API routes
 */

import { isTauri } from "./tauri-detector"
import { tauriLLMService, QuizQuestion } from "./tauri-llm"
import { tauriRAGService, SearchResult, ProcessedDocument } from "./tauri-rag"
import { tauriFlashcardService, FlashcardSet, Flashcard } from "./tauri-flashcards"
import { tauriStudyPlanService, StudyPlan, StudyTask } from "./tauri-study-plans"
import { tauriMockTestService, MockTest, TestResult, UserAnswer } from "./tauri-mock-tests"
import { tauriSyncService, SyncStatus } from "./tauri-sync"
import { handleTauriError } from "./tauri-error-handler"

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

class UnifiedLLMService {
  private useTauri: boolean

  constructor() {
    this.useTauri = isTauri()
  }

  /**
   * Check if running in Tauri environment
   */
  isTauriMode(): boolean {
    return this.useTauri
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
      if (this.useTauri) {
        return await tauriLLMService.generateIRAC(caseText, options)
      } else {
        const response = await fetch("/api/analyze-case", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            caseText,
            caseTitle: "Case Analysis"
          }),
        })
        const result = await response.json()
        if (!result.success) {
          throw new Error(result.error || "Failed to generate IRAC analysis")
        }
        const { title, ...iracData } = result.data
        return iracData as IRACResult
      }
    } catch (error) {
      if (this.useTauri) {
        const friendlyError = handleTauriError(error)
        throw new Error(friendlyError.message)
      }
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
      if (this.useTauri) {
        return await tauriLLMService.tutorChat(userMessage, context)
      } else {
        const response = await fetch("/api/tutor", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: userMessage, context }),
        })
        const result = await response.json()
        if (!result.success) {
          throw new Error(result.error || "Failed to get tutor response")
        }
        return result.data.message
      }
    } catch (error) {
      if (this.useTauri) {
        const friendlyError = handleTauriError(error)
        throw new Error(friendlyError.message)
      }
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
      if (this.useTauri) {
        return await tauriLLMService.chat(messages, options)
      } else {
        throw new Error("Direct chat not available in browser mode. Use tutorChat or generateIRAC instead.")
      }
    } catch (error) {
      if (this.useTauri) {
        const friendlyError = handleTauriError(error)
        throw new Error(friendlyError.message)
      }
      throw error
    }
  }

  /**
   * Generate quiz questions
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
      if (this.useTauri) {
        return await tauriLLMService.generateQuizQuestions(caseContent, numQuestions, options)
      } else {
        // Fallback to API route (TODO: implement API endpoint)
        throw new Error("Quiz generation via API not yet implemented")
      }
    } catch (error) {
      if (this.useTauri) {
        const friendlyError = handleTauriError(error)
        throw new Error(friendlyError.message)
      }
      throw error
    }
  }

  // RAG Methods
  async searchDocuments(
    query: string,
    options: {
      limit?: number
      userId?: string
      caseIds?: string[]
      includeKnowledgeBase?: boolean
    } = {}
  ): Promise<SearchResult[]> {
    if (!this.useTauri) {
      throw new Error("Document search only available in desktop mode")
    }
    try {
      return await tauriRAGService.search(query, options)
    } catch (error) {
      const friendlyError = handleTauriError(error)
      throw new Error(friendlyError.message)
    }
  }

  async processPDF(
    pdfData: Uint8Array,
    metadata: {
      userId: string
      caseId?: string
      title: string
      documentType: string
    }
  ): Promise<ProcessedDocument> {
    if (!this.useTauri) {
      throw new Error("PDF processing only available in desktop mode")
    }
    try {
      return await tauriRAGService.processPDF(pdfData, metadata)
    } catch (error) {
      const friendlyError = handleTauriError(error)
      throw new Error(friendlyError.message)
    }
  }

  // Flashcard Methods
  async createFlashcardSet(userId: string, title: string, description?: string): Promise<FlashcardSet> {
    if (!this.useTauri) {
      throw new Error("Flashcards only available in desktop mode")
    }
    try {
      return await tauriFlashcardService.createSet(userId, title, description)
    } catch (error) {
      const friendlyError = handleTauriError(error)
      throw new Error(friendlyError.message)
    }
  }

  async getFlashcardSets(userId: string): Promise<FlashcardSet[]> {
    if (!this.useTauri) {
      throw new Error("Flashcards only available in desktop mode")
    }
    try {
      return await tauriFlashcardService.getSets(userId)
    } catch (error) {
      const friendlyError = handleTauriError(error)
      throw new Error(friendlyError.message)
    }
  }

  async addFlashcard(setId: string, front: string, back: string): Promise<Flashcard> {
    if (!this.useTauri) {
      throw new Error("Flashcards only available in desktop mode")
    }
    try {
      return await tauriFlashcardService.addFlashcard(setId, front, back)
    } catch (error) {
      const friendlyError = handleTauriError(error)
      throw new Error(friendlyError.message)
    }
  }

  async getFlashcards(setId: string): Promise<Flashcard[]> {
    if (!this.useTauri) {
      throw new Error("Flashcards only available in desktop mode")
    }
    try {
      return await tauriFlashcardService.getFlashcards(setId)
    } catch (error) {
      const friendlyError = handleTauriError(error)
      throw new Error(friendlyError.message)
    }
  }

  // Study Plan Methods
  async createStudyPlan(
    userId: string,
    title: string,
    description?: string,
    startDate?: string,
    endDate?: string
  ): Promise<StudyPlan> {
    if (!this.useTauri) {
      throw new Error("Study plans only available in desktop mode")
    }
    try {
      return await tauriStudyPlanService.createPlan(userId, title, description, startDate, endDate)
    } catch (error) {
      const friendlyError = handleTauriError(error)
      throw new Error(friendlyError.message)
    }
  }

  async getStudyPlans(userId: string): Promise<StudyPlan[]> {
    if (!this.useTauri) {
      throw new Error("Study plans only available in desktop mode")
    }
    try {
      return await tauriStudyPlanService.getPlans(userId)
    } catch (error) {
      const friendlyError = handleTauriError(error)
      throw new Error(friendlyError.message)
    }
  }

  async updateStudyProgress(planId: string, progress: number, tasks?: StudyTask[]): Promise<StudyPlan> {
    if (!this.useTauri) {
      throw new Error("Study plans only available in desktop mode")
    }
    try {
      return await tauriStudyPlanService.updateProgress(planId, progress, tasks)
    } catch (error) {
      const friendlyError = handleTauriError(error)
      throw new Error(friendlyError.message)
    }
  }

  // Mock Test Methods
  async generateMockTest(
    userId: string,
    topics: string[],
    numQuestions: number = 10,
    includeRagContext: boolean = true
  ): Promise<MockTest> {
    if (!this.useTauri) {
      throw new Error("Mock tests only available in desktop mode")
    }
    try {
      return await tauriMockTestService.generateTest(userId, topics, numQuestions, includeRagContext)
    } catch (error) {
      const friendlyError = handleTauriError(error)
      throw new Error(friendlyError.message)
    }
  }

  async getMockTests(userId: string): Promise<MockTest[]> {
    if (!this.useTauri) {
      throw new Error("Mock tests only available in desktop mode")
    }
    try {
      return await tauriMockTestService.getTests(userId)
    } catch (error) {
      const friendlyError = handleTauriError(error)
      throw new Error(friendlyError.message)
    }
  }

  async submitTestResult(userId: string, testId: string, answers: UserAnswer[]): Promise<TestResult> {
    if (!this.useTauri) {
      throw new Error("Mock tests only available in desktop mode")
    }
    try {
      return await tauriMockTestService.submitResult(userId, testId, answers)
    } catch (error) {
      const friendlyError = handleTauriError(error)
      throw new Error(friendlyError.message)
    }
  }

  // Sync Methods
  async syncNow(): Promise<void> {
    if (!this.useTauri) {
      throw new Error("Sync only available in desktop mode")
    }
    try {
      return await tauriSyncService.syncNow()
    } catch (error) {
      const friendlyError = handleTauriError(error)
      throw new Error(friendlyError.message)
    }
  }

  async getSyncStatus(): Promise<SyncStatus> {
    if (!this.useTauri) {
      throw new Error("Sync only available in desktop mode")
    }
    try {
      return await tauriSyncService.getStatus()
    } catch (error) {
      const friendlyError = handleTauriError(error)
      throw new Error(friendlyError.message)
    }
  }

  async isOnline(): Promise<boolean> {
    if (!this.useTauri) {
      return navigator.onLine
    }
    try {
      return await tauriSyncService.isOnline()
    } catch (error) {
      return navigator.onLine
    }
  }
}

// Export singleton instance
export const unifiedLLMService = new UnifiedLLMService()

// Export types
export type { Message, IRACResult, CaseHistory, QuizQuestion, SearchResult, FlashcardSet, StudyPlan, MockTest }

