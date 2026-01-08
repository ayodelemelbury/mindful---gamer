/**
 * Usage Tracking Service
 *
 * Platform-aware service for querying device app usage statistics.
 * Uses Capacitor plugins on Android, provides graceful fallback on web/iOS.
 */

import { Capacitor } from "@capacitor/core"
import { getGamePackageMap, getGameName, batchFuzzyMatchRAWG, saveLearnedMapping } from "./gamePackageMap"
import type { Game } from "../types"
import type { RAWGGame } from "./rawg"
import {
  UsageEventsPlugin,
  type UsageEvent,
  type QueryEventsResult,
  type CurrentForegroundResult,
  type AppDisplayInfo,
} from "../plugins/usageEvents"

export type { UsageEvent }

// ==================== Types ====================

export interface UsageStat {
  packageName: string
  appName: string | null
  totalTimeInForeground: number // milliseconds
  lastTimeUsed: number // timestamp
}

export interface AutoTrackedSession {
  id: string
  packageName: string
  gameName: string
  gameIcon: string | null
  duration: number // minutes
  detectedAt: Date
  synced: boolean
  source: "auto" | "manual"
}

export type PermissionStatus = "granted" | "denied" | "unavailable"

// ==================== Platform Detection ====================

/**
 * Check if running on native Android platform
 */
export function isNativeAndroid(): boolean {
  return Capacitor.getPlatform() === "android"
}

/**
 * Check if running as a native app (Android or iOS)
 */
export function isNativePlatform(): boolean {
  return Capacitor.isNativePlatform()
}

// ==================== Permission Management ====================

/**
 * Check if usage stats permission is granted
 */
export async function checkUsagePermission(): Promise<PermissionStatus> {
  if (!isNativeAndroid()) {
    return "unavailable"
  }

  try {
    // Try our custom plugin first (more reliable check)
    try {
      await UsageEventsPlugin.getCurrentForegroundApp()
      console.log("[UsageTracking] Permission check via UsageEventsPlugin: granted")
      return "granted"
    } catch (pluginError) {
      const errorMsg = String(pluginError)
      if (errorMsg.includes("PERMISSION_DENIED")) {
        console.log("[UsageTracking] Permission check via UsageEventsPlugin: denied")
        return "denied"
      }
      // Fall through to capgo check
    }

    const { CapacitorUsageStatsManager } = await import(
      "@capgo/capacitor-android-usagestatsmanager"
    )
    const result =
      await CapacitorUsageStatsManager.isUsageStatsPermissionGranted()
    console.log("[UsageTracking] Permission check via CapacitorUsageStatsManager:", result.granted ? "granted" : "denied")
    return result.granted ? "granted" : "denied"
  } catch (error) {
    console.error("[UsageTracking] Error checking usage permission:", error)
    return "unavailable"
  }
}

/**
 * Open system settings to request usage stats permission
 */
export async function requestUsagePermission(): Promise<void> {
  if (!isNativeAndroid()) {
    console.warn("Usage permission only available on Android")
    return
  }

  try {
    const { CapacitorUsageStatsManager } = await import(
      "@capgo/capacitor-android-usagestatsmanager"
    )
    await CapacitorUsageStatsManager.openUsageStatsSettings()
  } catch (error) {
    console.error("Error opening usage settings:", error)
    throw error
  }
}

// ==================== Usage Stats Queries ====================

/**
 * Query usage stats for a specific time range
 */
export async function queryUsageStats(
  beginTime: number,
  endTime: number
): Promise<UsageStat[]> {
  if (!isNativeAndroid()) {
    return []
  }

  try {
    const { CapacitorUsageStatsManager } = await import(
      "@capgo/capacitor-android-usagestatsmanager"
    )

    // API returns Record<packageName, UsageStats>
    const result = await CapacitorUsageStatsManager.queryAndAggregateUsageStats(
      {
        beginTime,
        endTime,
      }
    )

    // Transform Record to array format
    return Object.entries(result).map(([packageName, stat]) => ({
      packageName,
      appName: null, // Not provided by this API
      totalTimeInForeground: stat.totalTimeInForeground || 0,
      lastTimeUsed: stat.lastTimeUsed || 0,
    }))
  } catch (error) {
    console.error("Error querying usage stats:", error)
    return []
  }
}

