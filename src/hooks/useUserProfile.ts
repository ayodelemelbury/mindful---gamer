/**
 * Hook for fetching and managing user profiles
 */
import { useState, useEffect, useCallback } from 'react'
import type { UserProfile } from '../types'
import {
  getProfile,
  createProfile,
  updateProfile,
  followUser,
  unfollowUser,
  isFollowing,
  getFollowers,
  getFollowing,
} from '../lib/profileService'

interface UseUserProfileReturn {
  profile: UserProfile | null
  isLoading: boolean
  error: string | null
  isFollowingUser: boolean
  followers: UserProfile[]
  following: UserProfile[]
  follow: () => Promise<void>
  unfollow: () => Promise<void>
  updateBio: (bio: string) => Promise<void>
  refresh: () => void
}

export function useUserProfile(
  userId: string | null,
  currentUserId?: string | null
): UseUserProfileReturn {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isFollowingUser, setIsFollowingUser] = useState(false)
  const [followers, setFollowers] = useState<UserProfile[]>([])
  const [following, setFollowing] = useState<UserProfile[]>([])

  const fetchProfile = useCallback(async () => {
    if (!userId) {
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const fetchedProfile = await getProfile(userId)
      setProfile(fetchedProfile)

      // Check if current user is following this profile
      if (currentUserId && currentUserId !== userId) {
        const isFollowingResult = await isFollowing(currentUserId, userId)
        setIsFollowingUser(isFollowingResult)
      }

      // Fetch followers and following
      const [fetchedFollowers, fetchedFollowing] = await Promise.all([
        getFollowers(userId),
        getFollowing(userId),
      ])
      setFollowers(fetchedFollowers)
      setFollowing(fetchedFollowing)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load profile')
    } finally {
      setIsLoading(false)
    }
  }, [userId, currentUserId])

  useEffect(() => {
    fetchProfile()
  }, [fetchProfile])

  const follow = useCallback(async () => {
    if (!currentUserId || !userId || currentUserId === userId) return

    try {
      await followUser(currentUserId, userId)
      setIsFollowingUser(true)
      setProfile(prev => prev ? { ...prev, followerCount: prev.followerCount + 1 } : null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to follow')
    }
  }, [currentUserId, userId])

  const unfollow = useCallback(async () => {
    if (!currentUserId || !userId) return

    try {
      await unfollowUser(currentUserId, userId)
      setIsFollowingUser(false)
      setProfile(prev => prev ? { ...prev, followerCount: Math.max(0, prev.followerCount - 1) } : null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to unfollow')
    }
  }, [currentUserId, userId])

  const updateBio = useCallback(async (bio: string) => {
    if (!userId) return

    try {
      await updateProfile(userId, { bio })
      setProfile(prev => prev ? { ...prev, bio } : null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile')
    }
  }, [userId])

  return {
    profile,
    isLoading,
    error,
    isFollowingUser,
    followers,
    following,
    follow,
    unfollow,
    updateBio,
    refresh: fetchProfile,
  }
}

// Hook for managing own profile
export function useOwnProfile(userId: string | null) {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!userId) {
      setIsLoading(false)
      return
    }

    const loadProfile = async () => {
      try {
        const existing = await getProfile(userId)
        setProfile(existing)
      } catch {
        // Ignore errors
      } finally {
        setIsLoading(false)
      }
    }

    loadProfile()
  }, [userId])

  const ensureProfile = useCallback(async (
    displayName: string,
    avatarUrl: string | null
  ) => {
    if (!userId) return

    const existing = await getProfile(userId)
    if (!existing) {
      await createProfile(userId, displayName, avatarUrl)
      const newProfile = await getProfile(userId)
      setProfile(newProfile)
    }
  }, [userId])

  return { profile, isLoading, ensureProfile }
}
