/**
 * Game Package Mapping Service
 *
 * Maps Android package names to game names using (in priority order):
 * 1. User's game library (games with packageName set)
 * 2. User-defined custom mappings (from settings)
 * 3. Minimal fallback list (for first-time users)
 * 4. Android's CATEGORY_GAME flag (handled in usageTracking.ts)
 *
 * Note: Most detection now comes from the user's library and Android flags.
 */

import type { Game } from "../types"

/**
 * Minimal fallback mapping - only for first-time users with empty libraries.
 * Most games are detected via user library or Android CATEGORY_GAME flag.
 */
const MINIMAL_FALLBACK_PACKAGES: Record<string, string> = {
  "com.mojang.minecraftpe": "Minecraft",
  "com.roblox.client": "Roblox",
  "com.supercell.clashofclans": "Clash of Clans",
}

/**
 * Get the full package map from all sources.
 * Priority: User library > Custom mappings > Fallback
 *
 * @param userMappings - Custom package->name mappings from user settings
 * @param userLibraryGames - Games from user's sessionStore.games[]
 */
export function getGamePackageMap(
  userMappings: Record<string, string> = {},
  userLibraryGames: Game[] = []
): Map<string, string> {
  // Extract package->name mappings from user's game library
  const libraryMappings: Record<string, string> = {}
  for (const game of userLibraryGames) {
    if (
      typeof game.packageName === "string" &&
      game.packageName.trim() !== ""
    ) {
      const pkg = game.packageName.trim()
      libraryMappings[pkg] = game.name
    }
  }

  // Priority order: fallback (lowest) -> custom mappings -> library (highest)
  return new Map([
    ...Object.entries(MINIMAL_FALLBACK_PACKAGES),
    ...Object.entries(userMappings),
    ...Object.entries(libraryMappings),
  ])
}

/**
 * Check if a package name is in the known games list
 */
export function isKnownGame(
  packageName: string,
  userMappings: Record<string, string> = {},
  userLibraryGames: Game[] = []
): boolean {
  const packageMap = getGamePackageMap(userMappings, userLibraryGames)
  return packageMap.has(packageName)
}

/**
 * Get game name from package name
 */
export function getGameName(
  packageName: string,
  userMappings: Record<string, string> = {},
  userLibraryGames: Game[] = []
): string | null {
  const packageMap = getGamePackageMap(userMappings, userLibraryGames)
  return packageMap.get(packageName) || null
}

/**
 * Get all known package names from all sources
 */
export function getAllPackageNames(
  userMappings: Record<string, string> = {},
  userLibraryGames: Game[] = []
): string[] {
  const packageMap = getGamePackageMap(userMappings, userLibraryGames)
  return Array.from(packageMap.keys())
}

/**
 * Find package name by game name (inverse lookup)
 * Searches user library first, then custom mappings, then fallback
 */
export function findPackageNameByGameName(
  gameName: string,
  userMappings: Record<string, string> = {},
  userLibraryGames: Game[] = []
): string | undefined {
  const lowerName = gameName.toLowerCase()

  // Check user library first (most reliable)
  for (const game of userLibraryGames) {
    if (
      typeof game.packageName === "string" &&
      game.packageName.trim() !== "" &&
      game.name.toLowerCase() === lowerName
    ) {
      return game.packageName.trim()
    }
  }

  // Check custom mappings
  for (const [pkg, name] of Object.entries(userMappings)) {
    if (name.toLowerCase() === lowerName) {
      return pkg
    }
  }

  // Check fallback
  for (const [pkg, name] of Object.entries(MINIMAL_FALLBACK_PACKAGES)) {
    if (name.toLowerCase() === lowerName) {
      return pkg
    }
  }

  return undefined
}