/**
 * Get all installed packages (for discovering games)
 */
export async function queryAllPackages(): Promise<string[]> {
  if (!isNativeAndroid()) {
    return []
  }

  try {
    const { CapacitorUsageStatsManager } = await import(
      "@capgo/capacitor-android-usagestatsmanager"
    )
    const result = await CapacitorUsageStatsManager.queryAllPackages()
    // Extract package names from PackageInfo objects
    return (result.packages || []).map((pkg) => pkg.packageName)
  } catch (error) {
    console.error("Error querying packages:", error)
    return []
  }
}

// ==================== Package Categories Cache ====================

let packageCategoriesCache: Map<string, string> | null = null
let packageCategoriesCacheTime = 0
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

/**
 * Get package categories from Android PackageManager (cached)
 */
export async function getPackageCategories(): Promise<Map<string, string>> {
  const now = Date.now()
  if (packageCategoriesCache && now - packageCategoriesCacheTime < CACHE_TTL) {
    return packageCategoriesCache
  }

  const categories = new Map<string, string>()

  try {
    const { CapacitorUsageStatsManager } = await import(
      "@capgo/capacitor-android-usagestatsmanager"
    )
    const result = await CapacitorUsageStatsManager.queryAllPackages()

    for (const pkg of result.packages || []) {
      const pkgWithCategory = pkg as { packageName: string; category?: number }
      
      if (
        "category" in pkgWithCategory &&
        typeof pkgWithCategory.category === "number" &&
        pkgWithCategory.category === 0
      ) {
        categories.set(pkg.packageName, "game")
      }
    }

    packageCategoriesCache = categories
    packageCategoriesCacheTime = now
  } catch (error) {
    console.log("[UsageTracking] Could not get package categories:", error)
  }

  return categories
}

// ==================== Auto-Tracked Sessions ====================

const GAME_PACKAGE_PATTERNS = [
  /^com\.supercell\./i,
  /^com\.king\./i,
  /^com\.ea\.(game|gp)\./i,
  /^com\.gameloft\./i,
  /^com\.tencent\./i,
  /^com\.miHoYo\./i,
  /^com\.HoYoverse\./i,
  /^com\.activision\./i,
  /^com\.riotgames\./i,
  /^com\.netease\./i,
  /^com\.zynga\./i,
  /^com\.rovio\./i,
  /^com\.innersloth\./i,
  /^com\.playrix\./i,
  /^com\.moonactive\./i,
  /^com\.scopely\./i,
  /^com\.peakgames\./i,
  /^com\.outfit7\./i,
  /^com\.nianticlabs\./i,
  /^com\.kabam\./i,
  /^com\.igg\./i,
  /^com\.netmarble\./i,
  /^com\.lilithgame\./i,
  /^com\.lilithgames\./i,
  /^com\.dreamgames\./i,
  /^io\.voodoo\./i,
  /^com\.kiloo\./i,
  /^com\.halfbrick\./i,
  /^com\.ketchapp\./i,
  /^com\.miniclip\./i,
  /^com\.fingersoft\./i,
  /^com\.imangi\./i,
  /^com\.zeptolab\./i,
  /^com\.plarium\./i,
  /^com\.frogmind\./i,
  /^com\.sega\./i,
  /^com\.ubisoft\./i,
  /^com\.bandainamco/i,
  /^com\.square_enix\./i,
  /^com\.blizzard\./i,
  /^com\.epicgames\./i,
  /^com\.mojang\./i,
  /^com\.roblox\./i,
  /^com\.dts\.freefire/i,
  /^com\.pubg\./i,
  /^com\.firsttouchgames\./i,
  /^com\.wb\.goog\./i,
  /^com\.ninjakiwi\./i,
  /^com\.ncsoft\./i,
  /^com\.gamevil\./i,
  /^com\.crazylabs\./i,
  /^com\.saygames\./i,
  /^com\.azurgames\./i,
  /^com\.lionstudios\./i,
  /^com\.yodo1\./i,
  /^com\.devolver\./i,
  /^com\.madfingergames\./i,
  /\.game\./i,
  /\.games\./i,
  /^com\.game\./i,
  /^com\.games\./i,
  /^games\./i,
  /^game\./i,
  /\.puzzle\./i,
  /\.arcade\./i,
  /\.casino\./i,
  /\.rpg\./i,
  /\.racing\./i,
  /\.shooter\./i,
  /\.strategy\./i,
  /\.adventure\./i,
  /\.simulation\./i,
  /\.survival\./i,
  /\.battle\./i,
  /\.quest\./i,
  /\.saga\./i,
  /\.runner\./i,
  /\.idle\./i,
  /\.clicker\./i,
  /\.merge\./i,
  /\.match3?\./i,
  /\.solitaire\./i,
  /\.poker\./i,
  /\.slots\./i,
]

