/**
 * Hook for fetching activity feed from followed users
 */
import { useState, useEffect, useCallback } from 'react'
import type { ActivityFeedItem } from '../types'
import { fetchActivityFeed } from '../lib/profileService'

interface UseCommunityFeedReturn {
  feedItems: ActivityFeedItem[]
  isLoading: boolean
  error: string | null
  refresh: () => void
  isEmpty: boolean
}

export function useCommunityFeed(userId: string | null): UseCommunityFeedReturn {
  const [feedItems, setFeedItems] = useState<ActivityFeedItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadFeed = useCallback(async () => {
    if (!userId) {
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const items = await fetchActivityFeed(userId)
      setFeedItems(items)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load feed')
    } finally {
      setIsLoading(false)
    }
  }, [userId])

  useEffect(() => {
    loadFeed()
  }, [loadFeed])

  return {
    feedItems,
    isLoading,
    error,
    refresh: loadFeed,
    isEmpty: !isLoading && feedItems.length === 0,
  }
}
