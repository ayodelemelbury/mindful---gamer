/**
 * useUsageTracking Hook
 *
 * React hook for managing Android usage tracking state,
 * permissions, and auto-detected game sessions.
 */

import { useState, useEffect, useCallback, useRef } from "react"
import { App } from "@capacitor/app"
import {
  isNativeAndroid,
  checkUsagePermission,
  requestUsagePermission,
  getAutoTrackedSessions,
  getUnmappedGames,
  type AutoTrackedSession,
  type PermissionStatus,
  type UsageStat,
} from "@/lib/usageTracking"
import {
  clearPendingSessions,
  getLastSyncTime,
  registerBackgroundSync,
} from "@/lib/backgroundSync"
import { useUserStore } from "@/store/userStore"
import { useSessionStore } from "@/store/sessionStore"

export interface UseUsageTrackingResult {
  /** Whether auto-tracking is available (Android native) */
  isAvailable: boolean
  /** Current permission status */
  permissionStatus: PermissionStatus
  /** Auto-detected game sessions */
  autoSessions: AutoTrackedSession[]
  /** Games detected but not in our mapping */
  unmappedGames: UsageStat[]
  /** Loading state */
  isLoading: boolean
  /** Error message if any */
  error: string | null
  /** Last successful sync time */
  lastSyncTime: Date | null
  /** Request usage permission */
  requestPermission: () => Promise<void>
  /** Refresh sessions from device */
  refreshSessions: () => Promise<void>
  /** Sync a single session to main store */
  syncSession: (session: AutoTrackedSession) => void
  /** Sync all pending sessions */
  syncAllSessions: () => void
  /** Ignore a package (mark as not a game) */
  ignorePackage: (packageName: string) => void
}

