import { useState, useCallback, useRef } from 'react'
import { searchGames, type RAWGGame } from '../lib/rawg'

interface UseRAWGSearchResult {
  results: RAWGGame[]
  isLoading: boolean
  error: string | null
  search: (query: string) => void
  clearResults: () => void
}

/**
 * Custom hook for searching games via RAWG API with debouncing
 * @param debounceMs - Debounce delay in milliseconds (default: 300)
 */
export function useRAWGSearch(debounceMs: number = 300): UseRAWGSearchResult {
  const [results, setResults] = useState<RAWGGame[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  const search = useCallback((query: string) => {
    // Clear previous debounce timer
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }

    // Abort previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    // Clear results if query is empty
    if (!query.trim()) {
      setResults([])
      setIsLoading(false)
      setError(null)
      return
    }

    setIsLoading(true)
    setError(null)

    // Debounce the API call
    debounceRef.current = setTimeout(async () => {
      abortControllerRef.current = new AbortController()

      try {
        const games = await searchGames(query, 10, abortControllerRef.current.signal)
        setResults(games)
        setError(null)
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') {
          return // Ignore aborted requests
        }
        setError(err instanceof Error ? err.message : 'Search failed')
        setResults([])
      } finally {
        setIsLoading(false)
      }
    }, debounceMs)
  }, [debounceMs])

  const clearResults = useCallback(() => {
    setResults([])
    setError(null)
    setIsLoading(false)
  }, [])

  return {
    results,
    isLoading,
    error,
    search,
    clearResults,
  }
}
