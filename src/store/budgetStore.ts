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
          dailyBudget: { 
            ...state.dailyBudget, 
            limit,
            baseLimit: limit 
          },
        })),
      setWeeklyLimit: (limit) =>
        set((state) => ({
          weeklyBudget: { ...state.weeklyBudget, limit },
        })),
      resetDaily: () =>
        set((state) => {
          const { dailyBudget } = state
          
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
    }),
    {
      name: 'mindful-gamer-budgets',
    }
  )
)
