/**
 * Tauri Sync Service Wrapper
 * Wraps Rust backend sync functions for use in the frontend
 */

import { invoke } from "@tauri-apps/api/core"

export interface SyncStatus {
  is_syncing: boolean
  last_sync?: string
  pending_operations: number
  is_online: boolean
}

class TauriSyncService {
  /**
   * Manually trigger sync
   */
  async syncNow(): Promise<void> {
    try {
      await invoke("sync_now")
    } catch (error) {
      console.error("Error triggering sync:", error)
      throw error
    }
  }

  /**
   * Get current sync status
   */
  async getStatus(): Promise<SyncStatus> {
    try {
      const status = await invoke<SyncStatus>("get_sync_status")
      return status
    } catch (error) {
      console.error("Error getting sync status:", error)
      throw error
    }
  }

  /**
   * Check if device is online
   */
  async isOnline(): Promise<boolean> {
    try {
      const online = await invoke<boolean>("is_online")
      return online
    } catch (error) {
      console.error("Error checking online status:", error)
      return false
    }
  }

  /**
   * Subscribe to sync status changes
   * Returns a function to unsubscribe
   */
  subscribeToStatus(
    callback: (status: SyncStatus) => void,
    intervalMs: number = 10000
  ): () => void {
    const interval = setInterval(async () => {
      try {
        const status = await this.getStatus()
        callback(status)
      } catch (error) {
        console.error("Error in sync status subscription:", error)
      }
    }, intervalMs)

    // Return unsubscribe function
    return () => clearInterval(interval)
  }
}

// Export singleton instance
export const tauriSyncService = new TauriSyncService()

