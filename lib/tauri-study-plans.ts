/**
 * Tauri Study Plans Service Wrapper
 * Wraps Rust backend study plan functions for use in the frontend
 */

import { invoke } from "@tauri-apps/api/core"

export interface StudyTask {
  id: string
  title: string
  description?: string
  completed: boolean
  due_date?: string
}

export interface StudyPlan {
  id: string
  user_id: string
  title: string
  description?: string
  start_date?: string
  end_date?: string
  progress: number
  tasks: StudyTask[]
  created_at: string
  updated_at: string
}

class TauriStudyPlanService {
  /**
   * Create a new study plan
   */
  async createPlan(
    userId: string,
    title: string,
    description?: string,
    startDate?: string,
    endDate?: string
  ): Promise<StudyPlan> {
    try {
      const plan = await invoke<StudyPlan>("create_study_plan", {
        userId,
        title,
        description,
        startDate,
        endDate,
      })
      return plan
    } catch (error) {
      console.error("Error creating study plan:", error)
      throw error
    }
  }

  /**
   * Get all study plans for a user
   */
  async getPlans(userId: string): Promise<StudyPlan[]> {
    try {
      const plans = await invoke<StudyPlan[]>("get_study_plans", {
        userId,
      })
      return plans
    } catch (error) {
      console.error("Error getting study plans:", error)
      throw error
    }
  }

  /**
   * Get a specific study plan
   */
  async getPlan(planId: string): Promise<StudyPlan> {
    try {
      const plan = await invoke<StudyPlan>("get_study_plan", {
        planId,
      })
      return plan
    } catch (error) {
      console.error("Error getting study plan:", error)
      throw error
    }
  }

  /**
   * Update study plan progress
   */
  async updateProgress(
    planId: string,
    progress: number,
    tasks?: StudyTask[]
  ): Promise<StudyPlan> {
    try {
      const plan = await invoke<StudyPlan>("update_study_progress", {
        planId,
        progress,
        tasks,
      })
      return plan
    } catch (error) {
      console.error("Error updating study progress:", error)
      throw error
    }
  }

  /**
   * Delete a study plan
   */
  async deletePlan(planId: string): Promise<void> {
    try {
      await invoke("delete_study_plan", {
        planId,
      })
    } catch (error) {
      console.error("Error deleting study plan:", error)
      throw error
    }
  }
}

// Export singleton instance
export const tauriStudyPlanService = new TauriStudyPlanService()

