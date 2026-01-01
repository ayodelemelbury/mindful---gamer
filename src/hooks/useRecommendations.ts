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

  const fetchGames = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const results = await getRecommendedGames(tag, 6)
      setGames(results)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load recommendations')
    } finally {
      setIsLoading(false)
    }
  }, [tag])

  useEffect(() => {
    fetchGames()
  }, [fetchGames])

  return { games, isLoading, error, refresh: fetchGames }
}
