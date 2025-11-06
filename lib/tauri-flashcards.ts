/**
 * Tauri Flashcards Service Wrapper
 * Wraps Rust backend flashcard functions for use in the frontend
 */

import { invoke } from "@tauri-apps/api/core"

export interface FlashcardSet {
  id: string
  user_id: string
  title: string
  description?: string
  created_at: string
  updated_at: string
}

export interface Flashcard {
  id: string
  set_id: string
  front: string
  back: string
  created_at: string
}

class TauriFlashcardService {
  /**
   * Create a new flashcard set
   */
  async createSet(
    userId: string,
    title: string,
    description?: string
  ): Promise<FlashcardSet> {
    try {
      const set = await invoke<FlashcardSet>("create_flashcard_set", {
        userId,
        title,
        description,
      })
      return set
    } catch (error) {
      console.error("Error creating flashcard set:", error)
      throw error
    }
  }

  /**
   * Get all flashcard sets for a user
   */
  async getSets(userId: string): Promise<FlashcardSet[]> {
    try {
      const sets = await invoke<FlashcardSet[]>("get_flashcard_sets", {
        userId,
      })
      return sets
    } catch (error) {
      console.error("Error getting flashcard sets:", error)
      throw error
    }
  }

  /**
   * Delete a flashcard set
   */
  async deleteSet(setId: string): Promise<void> {
    try {
      await invoke("delete_flashcard_set", {
        setId,
      })
    } catch (error) {
      console.error("Error deleting flashcard set:", error)
      throw error
    }
  }

  /**
   * Add a flashcard to a set
   */
  async addFlashcard(
    setId: string,
    front: string,
    back: string
  ): Promise<Flashcard> {
    try {
      const flashcard = await invoke<Flashcard>("add_flashcard", {
        setId,
        front,
        back,
      })
      return flashcard
    } catch (error) {
      console.error("Error adding flashcard:", error)
      throw error
    }
  }

  /**
   * Get all flashcards in a set
   */
  async getFlashcards(setId: string): Promise<Flashcard[]> {
    try {
      const flashcards = await invoke<Flashcard[]>("get_flashcards", {
        setId,
      })
      return flashcards
    } catch (error) {
      console.error("Error getting flashcards:", error)
      throw error
    }
  }

  /**
   * Delete a flashcard
   */
  async deleteFlashcard(flashcardId: string): Promise<void> {
    try {
      await invoke("delete_flashcard", {
        flashcardId,
      })
    } catch (error) {
      console.error("Error deleting flashcard:", error)
      throw error
    }
  }
}

// Export singleton instance
export const tauriFlashcardService = new TauriFlashcardService()

