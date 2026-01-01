/**
 * RAWG.io API Service
 * https://rawg.io/apidocs
 */

const RAWG_API_KEY = import.meta.env.VITE_RAWG_API_KEY || ""
const RAWG_BASE_URL = "https://api.rawg.io/api"

/**
 * Game data returned from RAWG API
 */
export interface RAWGGame {
  id: number
  name: string
  slug: string
  background_image: string | null
  rating: number
  ratings_count: number
  metacritic: number | null
  released: string | null
  genres: Array<{ id: number; name: string; slug: string }>
  platforms: Array<{ platform: { id: number; name: string; slug: string } }>
  short_screenshots: Array<{ id: number; image: string }>
}

/**
 * Search response from RAWG API
 */
export interface RAWGSearchResponse {
  count: number
  next: string | null
  previous: string | null
  results: RAWGGame[]
}

/**
 * Search games by query
 * @param query - Search term
 * @param pageSize - Number of results to return (default: 10)
 * @param signal - AbortSignal for cancelling the request
 */
export async function searchGames(
  query: string,
  pageSize: number = 10,
  signal?: AbortSignal
): Promise<RAWGGame[]> {
  if (!query.trim()) return []
  if (!RAWG_API_KEY) {
    console.warn("RAWG API key not configured. Set VITE_RAWG_API_KEY in .env")
    return []
  }

  const params = new URLSearchParams({
    key: RAWG_API_KEY,
    search: query.trim(),
    page_size: pageSize.toString(),
    search_precise: "true",
  })

  const response = await fetch(`${RAWG_BASE_URL}/games?${params}`, { signal })

  if (!response.ok) {
    throw new Error(`RAWG API error: ${response.status} ${response.statusText}`)
  }

  const data: RAWGSearchResponse = await response.json()
  return data.results
}

/**
 * Get detailed game information by ID
 * @param gameId - RAWG game ID
 */
export async function getGameDetails(gameId: number): Promise<RAWGGame | null> {
  if (!RAWG_API_KEY) {
    console.warn("RAWG API key not configured. Set VITE_RAWG_API_KEY in .env")
    return null
  }

  const params = new URLSearchParams({
    key: RAWG_API_KEY,
  })

  const response = await fetch(`${RAWG_BASE_URL}/games/${gameId}?${params}`)

  if (!response.ok) {
    if (response.status === 404) return null
    throw new Error(`RAWG API error: ${response.status} ${response.statusText}`)
  }

  return response.json()
}

/**
 * Get recommended/popular games by tag or category
 */
export async function getRecommendedGames(
  tag?: string,
  pageSize: number = 6,
  signal?: AbortSignal
): Promise<RAWGGame[]> {
  if (!RAWG_API_KEY) {
    console.warn("RAWG API key not configured. Set VITE_RAWG_API_KEY in .env")
    return []
  }

  const params = new URLSearchParams({
    key: RAWG_API_KEY,
    page_size: pageSize.toString(),
    ordering: "-rating",
    metacritic: "70,100",
    platforms: "3,21", // iOS (3) and Android (21) only
  })

  if (tag) {
    params.set("tags", tag)
  }

  const response = await fetch(`${RAWG_BASE_URL}/games?${params}`, { signal })

  if (!response.ok) {
    throw new Error(`RAWG API error: ${response.status} ${response.statusText}`)
  }

  const data: RAWGSearchResponse = await response.json()
  return data.results
}

/**
 * Map RAWG genre to app category
 */
export function mapGenreToCategory(genres: RAWGGame["genres"]): string {
  if (!genres || genres.length === 0) return "Other"

  const genreMap: Record<string, string> = {
    "role-playing-games-rpg": "RPG",
    rpg: "RPG",
    shooter: "FPS",
    action: "FPS",
    strategy: "Strategy",
    sports: "Sports",
    platformer: "Platformer",
    puzzle: "Casual",
    casual: "Casual",
    indie: "Casual",
    roguelike: "Roguelike",
  }

  for (const genre of genres) {
    const mapped = genreMap[genre.slug]
    if (mapped) return mapped
  }

  return "Other"
}

/**
 * Map RAWG tags to vibe tags
 */
export function mapToVibeTags(game: RAWGGame): string[] {
  const vibeTags: string[] = []

  // Based on rating
  if (game.rating >= 4) vibeTags.push("Immersive")

  // Based on genres
  const genreSlugs = game.genres?.map((g) => g.slug) || []

  if (genreSlugs.includes("puzzle") || genreSlugs.includes("casual")) {
    vibeTags.push("Relaxing")
  }
  if (genreSlugs.includes("shooter") || genreSlugs.includes("fighting")) {
    vibeTags.push("Competitive")
    vibeTags.push("Challenging")
  }
  if (
    genreSlugs.includes("massively-multiplayer") ||
    genreSlugs.includes("family")
  ) {
    vibeTags.push("Social")
  }
  if (genreSlugs.includes("indie") || genreSlugs.includes("simulation")) {
    vibeTags.push("Creative")
  }
  if (genreSlugs.includes("arcade") || genreSlugs.includes("racing")) {
    vibeTags.push("Short sessions")
  }

  return [...new Set(vibeTags)] // Remove duplicates
}
