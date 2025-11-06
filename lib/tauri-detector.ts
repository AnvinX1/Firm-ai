/**
 * Detect if running in Tauri environment
 */

export function isTauri(): boolean {
  return typeof window !== "undefined" && "__TAURI__" in window
}

export async function getTauriVersion(): Promise<string | null> {
  if (!isTauri()) {
    return null
  }

  try {
    const { invoke } = await import("@tauri-apps/api/core")
    return await invoke<string>("get_app_version")
  } catch {
    return null
  }
}


