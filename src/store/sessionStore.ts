import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Game } from "../types"
import { useBudgetStore } from "./budgetStore"
import { findPackageNameByGameName } from "../lib/gamePackageMap"
import { searchGames, mapGenreToCategory, mapToVibeTags } from "../lib/rawg"

interface RecentSession {
  id: string
  gameName: string
  duration: number
  createdAt: number
  note?: string // optional session note
}

interface ActiveSession {
  isPlaying: boolean
  sessionStartTime: number | null
  selectedGameId: string | null
  selectedGameName: string | null
  lastBudgetMinute: number
}

interface SessionState {
  recentSessions: RecentSession[]
  games: Game[]
  todayTotal: number
  weekTotal: number
  activeSession: ActiveSession
  addSession: (
    gameName: string,
    duration: number,
    packageName?: string,
    skipBudgetUpdate?: boolean,
    note?: string
  ) => void
  incrementToday: (minutes: number) => void
  addGame: (game: Omit<Game, "id" | "totalTime" | "rating">) => void
  removeGame: (gameId: string) => void
  updateGameTime: (gameId: string, minutes: number) => void
  updateGameRating: (gameId: string, rating: number) => void
  startSession: (gameId: string, gameName: string) => Promise<void>
  stopSession: () => { duration: number } | null
  updateLastBudgetMinute: (minute: number) => void
  getElapsedSeconds: () => number
  enrichGame: (gameId: string) => Promise<void>
}

