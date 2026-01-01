/**
 * Hook for fetching and managing comments on a review
 */
import { useState, useEffect, useCallback } from "react"
import type { Comment } from "../types"
import { getComments, addComment, deleteComment } from "../lib/commentService"

interface UseCommentsReturn {
  comments: Comment[]
  isLoading: boolean
  error: string | null
  refresh: () => void
  add: (
    text: string,
    userId: string,
    userDisplayName: string,
    userAvatar: string | null
  ) => Promise<boolean>
  remove: (commentId: string, userId: string) => Promise<boolean>
}

export function useComments(reviewId: string): UseCommentsReturn {
  const [comments, setComments] = useState<Comment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadComments = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const fetched = await getComments(reviewId)
      setComments(fetched)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load comments")
    } finally {
      setIsLoading(false)
    }
  }, [reviewId])

  useEffect(() => {
    loadComments()
  }, [loadComments])

  const add = useCallback(
    async (
      text: string,
      userId: string,
      userDisplayName: string,
      userAvatar: string | null
    ) => {
      try {
        await addComment({
          reviewId,
          userId,
          userDisplayName,
          userAvatar,
          text,
        })
        await loadComments()
        return true
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to add comment")
        return false
      }
    },
    [reviewId, loadComments]
  )

  const remove = useCallback(async (commentId: string, userId: string) => {
    try {
      await deleteComment(commentId, userId)
      setComments((prev) => prev.filter((c) => c.id !== commentId))
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete comment")
      return false
    }
  }, [])

  return {
    comments,
    isLoading,
    error,
    refresh: loadComments,
    add,
    remove,
  }
}
