import { useState } from 'react'
import { GameRankingCard } from '../../components/community/GameRankingCard'
import { useSessionStore } from '../../store/sessionStore'
import { Button } from '@/components/ui/button'

const FILTERS = ['All', 'Relaxing', 'Short Sessions', 'Social', 'Challenging'] as const
type Filter = typeof FILTERS[number]

export function CommunityPage() {
  const [activeFilter, setActiveFilter] = useState<Filter>('All')
  const games = useSessionStore((s) => s.games)

  const filteredGames = games.filter((game) => {
    if (activeFilter === 'All') return true
    if (activeFilter === 'Short Sessions') return game.vibeTags.some(t => t.toLowerCase().includes('short'))
    return game.vibeTags.some(t => t.toLowerCase().includes(activeFilter.toLowerCase()))
  }).sort((a, b) => b.rating - a.rating)

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold text-foreground md:text-3xl">Community</h1>
        <p className="text-muted-foreground text-sm">Discover mindful game recommendations</p>
      </header>

      <div className="flex gap-2 overflow-x-auto pb-2">
        {FILTERS.map((filter) => (
          <Button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            variant={activeFilter === filter ? "default" : "secondary"}
            size="sm"
            className="rounded-full whitespace-nowrap"
          >
            {filter}
          </Button>
        ))}
      </div>

      {/* Responsive grid: 1 col mobile, 2 cols tablet/desktop */}
      <div className="grid md:grid-cols-2 gap-4">
        {filteredGames.length > 0 ? (
          filteredGames.map((game, i) => (
            <GameRankingCard key={game.id} game={game} rank={i + 1} />
          ))
        ) : (
          <p className="text-center text-muted-foreground py-8 md:col-span-2">No games match this filter</p>
        )}
      </div>
    </div>
  )
}

