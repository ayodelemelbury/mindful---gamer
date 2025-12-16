export interface Session {
  id: string
  gameId: string
  gameName: string
  startTime: Date
  endTime: Date
  duration: number // minutes
}

export interface Budget {
  id: string
  type: 'daily' | 'weekly' | 'game'
  gameId?: string
  limit: number // minutes
  current: number
}

export interface Game {
  id: string
  name: string
  icon?: string
  category: string
  totalTime: number
  vibeTags: string[]
  rating: number
}

export type GaugeState = 'safe' | 'caution' | 'exceeded'
