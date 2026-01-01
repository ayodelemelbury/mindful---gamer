/**
 * Background Sync Service
 *
 * Uses Capacitor Background Fetch plugin for periodic sync
 * of auto-tracked game sessions.
 */

import { Preferences } from "@capacitor/preferences"
import {
  isNativeAndroid,
  getAutoTrackedSessions,
  type AutoTrackedSession,
} from "./usageTracking"
import { loadBackgroundConfig } from "./backgroundConfig"

const PENDING_SESSIONS_KEY = "mindful-gamer-pending-auto-sessions"
const LAST_SYNC_KEY = "mindful-gamer-last-sync"

/**
 * Register background fetch for periodic sync (Android only)
 */
export async function registerBackgroundSync(): Promise<boolean> {
  if (!isNativeAndroid()) {
    console.log("Background sync only available on Android")
    return false
  }

  try {
    const { BackgroundFetch } = await import(
      "@transistorsoft/capacitor-background-fetch"
    )

    // Configure and start background fetch
    const status = await BackgroundFetch.configure(
      {
        minimumFetchInterval: 15, // 15 minutes
        stopOnTerminate: false,
        enableHeadless: true,
      },
      async (taskId: string) => {
        console.log("[BackgroundFetch] Event received:", taskId)

        try {
          // Load user configuration for accurate detection
          const config = await loadBackgroundConfig()

          // Fetch auto-tracked sessions
          const sessions = await getAutoTrackedSessions(
            config.userMappings,
            config.userLibraryGames,
            24, // Check last 24h
            config.ignoredPackages
          )

          // Store locally for next app open
          if (sessions.length > 0) {
            const existing = await getPendingSessions()
            const merged = mergeSessionsWithoutDuplicates(existing, sessions)
            await Preferences.set({
              key: PENDING_SESSIONS_KEY,
              value: JSON.stringify(merged),
            })
          }

          // Update last sync time
          await Preferences.set({
            key: LAST_SYNC_KEY,
            value: Date.now().toString(),
          })
        } catch (error) {
          console.error("[BackgroundFetch] Error:", error)
        }

        // IMPORTANT: Signal completion
        BackgroundFetch.finish(taskId)
      },
      async (taskId: string) => {
        // Timeout callback
        console.log("[BackgroundFetch] Timeout:", taskId)
        BackgroundFetch.finish(taskId)
      }
    )

    console.log("[BackgroundFetch] Configure status:", status)
    return status === 0 // BackgroundFetchStatus.Available = 0
  } catch (error) {
    console.error("Error registering background sync:", error)
    return false
  }
}

/**
 * Get pending sessions stored by background sync
 */
export async function getPendingSessions(): Promise<AutoTrackedSession[]> {
  try {
    const { value } = await Preferences.get({ key: PENDING_SESSIONS_KEY })
    return value ? JSON.parse(value) : []
  } catch {
    return []
  }
}

/**
 * Clear pending sessions after they've been synced
 */
export async function clearPendingSessions(): Promise<void> {
  await Preferences.remove({ key: PENDING_SESSIONS_KEY })
}

/**
 * Get the last sync timestamp
 */
export async function getLastSyncTime(): Promise<number | null> {
  const { value } = await Preferences.get({ key: LAST_SYNC_KEY })
  if (!value) return null

  const parsed = parseInt(value, 10)
  return Number.isFinite(parsed) ? parsed : null
}

/**
 * Merge sessions without duplicates (by ID)
 */
function mergeSessionsWithoutDuplicates(
  existing: AutoTrackedSession[],
  newSessions: AutoTrackedSession[]
): AutoTrackedSession[] {
  const existingIds = new Set(existing.map((s) => s.id))
  const uniqueNew = newSessions.filter((s) => !existingIds.has(s.id))
  return [...existing, ...uniqueNew]
}
