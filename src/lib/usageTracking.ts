/**
 * Usage Tracking Service
 *
 * Platform-aware service for querying device app usage statistics.
 * Uses Capacitor plugins on Android, provides graceful fallback on web/iOS.
 */

import { Capacitor } from "@capacitor/core"
import { getGamePackageMap, getGameName } from "./gamePackageMap"

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
    const { CapacitorUsageStatsManager } = await import(
      "@capgo/capacitor-android-usagestatsmanager"
    )
    const result =
      await CapacitorUsageStatsManager.isUsageStatsPermissionGranted()
    return result.granted ? "granted" : "denied"
  } catch (error) {
    console.error("Error checking usage permission:", error)
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
      if (pkgWithCategory.category === 0) {
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

// Common game-related package name patterns
const GAME_PACKAGE_PATTERNS = [
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
 * 1. Known game packages (curated list + user mappings)
 * 2. Android CATEGORY_GAME flag (when available)
 * 3. Package name patterns that suggest games
 */
export async function getAutoTrackedSessions(
  userMappings: Record<string, string> = {},
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

  // Get usage stats and package category info
  const usageStats = await queryUsageStats(startTime, endTime)
  const packageMap = getGamePackageMap(userMappings)
  const ignoredSet = new Set(ignoredPackages)

  // Also get package category info for game detection
  const packageCategories = await getPackageCategories()

  return usageStats
    .filter((stat) => {
      // Skip ignored packages
      if (ignoredSet.has(stat.packageName)) return false

      // Skip very short sessions (less than 1 minute)
      if (stat.totalTimeInForeground < 60000) return false

      // Include if: in package map, OR marked as game by Android, OR looks like a game
      const isKnownGame = packageMap.has(stat.packageName)
      const isCategoryGame = packageCategories.get(stat.packageName) === "game"
      const hasGameLikeName = looksLikeGame(stat.packageName)

      return isKnownGame || isCategoryGame || hasGameLikeName
    })
    .sort((a, b) => b.lastTimeUsed - a.lastTimeUsed)
    .map((stat) => ({
      id: `auto-${stat.packageName}-${stat.lastTimeUsed}`,
      packageName: stat.packageName,
      gameName:
        getGameName(stat.packageName, userMappings) ||
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
 * Get potential games (apps in CATEGORY_GAME) that aren't mapped yet
 */
export async function getUnmappedGames(
  userMappings: Record<string, string> = {}
): Promise<UsageStat[]> {
  if (!isNativeAndroid()) {
    return []
  }

  const endTime = Date.now()
  const startTime = endTime - 7 * 24 * 60 * 60 * 1000 // Last 7 days

  const usageStats = await queryUsageStats(startTime, endTime)
  const packageMap = getGamePackageMap(userMappings)
  const packageCategories = await getPackageCategories()

  return usageStats
    .filter((stat) => {
      const isCategoryGame = packageCategories.get(stat.packageName) === "game"
      return isCategoryGame && !packageMap.has(stat.packageName)
    })
    .filter((stat) => stat.totalTimeInForeground > 60000)
    .sort((a, b) => b.totalTimeInForeground - a.totalTimeInForeground)
}
