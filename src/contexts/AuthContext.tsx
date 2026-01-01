/* eslint-disable react-refresh/only-export-components */
import { createContext, useEffect, useState, type ReactNode } from "react"
import {
  type User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithCredential,
  updateProfile,
} from "firebase/auth"
import { FirebaseAuthentication } from "@capacitor-firebase/authentication"
import { Capacitor } from "@capacitor/core"
import { auth } from "../lib/firebase"
import { useUserStore } from "../store/userStore"

export interface AuthContextType {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (
    email: string,
    password: string,
    displayName?: string
  ) => Promise<void>
  signInWithGoogle: () => Promise<void>
  signOut: () => Promise<void>
}

export const AuthContext = createContext<AuthContextType | null>(null)

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log("[AuthContext] Auth state changed:", user?.uid || "null")

      if (user) {
        console.log("[AuthContext] User authenticated, fetching cloud data...")
        // Set loading flag to prevent auto-sync during data fetch
        useUserStore.getState().setDataLoading(true)
        try {
          await useUserStore.getState().fetchFromCloud(user.uid)
          console.log("[AuthContext] Cloud data fetched successfully")
        } catch (error) {
          console.error("[AuthContext] Failed to fetch cloud data:", error)
        } finally {
          useUserStore.getState().setDataLoading(false)
        }
      }

      setUser(user)
      setLoading(false)
    })

    return unsubscribe
  }, [])

  const signIn = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password)
  }

  const signUp = async (
    email: string,
    password: string,
    displayName?: string
  ) => {
    const { user } = await createUserWithEmailAndPassword(auth, email, password)
    if (displayName) {
      await updateProfile(user, { displayName })
    }
  }

  const signInWithGoogle = async () => {
    if (Capacitor.isNativePlatform()) {
      // Native: use Capacitor Firebase Auth plugin
      const result = await FirebaseAuthentication.signInWithGoogle()
      // Sync to web layer for Firestore access
      const credential = GoogleAuthProvider.credential(
        result.credential?.idToken
      )
      await signInWithCredential(auth, credential)
    } else {
      // Web: use popup
      const provider = new GoogleAuthProvider()
      await signInWithPopup(auth, provider)
    }
  }

  const signOut = async () => {
    await firebaseSignOut(auth)
  }

  const value: AuthContextType = {
    user,
    loading,
    signIn,
    signUp,
    signInWithGoogle,
    signOut,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
