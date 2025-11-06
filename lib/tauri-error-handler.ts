/**
 * Tauri Error Handler
 * Converts Rust error messages to user-friendly format
 */

export interface UserFriendlyError {
  title: string
  message: string
  recoverable: boolean
  action?: string
}

/**
 * Parse Rust error and return user-friendly message
 */
export function handleTauriError(error: unknown): UserFriendlyError {
  const errorString = String(error)

  // Database errors
  if (errorString.includes("Database error") || errorString.includes("SQLite error")) {
    return {
      title: "Database Error",
      message: "There was a problem accessing your local data. Please try restarting the app.",
      recoverable: true,
      action: "restart",
    }
  }

  // Supabase/Network errors
  if (errorString.includes("Supabase error") || errorString.includes("Network")) {
    return {
      title: "Connection Error",
      message: "Unable to connect to the cloud. Your changes are saved locally and will sync when you're back online.",
      recoverable: true,
      action: "retry",
    }
  }

  // OpenRouter/LLM errors
  if (errorString.includes("OpenRouter") || errorString.includes("LLM service")) {
    return {
      title: "AI Service Error",
      message: "The AI service is temporarily unavailable. Please try again in a moment.",
      recoverable: true,
      action: "retry",
    }
  }

  // API key errors
  if (errorString.includes("API key")) {
    return {
      title: "Configuration Error",
      message: "AI features require an API key to be configured. Please check your settings.",
      recoverable: false,
      action: "settings",
    }
  }

  // Validation errors
  if (errorString.includes("Validation error") || errorString.includes("Invalid input")) {
    const match = errorString.match(/Validation error: (.+)/) || errorString.match(/Invalid input: (.+)/)
    const detail = match ? match[1] : "Please check your input and try again."
    return {
      title: "Invalid Input",
      message: detail,
      recoverable: true,
      action: "fix",
    }
  }

  // Offline errors
  if (errorString.includes("Offline") || errorString.includes("requires network")) {
    return {
      title: "Offline Mode",
      message: "This operation requires an internet connection. Please check your network and try again.",
      recoverable: true,
      action: "online",
    }
  }

  // PDF/Document processing errors
  if (errorString.includes("PDF") || errorString.includes("Document processing")) {
    return {
      title: "Document Error",
      message: "Unable to process this document. Please ensure it's a valid PDF file.",
      recoverable: true,
      action: "retry",
    }
  }

  // Sync errors
  if (errorString.includes("Sync error") || errorString.includes("Sync conflict")) {
    return {
      title: "Sync Issue",
      message: "There was a problem syncing your data. Your changes are saved locally.",
      recoverable: true,
      action: "sync",
    }
  }

  // RAG/Search errors
  if (errorString.includes("RAG") || errorString.includes("Vector search")) {
    return {
      title: "Search Error",
      message: "Unable to search at this time. Please try again.",
      recoverable: true,
      action: "retry",
    }
  }

  // Authentication errors
  if (errorString.includes("Authentication") || errorString.includes("Unauthorized")) {
    return {
      title: "Authentication Required",
      message: "Please log in to continue.",
      recoverable: false,
      action: "login",
    }
  }

  // File system errors
  if (errorString.includes("File") || errorString.includes("permission")) {
    return {
      title: "File Access Error",
      message: "Unable to access the file. Please check file permissions.",
      recoverable: true,
      action: "permissions",
    }
  }

  // Not found errors
  if (errorString.includes("Not found")) {
    return {
      title: "Not Found",
      message: "The requested item could not be found.",
      recoverable: false,
      action: "refresh",
    }
  }

  // Generic/Unknown errors
  return {
    title: "Unexpected Error",
    message: "An unexpected error occurred. Please try again.",
    recoverable: true,
    action: "retry",
  }
}

/**
 * Get action button text for error action
 */
export function getActionButtonText(action?: string): string {
  switch (action) {
    case "retry":
      return "Try Again"
    case "restart":
      return "Restart App"
    case "settings":
      return "Open Settings"
    case "login":
      return "Log In"
    case "sync":
      return "Sync Now"
    case "online":
      return "Check Connection"
    case "refresh":
      return "Refresh"
    case "permissions":
      return "Check Permissions"
    case "fix":
      return "OK"
    default:
      return "OK"
  }
}

/**
 * Check if error indicates offline mode
 */
export function isOfflineError(error: unknown): boolean {
  const errorString = String(error)
  return (
    errorString.includes("Offline") ||
    errorString.includes("Network") ||
    errorString.includes("Supabase error")
  )
}

/**
 * Check if operation should be retried
 */
export function shouldRetry(error: unknown, attemptCount: number = 0): boolean {
  if (attemptCount >= 3) return false

  const errorString = String(error)
  
  // Retry transient errors
  return (
    errorString.includes("Network") ||
    errorString.includes("timeout") ||
    errorString.includes("temporarily unavailable") ||
    (errorString.includes("OpenRouter") && !errorString.includes("API key"))
  )
}

/**
 * Get retry delay in milliseconds (exponential backoff)
 */
export function getRetryDelay(attemptCount: number): number {
  return Math.min(1000 * Math.pow(2, attemptCount), 10000)
}

