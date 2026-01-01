import { useState, useEffect, useCallback } from 'react'
import { getRecommendedGames, type RAWGGame } from '../lib/rawg'

interface UseRecommendationsResult {
  games: RAWGGame[]
  isLoading: boolean
  error: string | null
  refresh: () => void
}

export function useRecommendations(tag?: string): UseRecommendationsResult {
  const [games, setGames] = useState<RAWGGame[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchGames = useCallback(async (signal?: AbortSignal) => {
    setIsLoading(true)
    setError(null)
    try {
      const results = await getRecommendedGames(tag, 6, signal)
      setGames(results)
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') return
      setError(err instanceof Error ? err.message : 'Failed to load recommendations')
    } finally {
      if (!signal?.aborted) {
        setIsLoading(false)
      }
    }
  }, [tag])

  useEffect(() => {
    const controller = new AbortController()
    fetchGames(controller.signal)
    return () => controller.abort()
  }, [fetchGames])

  return { games, isLoading, error, refresh: fetchGames }
}
