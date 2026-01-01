import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { useSessionStore } from './sessionStore'
import { useBudgetStore } from './budgetStore'

interface UserProfile {
  displayName: string
  email: string
  avatarUrl: string | null
  lastSyncedAt: Date | null
}

interface UserSettings {
  notifications: boolean
  autoSyncEnabled: boolean
  sessionReminders: boolean
  autoTrackingEnabled: boolean
  autoLaunchEnabled: boolean // Auto-launch games when starting session
  customPackageMappings: Record<string, string>
  autoTrackingLastSync: number | null
  autoTrackingDailySynced: Record<string, number>
  ignoredPackages: string[]
  // Gamification
  currentStreak: number
  longestStreak: number
  lastBalancedDate: string | null // ISO date string
  achievements: string[] // Achievement IDs
}

const defaultSettings: UserSettings = {
  notifications: true,
  autoSyncEnabled: true,
  sessionReminders: true,
  autoTrackingEnabled: true,
  autoLaunchEnabled: false,
  customPackageMappings: {},
  autoTrackingLastSync: null,
  autoTrackingDailySynced: {},
  ignoredPackages: [],
  // Gamification defaults
  currentStreak: 0,
  longestStreak: 0,
  lastBalancedDate: null,
  achievements: [],
}


interface UserState {
  profile: UserProfile | null
  settings: UserSettings
  isAuthenticated: boolean
  isDataLoading: boolean
  lastSyncedAt: string | null
  setProfile: (profile: UserProfile | null) => void
  setAuthenticated: (isAuth: boolean) => void
  setDataLoading: (loading: boolean) => void
  updateSettings: (updates: Partial<UserSettings>) => void
  syncToCloud: (userId: string) => Promise<void>
  fetchFromCloud: (userId: string) => Promise<void>
  clearUserData: () => void
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      profile: null,
      settings: defaultSettings,
      isAuthenticated: false,
      isDataLoading: false,
      lastSyncedAt: null,

      setProfile: (profile) => set({ profile }),

      setAuthenticated: (isAuth) => set({ isAuthenticated: isAuth }),

      setDataLoading: (loading) => set({ isDataLoading: loading }),

      updateSettings: (updates) =>
        set((state) => ({
          settings: { ...state.settings, ...updates },
        })),

      syncToCloud: async (userId: string) => {
        try {
          const sessionState = useSessionStore.getState()
          const budgetState = useBudgetStore.getState()
          const profile = get().profile

          const userSettings = get().settings

          const dataToSync = {
            profile: {
              displayName: profile?.displayName || "",
              email: profile?.email || "",
              avatarUrl: profile?.avatarUrl || null,
            },
            sessions: {
              recentSessions: sessionState.recentSessions,
              games: sessionState.games,
              todayTotal: sessionState.todayTotal,
              weekTotal: sessionState.weekTotal,
            },
            settings: {
              dailyLimit: budgetState.dailyBudget.limit,
              weeklyLimit: budgetState.weeklyBudget.limit,
              notifications: userSettings.notifications,
              autoSyncEnabled: userSettings.autoSyncEnabled,
              sessionReminders: userSettings.sessionReminders,
              autoTrackingEnabled: userSettings.autoTrackingEnabled,
              autoTrackingLastSync: userSettings.autoTrackingLastSync,
              autoTrackingDailySynced: userSettings.autoTrackingDailySynced,
            },
            userMappings: {
              customPackageMappings: userSettings.customPackageMappings,
              ignoredPackages: userSettings.ignoredPackages,
            },
            budgets: {
              dailyCurrent: budgetState.dailyBudget.current,
              weeklyCurrent: budgetState.weeklyBudget.current,
            },
            lastSyncedAt: serverTimestamp(),
          }

          await setDoc(doc(db, "users", userId), dataToSync, { merge: true })
          set({ lastSyncedAt: new Date().toISOString() })
        } catch (error) {
          console.error("[UserStore] syncToCloud failed:", error)
        }
      },

