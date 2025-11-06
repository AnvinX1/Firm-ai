/**
 * Tauri Mock Tests Service Wrapper
 * Wraps Rust backend mock test functions for use in the frontend
 */

import { invoke } from "@tauri-apps/api/core"

export interface TestQuestion {
  question: string
  options: string[]
  correct_answer: number
  explanation: string
  topic?: string
}

export interface MockTest {
  id: string
  user_id: string
  title: string
  description?: string
  questions: TestQuestion[]
  created_at: string
}

export interface UserAnswer {
  question_index: number
  selected_answer: number
  is_correct: boolean
}

export interface TestResult {
  id: string
  user_id: string
  test_id: string
  score: number
  total_questions: number
  answers: UserAnswer[]
  completed_at: string
}

class TauriMockTestService {
  private apiKey: string

  constructor() {
    this.apiKey = process.env.NEXT_PUBLIC_OPENROUTER_API_KEY || ""
  }

  /**
   * Generate a new mock test
   */
  async generateTest(
    userId: string,
    topics: string[],
    numQuestions: number = 10,
    includeRagContext: boolean = true
  ): Promise<MockTest> {
    if (!this.apiKey) {
      throw new Error("OpenRouter API key is not configured")
    }

    try {
      const test = await invoke<MockTest>("generate_mock_test", {
        userId,
        topics,
        numQuestions,
        apiKey: this.apiKey,
        includeRagContext,
      })
      return test
    } catch (error) {
      console.error("Error generating mock test:", error)
      throw error
    }
  }

  /**
   * Get all mock tests for a user
   */
  async getTests(userId: string): Promise<MockTest[]> {
    try {
      const tests = await invoke<MockTest[]>("get_mock_tests", {
        userId,
      })
      return tests
    } catch (error) {
      console.error("Error getting mock tests:", error)
      throw error
    }
  }

  /**
   * Submit test results
   */
  async submitResult(
    userId: string,
    testId: string,
    answers: UserAnswer[]
  ): Promise<TestResult> {
    try {
      const result = await invoke<TestResult>("submit_test_result", {
        userId,
        testId,
        answers,
      })
      return result
    } catch (error) {
      console.error("Error submitting test result:", error)
      throw error
    }
  }
}

// Export singleton instance
export const tauriMockTestService = new TauriMockTestService()