/**
 * Check if a package name looks like a game based on naming patterns
 */
function looksLikeGame(packageName: string): boolean {
  return GAME_PACKAGE_PATTERNS.some((pattern) => pattern.test(packageName))
}

/**
 * Get auto-tracked game sessions from the last N hours
 * Detection via:
 * 1. Known game packages (user library + custom mappings + fallback)
 * 2. Android CATEGORY_GAME flag (when available)
 * 3. Package name patterns that suggest games
 */
export async function getAutoTrackedSessions(
  userMappings: Record<string, string> = {},
  userLibraryGames: Game[] = [],
  timeConfig: number | { start: number; end: number } = 24,
  ignoredPackages: string[] = []
): Promise<AutoTrackedSession[]> {
  if (!isNativeAndroid()) {
    return []
  }

  let startTime: number
  let endTime: number

  if (typeof timeConfig === "number") {
    endTime = Date.now()
    startTime = endTime - timeConfig * 60 * 60 * 1000
  } else {
    startTime = timeConfig.start
    endTime = timeConfig.end
  }

  // Get usage stats
  const usageStats = await queryUsageStats(startTime, endTime)
  const ignoredSet = new Set(ignoredPackages)

  return usageStats
    .filter((stat) => {
      // Skip ignored packages
      if (ignoredSet.has(stat.packageName)) return false

      // Skip very short sessions (less than 1 minute)
      if (stat.totalTimeInForeground < 60000) return false

      // ONLY track games explicitly added to user's library (with packageName)
      const isInLibrary = userLibraryGames.some(g => g.packageName === stat.packageName)
      return isInLibrary
    })
    .sort((a, b) => b.lastTimeUsed - a.lastTimeUsed)
    .map((stat) => ({
      id: crypto.randomUUID(),
      packageName: stat.packageName,
      gameName:
        getGameName(stat.packageName, userMappings, userLibraryGames) ||
        stat.appName ||
        formatPackageName(stat.packageName),
      gameIcon: null,
      duration: Math.round(stat.totalTimeInForeground / 60000),
      detectedAt: new Date(stat.lastTimeUsed),
      synced: false,
      source: "auto" as const,
    }))
}

/**
 * Format a package name into a readable game name
 * e.g., "com.company.gamename" -> "Gamename"
 */
function formatPackageName(packageName: string): string {
  const parts = packageName.split(".")
  const lastPart = parts[parts.length - 1] || packageName
  // Capitalize first letter and add spaces before capitals
  return lastPart
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (str) => str.toUpperCase())
    .trim()
}

/**
 * Get potential games (apps in CATEGORY_GAME or matching game patterns) that aren't mapped yet.
 * Bug fix: Now includes regex-matched games for user to confirm.
 */
export async function getUnmappedGames(
  userMappings: Record<string, string> = {},
  userLibraryGames: Game[] = []
): Promise<UsageStat[]> {
  if (!isNativeAndroid()) {
    return []
  }

  const endTime = Date.now()
  const startTime = endTime - 7 * 24 * 60 * 60 * 1000 // Last 7 days

  const usageStats = await queryUsageStats(startTime, endTime)
  const packageMap = getGamePackageMap(userMappings, userLibraryGames)
  const packageCategories = await getPackageCategories()

  return usageStats
    .filter((stat) => {
      // Skip if already in our package map
      if (packageMap.has(stat.packageName)) return false

      // Include if: marked as game by Android OR looks like a game by name pattern
      const isCategoryGame = packageCategories.get(stat.packageName) === "game"
      const hasGameLikeName = looksLikeGame(stat.packageName)

      return isCategoryGame || hasGameLikeName
    })
    .filter((stat) => stat.totalTimeInForeground > 60000)
    .sort((a, b) => b.totalTimeInForeground - a.totalTimeInForeground)
}