export const useSessionStore = create<SessionState>()(
  persist(
    (set, get) => ({
      recentSessions: [],
      games: [],
      todayTotal: 0,
      weekTotal: 0,
      activeSession: {
        isPlaying: false,
        sessionStartTime: null,
        selectedGameId: null,
        selectedGameName: null,
        lastBudgetMinute: 0,
      },
      addSession: (
        gameName,
        duration,
        packageNameOrSkip,
        skipBudgetUpdateArg,
        noteArg
      ) =>
        set((state) => {
          // Handle overloaded arguments for backward compatibility
          // If 3rd arg is boolean, it's skipBudgetUpdate (old signature)
          // If 3rd arg is string, it's packageName (new signature)
          const packageName =
            typeof packageNameOrSkip === "string"
              ? packageNameOrSkip
              : undefined

          const skipBudgetUpdate =
            typeof packageNameOrSkip === "boolean"
              ? packageNameOrSkip
              : (skipBudgetUpdateArg ?? false)

          // If overload used (3rd arg is boolean), then 4th arg might be the note
          const note =
            typeof packageNameOrSkip === "boolean"
              ? (skipBudgetUpdateArg as unknown as string | undefined)
              : noteArg

          // Try to resolve package name if not provided
          const resolvedPackageName =
            packageName || findPackageNameByGameName(gameName)

          // Update budget store to reflect the new session time
          // This is critical for auto-tracked sessions to appear on dashboard
          if (!skipBudgetUpdate) {
            useBudgetStore.getState().updateDailyUsage(duration)
          }

          const game = state.games.find((g) => g.name === gameName)

          let updatedGames = state.games
          if (game) {
            updatedGames = state.games.map((g) => {
              if (g.id === game.id) {
                return {
                  ...g,
                  totalTime: g.totalTime + duration,
                  ...(resolvedPackageName && !g.packageName
                    ? { packageName: resolvedPackageName }
                    : {}),
                }
              }
              return g
            })
          } else {
            const newGame: Game = {
              id: crypto.randomUUID(),
              name: gameName,
              packageName: resolvedPackageName,
              category: "Other",
              totalTime: duration,
              vibeTags: [],
              rating: 0,
            }
            updatedGames = [...state.games, newGame]

            // Trigger enrichment in background
            setTimeout(() => {
              get().enrichGame(newGame.id)
            }, 100)
          }

          return {
            recentSessions: [
              {
                id: crypto.randomUUID(),
                gameName,
                duration,
                createdAt: Date.now(),
                ...(note ? { note } : {}),
              },
              ...state.recentSessions.slice(0, 99),
            ],
            todayTotal: state.todayTotal + duration,
            weekTotal: state.weekTotal + duration,
            games: updatedGames,
          }
        }),
      incrementToday: (minutes) =>
        set((state) => ({
          todayTotal: state.todayTotal + minutes,
          weekTotal: state.weekTotal + minutes,
        })),
      addGame: (gameData) =>
        set((state) => ({
          games: [
            ...state.games,
            { id: crypto.randomUUID(), totalTime: 0, rating: 0, ...gameData },
          ],
        })),
      removeGame: (gameId) =>
        set((state) => ({ games: state.games.filter((g) => g.id !== gameId) })),
      updateGameTime: (gameId, minutes) =>
        set((state) => ({
          games: state.games.map((g) =>
            g.id === gameId ? { ...g, totalTime: g.totalTime + minutes } : g
          ),
        })),
      updateGameRating: (gameId, rating) =>
        set((state) => ({
          games: state.games.map((g) =>
            g.id === gameId
              ? { ...g, rating: Math.max(0, Math.min(5, rating)) }
              : g
          ),
        })),
      startSession: async (gameId, gameName) => {
        const state = get()
        const game = state.games.find((g) => g.id === gameId)

        if (game?.packageName) {
          try {
            const { AppLauncher } = await import("@capacitor/app-launcher")
            await AppLauncher.openUrl({ url: game.packageName })
          } catch (error) {
            console.warn("Failed to auto-launch game:", error)
          }
        }

        set(() => ({
          activeSession: {
            isPlaying: true,
            sessionStartTime: Date.now(),
            selectedGameId: gameId,
            selectedGameName: gameName,
            lastBudgetMinute: 0,
          },
        }))
      },
      stopSession: () => {
        const { activeSession } = get()
        const resetSession = {
          activeSession: {
            isPlaying: false,
            sessionStartTime: null,
            selectedGameId: null,
            selectedGameName: null,
            lastBudgetMinute: 0,
          },
        }

        if (!activeSession.isPlaying || !activeSession.sessionStartTime) {
          set(() => resetSession)
          return null
        }

        const durationMinutes = Math.ceil(
          (Date.now() - activeSession.sessionStartTime) / 60000
        )
        set(() => resetSession)
        return { duration: durationMinutes }
      },
      updateLastBudgetMinute: (minute) =>
        set((state) => ({
          activeSession: { ...state.activeSession, lastBudgetMinute: minute },
        })),
      getElapsedSeconds: () => {
        const { activeSession } = get()
        if (!activeSession.isPlaying || !activeSession.sessionStartTime)
          return 0
        return Math.floor((Date.now() - activeSession.sessionStartTime) / 1000)
      },
      enrichGame: async (gameId: string) => {
        const state = get()
        const game = state.games.find((g) => g.id === gameId)
        if (!game || game.rawgId) return // Already enriched or missing

        try {
          // Search RAWG for high-confidence match
          const results = await searchGames(game.name, 1)
          if (results.length > 0) {
            const rawgGame = results[0]

            // Basic confidence check: name match (ignoring case/special chars)
            const simplify = (s: string) =>
              s.toLowerCase().replace(/[^a-z0-9]/g, "")
            if (
              simplify(rawgGame.name) !== simplify(game.name) &&
              !rawgGame.name.includes(game.name)
            ) {
              console.log(
                `[Enrich] Low confidence match: ${game.name} vs ${rawgGame.name}`
              )
              return
            }

            set((state) => ({
              games: state.games.map((g) =>
                g.id === gameId
                  ? {
                      ...g,
                      rawgId: rawgGame.id,
                      category:
                        g.category === "Other"
                          ? mapGenreToCategory(rawgGame.genres)
                          : g.category,
                      backgroundImage: rawgGame.background_image || undefined,
                      genres: rawgGame.genres?.map((gen) => gen.name),
                      platforms: rawgGame.platforms?.map(
                        (p) => p.platform.name
                      ),
                      metacritic: rawgGame.metacritic,
                      vibeTags: [
                        ...new Set([...g.vibeTags, ...mapToVibeTags(rawgGame)]),
                      ],
                    }
                  : g
              ),
            }))
            console.log(`[Enrich] Enriched ${game.name} with RAWG data`)
          }
        } catch (error) {
          console.warn(`[Enrich] Failed to enrich ${game.name}:`, error)
        }
      },
    }),
    { name: "mindful-gamer-sessions" }
  )
)
