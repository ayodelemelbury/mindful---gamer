import { Preferences } from "@capacitor/preferences"
import type { Game } from "../types"
import { isNativeAndroid } from "./usageTracking"

const BACKGROUND_CONFIG_KEY = "mindful-gamer-background-config"

export interface BackgroundConfig {
  userMappings: Record<string, string>
  userLibraryGames: Game[]
  ignoredPackages: string[]
}

let subscriptionInitialized = false

export function initBackgroundConfigSync(): void {
  if (subscriptionInitialized || !isNativeAndroid()) return
  subscriptionInitialized = true

  Promise.all([
    import("@/store/sessionStore"),
    import("@/store/userStore"),
  ]).then(([{ useSessionStore }, { useUserStore }]) => {
    let prevGamesCount = useSessionStore.getState().games.length
    let prevMappings = useUserStore.getState().settings?.customPackageMappings
    let prevIgnored = useUserStore.getState().settings?.ignoredPackages

    const saveCurrentConfig = () => {
      const games = useSessionStore.getState().games
      const settings = useUserStore.getState().settings
      saveBackgroundConfig({
        userMappings: settings?.customPackageMappings ?? {},
        userLibraryGames: games,
        ignoredPackages: settings?.ignoredPackages ?? [],
      })
    }

    useSessionStore.subscribe((state) => {
      if (state.games.length !== prevGamesCount) {
        prevGamesCount = state.games.length
        saveCurrentConfig()
      }
    })

    useUserStore.subscribe((state) => {
      const mappings = state.settings?.customPackageMappings
      const ignored = state.settings?.ignoredPackages
      if (mappings !== prevMappings || ignored !== prevIgnored) {
        prevMappings = mappings
        prevIgnored = ignored
        saveCurrentConfig()
      }
    })
  })
}

/**
 * Save configuration for background sync to use
 */
export async function saveBackgroundConfig(
  config: BackgroundConfig
): Promise<void> {
  try {
    // Minimize the data we store - we only need packageName and name from games
    const minimalGames = config.userLibraryGames.map((g) => ({
      id: g.id,
      name: g.name,
      packageName: g.packageName,
      totalTime: 0, // Not needed for detection
      category: "Other", // Not needed
      vibeTags: [], // Not needed
      rating: 0, // Not needed
    }))

    const minimalConfig = {
      ...config,
      userLibraryGames: minimalGames,
    }

    await Preferences.set({
      key: BACKGROUND_CONFIG_KEY,
      value: JSON.stringify(minimalConfig),
    })
  } catch (error) {
    console.error("Error saving background config:", error)
  }
}

/**
 * Load configuration for background sync
 */
export async function loadBackgroundConfig(): Promise<BackgroundConfig> {
  try {
    const { value } = await Preferences.get({ key: BACKGROUND_CONFIG_KEY })
    if (!value) {
      return {
        userMappings: {},
        userLibraryGames: [],
        ignoredPackages: [],
      }
    }
    return JSON.parse(value)
  } catch (error) {
    console.error("Error loading background config:", error)
    return {
      userMappings: {},
      userLibraryGames: [],
      ignoredPackages: [],
    }
  }
}