// ==================== Real-Time Detection (UsageEvents API) ====================

// Event type constants from Android UsageEvents.Event
const EVENT_MOVE_TO_FOREGROUND = 1
const EVENT_MOVE_TO_BACKGROUND = 2
const EVENT_ACTIVITY_RESUMED = 23

/**
 * Calculate session durations from UsageEvents (more reliable than aggregated stats).
 * This parses foreground/background transitions to compute actual time spent in each app.
 */
export async function getSessionsFromEvents(
  beginTime: number,
  endTime: number,
  userMappings: Record<string, string> = {},
  userLibraryGames: Game[] = [],
  ignoredPackages: string[] = []
): Promise<AutoTrackedSession[]> {
  if (!isNativeAndroid()) {
    return []
  }

  try {
    const events = await queryUsageEvents(beginTime, endTime)

    if (events.length === 0) {
      console.log("[UsageTracking] No usage events found in time range")
      return []
    }

    console.log(`[UsageTracking] Processing ${events.length} usage events`)

    // Track foreground time per package
    const packageTimes = new Map<string, { totalMs: number; lastForeground: number | null; lastSeen: number }>()
    const ignoredSet = new Set(ignoredPackages)

    // Sort events by timestamp
    const sortedEvents = [...events].sort((a, b) => a.timestamp - b.timestamp)

    for (const event of sortedEvents) {
      if (ignoredSet.has(event.packageName)) continue

      const isForeground = event.eventType === EVENT_MOVE_TO_FOREGROUND || event.eventType === EVENT_ACTIVITY_RESUMED
      const isBackground = event.eventType === EVENT_MOVE_TO_BACKGROUND

      let record = packageTimes.get(event.packageName)
      if (!record) {
        record = { totalMs: 0, lastForeground: null, lastSeen: event.timestamp }
        packageTimes.set(event.packageName, record)
      }

      if (isForeground) {
        record.lastForeground = event.timestamp
        record.lastSeen = event.timestamp
      } else if (isBackground && record.lastForeground !== null) {
        // Calculate time spent in foreground
        const duration = event.timestamp - record.lastForeground
        if (duration > 0 && duration < 12 * 60 * 60 * 1000) { // Cap at 12 hours to avoid bugs
          record.totalMs += duration
        }
        record.lastForeground = null
        record.lastSeen = event.timestamp
      }
    }

    // If app is still in foreground (no background event), count time until now
    const now = Date.now()
    for (const [, record] of packageTimes) {
      if (record.lastForeground !== null) {
        const duration = Math.min(now, endTime) - record.lastForeground
        if (duration > 0 && duration < 12 * 60 * 60 * 1000) {
          record.totalMs += duration
        }
      }
    }

    // Get display names for all packages
    const allPackageNames = Array.from(packageTimes.keys())
    const displayNames = await getAppDisplayNames(allPackageNames)

    const sessions: AutoTrackedSession[] = []

    for (const [packageName, record] of packageTimes) {
      // Skip very short sessions (less than 1 minute)
      if (record.totalMs < 60000) continue

      // ONLY track games explicitly added to user's library (with packageName)
      const isInLibrary = userLibraryGames.some(g => g.packageName === packageName)

      if (isInLibrary) {
        // Try to get the best name: known mapping > display name > formatted package name
        const knownName = getGameName(packageName, userMappings, userLibraryGames)
        const displayName = displayNames.get(packageName)?.displayName
        const gameName = knownName || displayName || formatPackageName(packageName)

        sessions.push({
          id: crypto.randomUUID(),
          packageName,
          gameName,
          gameIcon: null,
          duration: Math.round(record.totalMs / 60000),
          detectedAt: new Date(record.lastSeen),
          synced: false,
          source: "auto" as const,
        })
      }
    }

    console.log(`[UsageTracking] Found ${sessions.length} game sessions from events`)
    return sessions.sort((a, b) => b.detectedAt.getTime() - a.detectedAt.getTime())
  } catch (error) {
    console.error("[UsageTracking] Error calculating sessions from events:", error)
    return []
  }
}