export function useUsageTracking(): UseUsageTrackingResult {
  const [isAvailable] = useState(isNativeAndroid())
  const [permissionStatus, setPermissionStatus] =
    useState<PermissionStatus>("unavailable")
  const [autoSessions, setAutoSessions] = useState<AutoTrackedSession[]>([])
  const [unmappedGames, setUnmappedGames] = useState<UsageStat[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null)
  const [retryCount, setRetryCount] = useState(0)
  const awaitingPermission = useRef(false)

  // Minimum session delta to sync (prevents micro-updates)
  const MIN_SESSION_DELTA_MINUTES = 2

  const { settings, updateSettings } = useUserStore()
  const { addSession } = useSessionStore()

  // Memoize to prevent unnecessary re-renders
  const userPackageMappings = settings?.customPackageMappings ?? {}
  const ignoredPackages = settings?.ignoredPackages ?? []

  // Check permission on mount and listen for app resume
  useEffect(() => {
    if (!isAvailable) return

    checkUsagePermission().then((status) => {
      setPermissionStatus(status)
      if (status === "granted") {
        registerBackgroundSync()
      }
    })

    getLastSyncTime().then((lastSync) => {
      if (lastSync) {
        setLastSyncTime(new Date(lastSync))
      }
    })

    // Listen for app resume to check permission after returning from settings
    const listener = App.addListener("appStateChange", async ({ isActive }) => {
      if (isActive && awaitingPermission.current) {
        const status = await checkUsagePermission()
        if (status === "granted") {
          setPermissionStatus(status)
          awaitingPermission.current = false
          registerBackgroundSync()
        }
      }
    })

    return () => {
      listener.then((l) => l.remove())
    }
  }, [isAvailable])

  // Refresh auto-tracked sessions and auto-sync new ones
  const refreshSessions = useCallback(async () => {
    if (!isAvailable || permissionStatus !== "granted") return

    setIsLoading(true)
    setError(null)

    try {
      const now = new Date()
      const startOfDay = new Date(now)
      startOfDay.setHours(0, 0, 0, 0)

      const sessions = await getAutoTrackedSessions(
        userPackageMappings,
        { start: startOfDay.getTime(), end: now.getTime() },
        ignoredPackages
      )

      let dailySyncedMap = settings?.autoTrackingDailySynced || {}
      const lastSyncDate = settings?.autoTrackingLastSync
        ? new Date(settings.autoTrackingLastSync)
        : null

      if (
        !lastSyncDate ||
        lastSyncDate.getDate() !== now.getDate() ||
        lastSyncDate.getMonth() !== now.getMonth()
      ) {
        dailySyncedMap = {}
      }

      const newDailySyncedMap = { ...dailySyncedMap }
      const sessionsToAdd: { name: string; duration: number }[] = []

      sessions.forEach((session) => {
        const currentTotal = session.duration
        const syncedTotal = dailySyncedMap[session.packageName] || 0
        const delta = currentTotal - syncedTotal

        // Only sync if delta meets minimum threshold (prevents micro-updates)
        if (delta >= MIN_SESSION_DELTA_MINUTES) {
          sessionsToAdd.push({ name: session.gameName, duration: delta })
          newDailySyncedMap[session.packageName] = currentTotal
        }
      })

      if (sessionsToAdd.length > 0) {
        console.log(`[AutoTracking] Syncing ${sessionsToAdd.length} updates`)
        sessionsToAdd.forEach((s) => addSession(s.name, s.duration))

        updateSettings({
          autoTrackingLastSync: Date.now(),
          autoTrackingDailySynced: newDailySyncedMap,
        })
      }

      setAutoSessions(
        sessions.map((s) => ({
          ...s,
          synced: s.duration <= (newDailySyncedMap[s.packageName] || 0),
        }))
      )
      setLastSyncTime(new Date())
      setRetryCount(0) // Reset retry count on success

      clearPendingSessions()

      const unmapped = await getUnmappedGames(userPackageMappings)
      setUnmappedGames(
        unmapped.filter((g) => !ignoredPackages.includes(g.packageName))
      )
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch usage data"
      )
      // Auto-retry up to 3 times with exponential backoff
      if (retryCount < 3) {
        const delay = Math.pow(2, retryCount) * 1000
        setTimeout(() => {
          setRetryCount((c) => c + 1)
          refreshSessions()
        }, delay)
      }
    } finally {
      setIsLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    isAvailable,
    permissionStatus,
    userPackageMappings,
    ignoredPackages,
    settings?.autoTrackingLastSync,
    settings?.autoTrackingDailySynced,
    addSession,
    updateSettings,
  ])

  // Request permission handler
  const requestPermission = useCallback(async () => {
    if (!isAvailable) return

    try {
      awaitingPermission.current = true
      await requestUsagePermission()
      // Permission check happens in appStateChange listener when user returns
    } catch {
      awaitingPermission.current = false
      setError("Failed to open settings")
    }
  }, [isAvailable])

  // Sync a single session to the main session store
  const syncSession = useCallback(
    (session: AutoTrackedSession) => {
      addSession(session.gameName, session.duration)

      // Mark as synced
      setAutoSessions((prev) =>
        prev.map((s) => (s.id === session.id ? { ...s, synced: true } : s))
      )
    },
    [addSession]
  )

  // Sync all un-synced sessions
  const syncAllSessions = useCallback(() => {
    const unsynced = autoSessions.filter((s) => !s.synced)
    unsynced.forEach((session) => {
      addSession(session.gameName, session.duration)
    })

    // Mark all as synced
    setAutoSessions((prev) => prev.map((s) => ({ ...s, synced: true })))

    // Clear pending from background sync
    clearPendingSessions()
  }, [autoSessions, addSession])

  // Ignore a package (mark as not a game)
  const ignorePackage = useCallback(
    (packageName: string) => {
      const currentIgnored = settings?.ignoredPackages ?? []
      updateSettings({
        ignoredPackages: [...currentIgnored, packageName],
      })

      // Remove from unmapped games
      setUnmappedGames((prev) =>
        prev.filter((g) => g.packageName !== packageName)
      )
    },
    [settings, updateSettings]
  )

  // Auto-refresh when permission is granted
  useEffect(() => {
    if (permissionStatus === "granted") {
      refreshSessions()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [permissionStatus])

  return {
    isAvailable,
    permissionStatus,
    autoSessions,
    unmappedGames,
    isLoading,
    error,
    lastSyncTime,
    requestPermission,
    refreshSessions,
    syncSession,
    syncAllSessions,
    ignorePackage,
  }
}