      fetchFromCloud: async (userId: string) => {
        try {
          const docRef = doc(db, "users", userId)
          const docSnap = await getDoc(docRef)

          if (!docSnap.exists()) return

          const data = docSnap.data()

          // Helper to convert Firestore timestamps to milliseconds
          const toTimestamp = (
            value:
              | number
              | { toMillis?: () => number; seconds?: number }
              | undefined
          ): number => {
            if (typeof value === "number") return value
            if (value?.toMillis) return value.toMillis()
            if (value?.seconds) return value.seconds * 1000
            return Date.now()
          }

          // Restore sessions data
          if (data.sessions) {
            const recentSessions = (data.sessions.recentSessions || []).map(
              (session: {
                id: string
                gameName: string
                duration: number
                createdAt:
                  | number
                  | { toMillis?: () => number; seconds?: number }
              }) => ({
                ...session,
                createdAt: toTimestamp(session.createdAt),
              })
            )

            useSessionStore.setState({
              recentSessions,
              games: data.sessions.games || [],
              todayTotal: data.sessions.todayTotal || 0,
              weekTotal: data.sessions.weekTotal || 0,
            })
          }

          // Restore budget limits from settings, current values from budgets
          const budgetState = useBudgetStore.getState()
          useBudgetStore.setState({
            dailyBudget: {
              ...budgetState.dailyBudget,
              limit: data.settings?.dailyLimit ?? budgetState.dailyBudget.limit,
              current: data.budgets?.dailyCurrent ?? 0,
            },
            weeklyBudget: {
              ...budgetState.weeklyBudget,
              limit:
                data.settings?.weeklyLimit ?? budgetState.weeklyBudget.limit,
              current: data.budgets?.weeklyCurrent ?? 0,
            },
          })

          // Restore user settings (preferences and mappings)
          const currentSettings = get().settings
          set({
            settings: {
              ...currentSettings,
              notifications:
                data.settings?.notifications ?? currentSettings.notifications,
              autoSyncEnabled:
                data.settings?.autoSyncEnabled ??
                currentSettings.autoSyncEnabled,
              sessionReminders:
                data.settings?.sessionReminders ??
                currentSettings.sessionReminders,
              autoTrackingEnabled:
                data.settings?.autoTrackingEnabled ??
                currentSettings.autoTrackingEnabled,
              autoTrackingLastSync:
                data.settings?.autoTrackingLastSync ??
                currentSettings.autoTrackingLastSync,
              autoTrackingDailySynced:
                data.settings?.autoTrackingDailySynced ??
                currentSettings.autoTrackingDailySynced,
              customPackageMappings:
                data.userMappings?.customPackageMappings ??
                currentSettings.customPackageMappings,
              ignoredPackages:
                data.userMappings?.ignoredPackages ??
                currentSettings.ignoredPackages,
            },
          })

          // Restore profile
          if (data.profile) {
            set({
              profile: {
                displayName: data.profile.displayName,
                email: data.profile.email,
                avatarUrl: data.profile.avatarUrl,
                lastSyncedAt: data.lastSyncedAt?.toDate() || null,
              },
              lastSyncedAt: data.lastSyncedAt?.toDate()?.toISOString() || null,
            })
          }
        } catch (error) {
          console.error("[UserStore] fetchFromCloud failed:", error)
        }
      },

      clearUserData: () => {
        useSessionStore.setState({
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
        })

        useBudgetStore.setState({
          budgets: [],
          dailyBudget: { id: "daily", type: "daily", limit: 120, current: 0 },
          weeklyBudget: {
            id: "weekly",
            type: "weekly",
            limit: 840,
            current: 0,
          },
        })

        // Clear localStorage to prevent stale data on next login
        if (typeof window !== "undefined" && window.localStorage) {
          localStorage.removeItem("mindful-gamer-sessions")
          localStorage.removeItem("mindful-gamer-budgets")
          localStorage.removeItem("mindful-gamer-user")
        }

        set({
          profile: null,
          isAuthenticated: false,
          isDataLoading: false,
          lastSyncedAt: null,
          settings: defaultSettings,
        })
      },
    }),
    {
      name: "mindful-gamer-user",
    }
  )
)