/**
 * Get auto-tracked sessions using the best available method.
 * Tries UsageEvents first (more accurate), falls back to aggregated stats.
 */
export async function getAutoTrackedSessionsHybrid(
  userMappings: Record<string, string> = {},
  userLibraryGames: Game[] = [],
  timeConfig: number | { start: number; end: number } = 24,
  ignoredPackages: string[] = []
): Promise<AutoTrackedSession[]> {
  let startTime: number
  let endTime: number

  if (typeof timeConfig === "number") {
    endTime = Date.now()
    startTime = endTime - timeConfig * 60 * 60 * 1000
  } else {
    startTime = timeConfig.start
    endTime = timeConfig.end
  }

  // Try UsageEvents API first (more reliable and granular)
  try {
    const eventSessions = await getSessionsFromEvents(
      startTime,
      endTime,
      userMappings,
      userLibraryGames,
      ignoredPackages
    )

    if (eventSessions.length > 0) {
      console.log("[UsageTracking] Using UsageEvents-based sessions")
      return eventSessions
    }
  } catch (error) {
    console.warn("[UsageTracking] UsageEvents failed, falling back to stats:", error)
  }

  // Fallback to aggregated stats
  console.log("[UsageTracking] Falling back to aggregated usage stats")
  return getAutoTrackedSessions(userMappings, userLibraryGames, timeConfig, ignoredPackages)
}

/**
 * Query usage events for a specific time range.
 * Returns foreground/background transition events.
 */
export async function queryUsageEvents(
  beginTime: number,
  endTime: number
): Promise<UsageEvent[]> {
  if (!isNativeAndroid()) {
    return []
  }

  try {
    const result: QueryEventsResult = await UsageEventsPlugin.queryEvents({
      beginTime,
      endTime,
    })
    return result.events || []
  } catch (error) {
    console.error("Error querying usage events:", error)
    return []
  }
}

/**
 * Get the currently active foreground app.
 * Returns null if unable to determine or on non-Android platforms.
 */
export async function getCurrentForegroundApp(): Promise<string | null> {
  if (!isNativeAndroid()) {
    return null
  }

  try {
    const result: CurrentForegroundResult =
      await UsageEventsPlugin.getCurrentForegroundApp()
    return result.packageName
  } catch (error) {
    console.error("Error getting foreground app:", error)
    return null
  }
}

/**
 * Check if a specific game is currently in the foreground.
 * Now also indicates if the game is in the user's library or untracked.
 */
export async function isGameInForeground(
  _userMappings: Record<string, string> = {},
  userLibraryGames: Game[] = []
): Promise<{
  isPlaying: boolean
  isInLibrary: boolean
  packageName: string | null
  gameName: string | null
}> {
  const foregroundPkg = await getCurrentForegroundApp()

  if (!foregroundPkg) {
    return { isPlaying: false, isInLibrary: false, packageName: null, gameName: null }
  }

  // Check if in user's library first
  const libraryGame = userLibraryGames.find(g => g.packageName === foregroundPkg)
  if (libraryGame) {
    return {
      isPlaying: true,
      isInLibrary: true,
      packageName: foregroundPkg,
      gameName: libraryGame.name
    }
  }

  // Check if it looks like a game (for untracked game detection)
  const packageCategories = await getPackageCategories()
  const isCategoryGame = packageCategories.get(foregroundPkg) === "game"
  const hasGameLikeName = looksLikeGame(foregroundPkg)

  if (isCategoryGame || hasGameLikeName) {
    // It's a game but not in library - untracked
    const displayNames = await getAppDisplayNames([foregroundPkg])
    const displayName = displayNames.get(foregroundPkg)?.displayName || formatPackageName(foregroundPkg)
    return {
      isPlaying: true,
      isInLibrary: false,
      packageName: foregroundPkg,
      gameName: displayName
    }
  }

  return { isPlaying: false, isInLibrary: false, packageName: null, gameName: null }
}

/**
 * Interface for untracked game detection
 */
