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

interface UserState {
  profile: UserProfile | null
  isAuthenticated: boolean
  lastSyncedAt: string | null
  setProfile: (profile: UserProfile | null) => void
  setAuthenticated: (isAuth: boolean) => void
  syncToCloud: (userId: string) => Promise<void>
  fetchFromCloud: (userId: string) => Promise<void>
  clearUserData: () => void
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      profile: null,
      isAuthenticated: false,
      lastSyncedAt: null,

      setProfile: (profile) => set({ profile }),
      
      setAuthenticated: (isAuth) => set({ isAuthenticated: isAuth }),

      syncToCloud: async (userId: string) => {
        try {
          const sessionState = useSessionStore.getState()
          const budgetState = useBudgetStore.getState()
          const profile = get().profile

          // Save user data to Firestore
          await setDoc(doc(db, 'users', userId), {
            profile: {
              displayName: profile?.displayName || '',
              email: profile?.email || '',
              avatarUrl: profile?.avatarUrl || null,
            },
            sessions: {
              sessions: sessionState.sessions,
              recentSessions: sessionState.recentSessions,
              games: sessionState.games,
              todayTotal: sessionState.todayTotal,
              weekTotal: sessionState.weekTotal,
            },
            budgets: {
              dailyBudget: budgetState.dailyBudget,
              weeklyBudget: budgetState.weeklyBudget,
            },
            lastSyncedAt: serverTimestamp(),
          })

          set({ lastSyncedAt: new Date().toISOString() })
        } catch (error) {
          console.error('Failed to sync to cloud:', error)
          throw error
        }
      },

      fetchFromCloud: async (userId: string) => {
        try {
          const docRef = doc(db, 'users', userId)
          const docSnap = await getDoc(docRef)

          if (docSnap.exists()) {
            const data = docSnap.data()
            
            // Update session store
            if (data.sessions) {
              // Directly set state on session store
              useSessionStore.setState({
                sessions: data.sessions.sessions || [],
                recentSessions: data.sessions.recentSessions || [],
                games: data.sessions.games || [],
                todayTotal: data.sessions.todayTotal || 0,
                weekTotal: data.sessions.weekTotal || 0,
              })
            }

            // Update budget store
            if (data.budgets) {
              useBudgetStore.setState({
                dailyBudget: data.budgets.dailyBudget,
                weeklyBudget: data.budgets.weeklyBudget,
              })
            }

            // Update profile
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
          }
        } catch (error) {
          console.error('Failed to fetch from cloud:', error)
          throw error
        }
      },

      clearUserData: () => set({
        profile: null,
        isAuthenticated: false,
        lastSyncedAt: null,
      }),
    }),
    {
      name: 'mindful-gamer-user',
    }
  )
)
