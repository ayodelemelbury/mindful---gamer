import { auth, db } from "./firebase"
import { doc, setDoc, serverTimestamp } from "firebase/firestore"
import { onAuthStateChanged, type User } from "firebase/auth"
import { useSessionStore } from "../store/sessionStore"
import { useBudgetStore } from "../store/budgetStore"
import { useUserStore } from "../store/userStore"

let currentUser: User | null = null

onAuthStateChanged(auth, (user) => {
  currentUser = user
})

let syncTimeout: ReturnType<typeof setTimeout> | null = null
const DEBOUNCE_MS = 2000
let isSyncing = false
const MAX_RETRIES = 3
const RETRY_DELAY_MS = 1000

export function triggerAutoSync() {
  if (syncTimeout) clearTimeout(syncTimeout)
  syncTimeout = setTimeout(performSync, DEBOUNCE_MS)
}

/**
 * Initialize auto-sync subscriptions
 * Should be called once at app startup
 */
export function initializeAutoSync() {
  let previousSessionState = useSessionStore.getState()
  useSessionStore.subscribe((state) => {
    if (
      state.recentSessions !== previousSessionState.recentSessions ||
      state.games !== previousSessionState.games ||
      state.todayTotal !== previousSessionState.todayTotal ||
      state.weekTotal !== previousSessionState.weekTotal
    ) {
      triggerAutoSync()
    }
    previousSessionState = state
  })

  let previousBudgetState = useBudgetStore.getState()
  useBudgetStore.subscribe((state) => {
    const hasDataChanged =
      state.dailyBudget !== previousBudgetState.dailyBudget ||
      state.weeklyBudget !== previousBudgetState.weeklyBudget

    if (hasDataChanged) {
      triggerAutoSync()
    }

    previousBudgetState = state
  })

  console.log("[AutoSync] Initialized store subscriptions")
}

async function performSync(retryCount = 0) {
  // Skip sync if no user or already syncing (unless it's a retry)
  if (!currentUser || (isSyncing && retryCount === 0)) return

  // Skip sync if data is being loaded from cloud (prevents race condition)
  const { isDataLoading, settings } = useUserStore.getState()
  if (isDataLoading) {
    console.log("[AutoSync] Skipping sync - data loading in progress")
    return
  }

  // Skip if auto-sync is disabled in settings
  if (!settings.autoSyncEnabled) {
    console.log("[AutoSync] Skipping sync - auto-sync disabled")
    return
  }

  isSyncing = true

  try {
    const sessionState = useSessionStore.getState()
    const budgetState = useBudgetStore.getState()
    const profile = useUserStore.getState().profile
    const userSettings = useUserStore.getState().settings

    const dataToSync = {
      profile: {
        displayName: profile?.displayName || currentUser.displayName || "",
        email: profile?.email || currentUser.email || "",
        avatarUrl: profile?.avatarUrl || currentUser.photoURL || null,
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

    // Use merge to avoid overwriting unrelated fields
    await setDoc(doc(db, "users", currentUser.uid), dataToSync, { merge: true })

    useUserStore.setState({ lastSyncedAt: new Date().toISOString() })

    // Success - allow new syncs
    isSyncing = false
  } catch (error) {
    console.error("[AutoSync] Sync failed:", error)

    // Retry with exponential backoff
    if (retryCount < MAX_RETRIES) {
      const delay = RETRY_DELAY_MS * Math.pow(2, retryCount)
      console.log(
        `[AutoSync] Retrying in ${delay}ms (attempt ${
          retryCount + 1
        }/${MAX_RETRIES})`
      )
      // Keep isSyncing = true while retry is pending
      setTimeout(() => performSync(retryCount + 1), delay)
    } else {
      console.error("[AutoSync] Max retries reached, sync failed permanently")
      // All retries exhausted - allow new syncs
      isSyncing = false
    }
  }
}

/**
 * Get the current user for checking auth status
 */
export function getCurrentUser(): User | null {
  return currentUser
}
