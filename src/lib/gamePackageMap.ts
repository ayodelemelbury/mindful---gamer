/**
 * Game Package Mapping Service
 *
 * Maps Android package names to game names using:
 * 1. Android's CATEGORY_GAME flag (primary - automatic detection)
 * 2. User-defined custom mappings (from settings)
 * 3. Essential fallback list below (for games that may not have CATEGORY_GAME set)
 *
 * Note: Most games will be auto-detected via CATEGORY_GAME.
 * This list only contains essential fallbacks for popular games.
 */

/**
 * Essential fallback mapping of Android package names to game names.
 * Reduced list - relies primarily on Android's CATEGORY_GAME detection.
 */
export const DEFAULT_GAME_PACKAGES: Record<string, string> = {
  // Top 10 essential games (fallback if CATEGORY_GAME not set)
  "com.mojang.minecraftpe": "Minecraft",
  "com.roblox.client": "Roblox",
  "com.supercell.clashofclans": "Clash of Clans",
  "com.supercell.brawlstars": "Brawl Stars",
  "com.king.candycrushsaga": "Candy Crush Saga",
  "com.tencent.ig": "PUBG Mobile",
  "com.miHoYo.GenshinImpact": "Genshin Impact",
  "com.innersloth.spacemafia": "Among Us",
  "com.nianticlabs.pokemongo": "Pokémon GO",
  "com.dts.freefireth": "Free Fire",
}

/**
 * Get the full package map including user-defined mappings
 */
export function getGamePackageMap(
  userMappings: Record<string, string> = {}
): Map<string, string> {
  return new Map([
    ...Object.entries(DEFAULT_GAME_PACKAGES),
    ...Object.entries(userMappings),
  ])
}

/**
 * Check if a package name is in the known games list
 */
export function isKnownGame(
  packageName: string,
  userMappings: Record<string, string> = {}
): boolean {
  return packageName in DEFAULT_GAME_PACKAGES || packageName in userMappings
}

/**
 * Get game name from package name
 */
export function getGameName(
  packageName: string,
  userMappings: Record<string, string> = {}
): string | null {
  return userMappings[packageName] || DEFAULT_GAME_PACKAGES[packageName] || null
}

/**
 * Get all default game package names
 */
export function getDefaultPackageNames(): string[] {
  return Object.keys(DEFAULT_GAME_PACKAGES)
}

/**
 * Find package name by game name (inverse lookup)
 * Useful for enabling auto-launch for games added by name
 */
export function findPackageNameByGameName(
  gameName: string
): string | undefined {
  const entry = Object.entries(DEFAULT_GAME_PACKAGES).find(
    ([, name]) => name.toLowerCase() === gameName.toLowerCase()
  )
  return entry ? entry[0] : undefined
}
