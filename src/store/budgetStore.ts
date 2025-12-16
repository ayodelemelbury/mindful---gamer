import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Budget } from '../types'

interface BudgetState {
  budgets: Budget[]
  dailyBudget: Budget
  weeklyBudget: Budget
  updateDailyUsage: (minutes: number) => void
  setDailyLimit: (limit: number) => void
  setWeeklyLimit: (limit: number) => void
  resetDaily: () => void
}

export const useBudgetStore = create<BudgetState>()(
  persist(
    (set) => ({
      budgets: [],
      dailyBudget: { id: 'daily', type: 'daily', limit: 120, current: 0 },
      weeklyBudget: { id: 'weekly', type: 'weekly', limit: 840, current: 0 },
      updateDailyUsage: (minutes) =>
        set((state) => ({
          dailyBudget: { ...state.dailyBudget, current: state.dailyBudget.current + minutes },
          weeklyBudget: { ...state.weeklyBudget, current: state.weeklyBudget.current + minutes },
        })),
      setDailyLimit: (limit) =>
        set((state) => ({
          dailyBudget: { ...state.dailyBudget, limit },
        })),
      setWeeklyLimit: (limit) =>
        set((state) => ({
          weeklyBudget: { ...state.weeklyBudget, limit },
        })),
      resetDaily: () =>
        set((state) => ({
          dailyBudget: { ...state.dailyBudget, current: 0 },
        })),
    }),
    {
      name: 'mindful-gamer-budgets',
    }
  )
)