export interface UntrackedGame {
  packageName: string
  displayName: string
  isCurrentlyPlaying: boolean
}

/**
 * Detect games being played that are NOT in the user's library.
 * Used to show "untracked game" notifications.
 */
export async function getUntrackedGamesPlaying(
  userLibraryGames: Game[] = [],
  ignoredPackages: string[] = []
): Promise<UntrackedGame[]> {
  if (!isNativeAndroid()) {
    return []
  }

  const ignoredSet = new Set(ignoredPackages)
  const libraryPackages = new Set(userLibraryGames.map(g => g.packageName).filter(Boolean))

  // Check last 30 minutes of usage
  const now = Date.now()
  const thirtyMinutesAgo = now - 30 * 60 * 1000

  try {
    const usageStats = await queryUsageStats(thirtyMinutesAgo, now)
    const packageCategories = await getPackageCategories()

    // Filter to game-like apps not in library
    const untrackedPackages = usageStats
      .filter(stat => {
        if (ignoredSet.has(stat.packageName)) return false
        if (libraryPackages.has(stat.packageName)) return false
        if (stat.totalTimeInForeground < 60000) return false // At least 1 minute

        const isCategoryGame = packageCategories.get(stat.packageName) === "game"
        const hasGameLikeName = looksLikeGame(stat.packageName)
        return isCategoryGame || hasGameLikeName
      })
      .map(stat => stat.packageName)

    if (untrackedPackages.length === 0) {
      return []
    }

    // Get display names
    const displayNames = await getAppDisplayNames(untrackedPackages)

    // Check which one is currently in foreground
    const currentForeground = await getCurrentForegroundApp()

    return untrackedPackages.map(pkg => ({
      packageName: pkg,
      displayName: displayNames.get(pkg)?.displayName || formatPackageName(pkg),
      isCurrentlyPlaying: pkg === currentForeground,
    }))
  } catch (error) {
    console.error("[UsageTracking] Error getting untracked games:", error)
    return []
  }
}

export async function getAppDisplayNames(
  packageNames: string[]
): Promise<Map<string, AppDisplayInfo>> {
  if (!isNativeAndroid() || packageNames.length === 0) {
    return new Map()
  }

  try {
    const result = await UsageEventsPlugin.getAppDisplayNames({ packageNames })
    return new Map(result.apps.map((app) => [app.packageName, app]))
  } catch (error) {
    console.error("Error getting app display names:", error)
    return new Map()
  }
}

export interface EnhancedUnmappedGame {
  packageName: string
  displayName: string
  totalTimeInForeground: number
  rawgMatch: RAWGGame | null
  confidence: "high" | "medium" | "low"
}

export async function getUnmappedGamesEnhanced(
  userMappings: Record<string, string> = {},
  userLibraryGames: Game[] = []
): Promise<EnhancedUnmappedGame[]> {
  const unmapped = await getUnmappedGames(userMappings, userLibraryGames)

  const packageNames = unmapped.map((u) => u.packageName)
  const displayNames = await getAppDisplayNames(packageNames)

  const appsToMatch = unmapped
    .map((u) => ({
      packageName: u.packageName,
      displayName: displayNames.get(u.packageName)?.displayName || "",
      totalTimeInForeground: u.totalTimeInForeground,
    }))
    .filter((a) => a.displayName.length > 0)

  const rawgMatches = await batchFuzzyMatchRAWG(appsToMatch)

  return appsToMatch.map((app) => {
    const rawgMatch = rawgMatches.get(app.packageName) || null
    return {
      ...app,
      rawgMatch,
      confidence: rawgMatch ? "high" : ("low" as const),
    }
  })
}

export async function autoLearnGameMapping(
  packageName: string,
  displayName: string,
  userMappings: Record<string, string> = {},
  userLibraryGames: Game[] = []
): Promise<{ success: boolean; gameName: string | null }> {
  const packageMap = getGamePackageMap(userMappings, userLibraryGames)

  if (packageMap.has(packageName)) {
    return { success: true, gameName: packageMap.get(packageName) || null }
  }

  const apps = [{ packageName, displayName }]
  const matches = await batchFuzzyMatchRAWG(apps)
  const match = matches.get(packageName)

  if (match) {
    saveLearnedMapping(packageName, match.name)
    return { success: true, gameName: match.name }
  }

  return { success: false, gameName: null }
}

