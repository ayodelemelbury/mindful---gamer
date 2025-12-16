import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Session, Game } from '../types'

interface RecentSession {
  id: string
  gameName: string
  duration: number
  timeAgo: string
}

interface SessionState {
  sessions: Session[]
  recentSessions: RecentSession[]
  games: Game[]
  todayTotal: number
  weekTotal: number
  addSession: (gameName: string, duration: number) => void
  incrementToday: (minutes: number) => void
  addGame: (game: Omit<Game, 'id' | 'totalTime' | 'rating'>) => void
  removeGame: (gameId: string) => void
  updateGameTime: (gameId: string, minutes: number) => void
}

export const useSessionStore = create<SessionState>()(
  persist(
    (set) => ({
      sessions: [],
      recentSessions: [],
      games: [],
      todayTotal: 0,
      weekTotal: 0,
      addSession: (gameName, duration) =>
        set((state) => {
          const game = state.games.find((g) => g.name === gameName)
          return {
            recentSessions: [
              { id: crypto.randomUUID(), gameName, duration, timeAgo: 'Just now' },
              ...state.recentSessions.slice(0, 4),
            ],
            todayTotal: state.todayTotal + duration,
            weekTotal: state.weekTotal + duration,
            games: game
              ? state.games.map((g) =>
                  g.id === game.id ? { ...g, totalTime: g.totalTime + duration } : g
                )
              : state.games,
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
            {
              id: crypto.randomUUID(),
              totalTime: 0,
              rating: 0,
              ...gameData,
            },
          ],
        })),
      removeGame: (gameId) =>
        set((state) => ({
          games: state.games.filter((g) => g.id !== gameId),
        })),
      updateGameTime: (gameId, minutes) =>
        set((state) => ({
          games: state.games.map((g) =>
            g.id === gameId ? { ...g, totalTime: g.totalTime + minutes } : g
          ),
        })),
    }),
    {
      name: 'mindful-gamer-sessions',
    }
  )
)
