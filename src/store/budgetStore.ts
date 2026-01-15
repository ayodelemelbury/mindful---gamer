import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Budget } from '../types'

export type BudgetPeriod = "daily" | "weekly" | "monthly" | "custom"

export interface GameBudget {
  gameId: string
  gameName: string
  limit: number // minutes
  period: BudgetPeriod
  customDays?: number // for custom period
}

interface BudgetState {
  budgets: Budget[]
  dailyBudget: Budget
  weeklyBudget: Budget
  gameBudgets: GameBudget[]
  updateDailyUsage: (minutes: number) => void
  adjustDailyUsage: (minutes: number) => void
  setDailyLimit: (limit: number) => void
  setWeeklyLimit: (limit: number) => void
  resetDaily: () => void
  setGameBudget: (
    gameId: string,
    gameName: string,
    limit: number,
    period: BudgetPeriod,
    customDays?: number
  ) => void
  removeGameBudget: (gameId: string) => void
  getGameBudget: (gameId: string) => GameBudget | undefined
}

export const useBudgetStore = create<BudgetState>()(
  persist(
    (set, get) => ({
      budgets: [],
      dailyBudget: { id: "daily", type: "daily", limit: 120, current: 0 },
      weeklyBudget: { id: "weekly", type: "weekly", limit: 840, current: 0 },
      gameBudgets: [],
      updateDailyUsage: (minutes) =>
        set((state) => ({
          dailyBudget: {
            ...state.dailyBudget,
            current: state.dailyBudget.current + minutes,
          },
          weeklyBudget: {
            ...state.weeklyBudget,
            current: state.weeklyBudget.current + minutes,
          },
        })),
      adjustDailyUsage: (minutes) =>
        set((state) => ({
          dailyBudget: {
            ...state.dailyBudget,
            current: Math.max(0, state.dailyBudget.current + minutes),
          },
          weeklyBudget: {
            ...state.weeklyBudget,
            current: Math.max(0, state.weeklyBudget.current + minutes),
          },
        })),
      setDailyLimit: (limit) =>
        set((state) => ({
          dailyBudget: {
            ...state.dailyBudget,
            limit,
            baseLimit: limit,
          },
        })),
      setWeeklyLimit: (limit) =>
        set((state) => ({
          weeklyBudget: { ...state.weeklyBudget, limit },
        })),
      resetDaily: () =>
        set((state) => {
          const { dailyBudget } = state

          // Update streak based on budget adherence
          // We access userStore directly here to avoid circular dependencies in imports if possible,
          // but since stores are separate, we can import the hook or store instance.
          // Better to use the store instance method if available or import the store.
          // We will use the direct import at the top of file.

          // Check if adherence was met (limit could include rollover, so check against total limit)
          const withinBudget = dailyBudget.current <= dailyBudget.limit

          // Import loop workaround: we'll assume useUserStore is imported.
          // Actually, we need to add the import first.
          // But here is the logic:
          import("./userStore").then(({ useUserStore }) => {
            useUserStore.getState().updateStreak(withinBudget)
          })

          const remaining = Math.max(0, dailyBudget.limit - dailyBudget.current)

          const maxRollover = 60
          const rolloverAmount = Math.min(remaining, maxRollover)

          const baseLimit = dailyBudget.baseLimit ?? dailyBudget.limit

          return {
            dailyBudget: {
              ...dailyBudget,
              current: 0,
              rolloverMinutes: rolloverAmount,
              limit: baseLimit + rolloverAmount,
              baseLimit: baseLimit,
            },
          }
        }),
      setGameBudget: (gameId, gameName, limit, period, customDays) =>
        set((state) => {
          const existing = state.gameBudgets.findIndex(
            (b) => b.gameId === gameId
          )
          const newBudget: GameBudget = {
            gameId,
            gameName,
            limit,
            period,
            ...(period === "custom" && customDays ? { customDays } : {}),
          }

          if (existing >= 0) {
            const updated = [...state.gameBudgets]
            updated[existing] = newBudget
            return { gameBudgets: updated }
          }

          return { gameBudgets: [...state.gameBudgets, newBudget] }
        }),
      removeGameBudget: (gameId) =>
        set((state) => ({
          gameBudgets: state.gameBudgets.filter((b) => b.gameId !== gameId),
        })),
      getGameBudget: (gameId) => {
        return get().gameBudgets.find((b) => b.gameId === gameId)
      },
    }),
    {
      name: "mindful-gamer-budgets",
    }
  )
)
