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
  isGameInForeground,
  type AutoTrackedSession,
  type PermissionStatus,
  type UsageStat,
} from "@/lib/usageTracking"
import {
  clearPendingSessions,
  getLastSyncTime,
  registerBackgroundSync,
} from "@/lib/backgroundSync"
import { saveBackgroundConfig } from "@/lib/backgroundConfig"
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
  /** Currently active foreground game (real-time) */
  currentForegroundGame: {
    isPlaying: boolean
    packageName: string | null
    gameName: string | null
  } | null
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
  const [currentForegroundGame, setCurrentForegroundGame] = useState<{
    isPlaying: boolean
    packageName: string | null
    gameName: string | null
  } | null>(null)
  const [retryCount, setRetryCount] = useState(0)
  const awaitingPermission = useRef(false)
  const permissionStatusRef = useRef<PermissionStatus>("unavailable")
  const pollingIntervalRef = useRef<number | null>(null)

  // Minimum session delta to sync (prevents micro-updates)
  const MIN_SESSION_DELTA_MINUTES = 2

  const { settings, updateSettings } = useUserStore()
  const { addSession, games: userLibraryGames } = useSessionStore()

  // Memoize to prevent unnecessary re-renders
  const userPackageMappings = settings?.customPackageMappings ?? {}
  const ignoredPackages = settings?.ignoredPackages ?? []

  const checkCurrentForegroundGame = useCallback(async () => {
    if (!isAvailable || permissionStatus !== "granted") return

    try {
      const result = await isGameInForeground(userPackageMappings, userLibraryGames)
      setCurrentForegroundGame(result)
    } catch (error) {
      console.error("Error checking foreground game:", error)
      setCurrentForegroundGame(null)
    }
  }, [isAvailable, permissionStatus, userPackageMappings, userLibraryGames])

  const startForegroundPolling = useCallback(() => {
    if (!isAvailable || permissionStatus !== "granted") return

    checkCurrentForegroundGame()

    pollingIntervalRef.current = window.setInterval(() => {
      checkCurrentForegroundGame()
    }, 5000)
  }, [isAvailable, permissionStatus, checkCurrentForegroundGame])

  const stopForegroundPolling = useCallback(() => {
    if (pollingIntervalRef.current) {
      window.clearInterval(pollingIntervalRef.current)
      pollingIntervalRef.current = null
    }
  }, [])

  // Check permission on mount and listen for app resume
  useEffect(() => {
    if (!isAvailable) return

    checkUsagePermission().then((status) => {
      setPermissionStatus(status)
      permissionStatusRef.current = status
      if (status === "granted") {
        registerBackgroundSync()
        startForegroundPolling()
      }
    })

    getLastSyncTime().then((lastSync) => {
      if (lastSync) {
        setLastSyncTime(new Date(lastSync))
      }
    })

    const listener = App.addListener("appStateChange", async ({ isActive }) => {
      if (isActive) {
        if (awaitingPermission.current) {
          const status = await checkUsagePermission()
          if (status === "granted") {
            setPermissionStatus(status)
            permissionStatusRef.current = status
            awaitingPermission.current = false
            registerBackgroundSync()
            refreshSessions()
            startForegroundPolling()
          }
        }
        else if (permissionStatusRef.current === "granted") {
          console.log("[AutoTracking] App resumed, refreshing sessions...")
          refreshSessions()
          checkCurrentForegroundGame()
        }
      } else {
        stopForegroundPolling()
      }
    })

    return () => {
      listener.then((l) => l.remove())
      stopForegroundPolling()
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
        userLibraryGames,
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
      setRetryCount(0)

      clearPendingSessions()

      const unmapped = await getUnmappedGames(
        userPackageMappings,
        userLibraryGames
      )
      setUnmappedGames(
        unmapped.filter((g) => !ignoredPackages.includes(g.packageName))
      )
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch usage data"
      )
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
  }, [
    isAvailable,
    permissionStatus,
    userPackageMappings,
    userLibraryGames,
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
    } catch {
      awaitingPermission.current = false
      setError("Failed to open settings")
    }
  }, [isAvailable])

  // Sync a single session to the main session store
  const syncSession = useCallback(
    (session: AutoTrackedSession) => {
      addSession(session.gameName, session.duration)

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

    setAutoSessions((prev) => prev.map((s) => ({ ...s, synced: true })))

    clearPendingSessions()
  }, [autoSessions, addSession])

  // Ignore a package (mark as not a game)
  const ignorePackage = useCallback(
    (packageName: string) => {
      const currentIgnored = settings?.ignoredPackages ?? []
      updateSettings({
        ignoredPackages: [...currentIgnored, packageName],
      })

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
      startForegroundPolling()
    }
  }, [permissionStatus])

  useEffect(() => {
    if (permissionStatus === "granted") {
      saveBackgroundConfig({
        userMappings: userPackageMappings,
        userLibraryGames: userLibraryGames,
        ignoredPackages: ignoredPackages,
      })
    }
  }, [
    permissionStatus,
    userPackageMappings,
    userLibraryGames,
    ignoredPackages,
  ])

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      stopForegroundPolling()
    }
  }, [])

  return {
    isAvailable,
    permissionStatus,
    autoSessions,
    unmappedGames,
    isLoading,
    error,
    lastSyncTime,
    currentForegroundGame,
    requestPermission,
    refreshSessions,
    syncSession,
    syncAllSessions,
    ignorePackage,
  }
}