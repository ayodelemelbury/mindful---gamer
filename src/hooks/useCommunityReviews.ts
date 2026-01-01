/**
 * Hook for fetching and managing community reviews
 */
import { useState, useEffect, useCallback } from 'react'
import type { CommunityReview } from '../types'
import {
  fetchCommunityReviews,
  fetchUserReviews,
  submitReview,
  deleteReview,
  likeReview,
  unlikeReview,
  hasLikedReview,
  type SubmitReviewInput,
} from '../lib/communityService'

interface UseCommunityReviewsReturn {
  reviews: CommunityReview[]
  isLoading: boolean
  error: string | null
  refresh: () => void
  submit: (input: SubmitReviewInput) => Promise<string | null>
  remove: (reviewId: string, userId: string) => Promise<boolean>
}

export function useCommunityReviews(
  filterTag?: string
): UseCommunityReviewsReturn {
  const [reviews, setReviews] = useState<CommunityReview[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadReviews = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const fetchedReviews = await fetchCommunityReviews(filterTag)
      setReviews(fetchedReviews)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load reviews')
    } finally {
      setIsLoading(false)
    }
  }, [filterTag])

  useEffect(() => {
    loadReviews()
  }, [loadReviews])

  const submit = useCallback(async (input: SubmitReviewInput) => {
    try {
      const reviewId = await submitReview(input)
      await loadReviews()
      return reviewId
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit review')
      return null
    }
  }, [loadReviews])

  const remove = useCallback(async (reviewId: string, userId: string) => {
    try {
      await deleteReview(reviewId, userId)
      setReviews(prev => prev.filter(r => r.id !== reviewId))
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete review')
      return false
    }
  }, [])

  return {
    reviews,
    isLoading,
    error,
    refresh: loadReviews,
    submit,
    remove,
  }
}

// Hook for user's own reviews
export function useUserReviews(userId: string | null) {
  const [reviews, setReviews] = useState<CommunityReview[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!userId) {
      setIsLoading(false)
      return
    }

    const load = async () => {
      try {
        const fetched = await fetchUserReviews(userId)
        setReviews(fetched)
      } catch {
        // Ignore
      } finally {
        setIsLoading(false)
      }
    }

    load()
  }, [userId])

  return { reviews, isLoading }
}

// Hook for managing likes on a single review
export function useReviewLike(reviewId: string, userId: string | null) {
  const [hasLiked, setHasLiked] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isToggling, setIsToggling] = useState(false)

  useEffect(() => {
    if (!userId) {
      setIsLoading(false)
      return
    }

    const checkLike = async () => {
      try {
        const liked = await hasLikedReview(reviewId, userId)
        setHasLiked(liked)
      } catch {
        // Ignore
      } finally {
        setIsLoading(false)
      }
    }

    checkLike()
  }, [reviewId, userId])

  const toggleLike = useCallback(async (): Promise<boolean | null> => {
    if (!userId) return null
    if (isToggling) return null

    const previousState = hasLiked
    
    setHasLiked(!previousState)
    setIsToggling(true)

    try {
      if (previousState) {
        await unlikeReview(reviewId, userId)
        return false
      } else {
        await likeReview(reviewId, userId)
        return true
      }
    } catch (err) {
      setHasLiked(previousState)
      console.error('Failed to toggle like:', err)
      return null
    } finally {
      setIsToggling(false)
    }
  }, [reviewId, userId, hasLiked, isToggling])

  return { hasLiked, isLoading, toggleLike }
}