// ==================== Debug & Diagnostics ====================

export interface DiagnosticInfo {
  isAndroid: boolean
  permissionStatus: PermissionStatus
  currentForegroundApp: string | null
  recentApps: Array<{
    packageName: string
    displayName: string
    isGame: boolean
    detectionReason: string
    totalTimeMs: number
  }>
  detectedGames: number
  totalAppsUsed: number
  usageEventsWorking: boolean
  aggregatedStatsWorking: boolean
  errors: string[]
}

/**
 * Get diagnostic information about the auto-tracking system.
 * Useful for debugging why sessions aren't appearing.
 */
export async function getDiagnosticInfo(
  userMappings: Record<string, string> = {},
  userLibraryGames: Game[] = []
): Promise<DiagnosticInfo> {
  const errors: string[] = []
  const info: DiagnosticInfo = {
    isAndroid: isNativeAndroid(),
    permissionStatus: "unavailable",
    currentForegroundApp: null,
    recentApps: [],
    detectedGames: 0,
    totalAppsUsed: 0,
    usageEventsWorking: false,
    aggregatedStatsWorking: false,
    errors: [],
  }

  if (!info.isAndroid) {
    info.errors.push("Not running on Android - auto-tracking unavailable")
    return info
  }

  // Check permission
  try {
    info.permissionStatus = await checkUsagePermission()
    if (info.permissionStatus !== "granted") {
      info.errors.push(`Permission not granted: ${info.permissionStatus}`)
    }
  } catch (e) {
    errors.push(`Permission check failed: ${e}`)
  }

  // Get current foreground app
  try {
    info.currentForegroundApp = await getCurrentForegroundApp()
  } catch (e) {
    errors.push(`Get foreground app failed: ${e}`)
  }

  // Test UsageEvents API
  const now = Date.now()
  const oneHourAgo = now - 60 * 60 * 1000

  try {
    const events = await queryUsageEvents(oneHourAgo, now)
    info.usageEventsWorking = events.length > 0
    if (!info.usageEventsWorking) {
      errors.push("UsageEvents API returned no events in last hour")
    }
  } catch (e) {
    errors.push(`UsageEvents API failed: ${e}`)
  }

  // Test aggregated stats
  try {
    const stats = await queryUsageStats(oneHourAgo, now)
    info.aggregatedStatsWorking = stats.length > 0
    info.totalAppsUsed = stats.length
    if (!info.aggregatedStatsWorking) {
      errors.push("Aggregated stats returned no data in last hour")
    }
  } catch (e) {
    errors.push(`Aggregated stats failed: ${e}`)
  }

  // Get recent apps with detection info
  try {
    const stats = await queryUsageStats(oneHourAgo, now)
    const packageMap = getGamePackageMap(userMappings, userLibraryGames)
    const packageCategories = await getPackageCategories()
    const packageNames = stats.slice(0, 20).map((s) => s.packageName)
    const displayNames = await getAppDisplayNames(packageNames)

    info.recentApps = stats.slice(0, 20).map((stat) => {
      const isKnownGame = packageMap.has(stat.packageName)
      const isCategoryGame = packageCategories.get(stat.packageName) === "game"
      const hasGameLikeName = looksLikeGame(stat.packageName)
      const isGame = isKnownGame || isCategoryGame || hasGameLikeName

      let detectionReason = "Not detected as game"
      if (isKnownGame) detectionReason = "Known game (in package map)"
      else if (isCategoryGame) detectionReason = "Android CATEGORY_GAME"
      else if (hasGameLikeName) detectionReason = "Package name pattern match"

      return {
        packageName: stat.packageName,
        displayName: displayNames.get(stat.packageName)?.displayName || stat.packageName,
        isGame,
        detectionReason,
        totalTimeMs: stat.totalTimeInForeground,
      }
    })

    info.detectedGames = info.recentApps.filter((a) => a.isGame).length
  } catch (e) {
    errors.push(`Recent apps analysis failed: ${e}`)
  }

  info.errors = errors
  return info
}

/**
 * Check if a package looks like a game (exported for testing)
 */
export { looksLikeGame }
