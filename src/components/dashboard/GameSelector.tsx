import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { AddGameDialog } from '../games/AddGameDialog'
import type { Game } from '../../types'

interface GameSelectorProps {
  games: Game[]
  selected: Game | null
  onSelect: (game: Game) => void
}

export function GameSelector({ games, selected, onSelect }: GameSelectorProps) {
  const hasGames = games.length > 0

  return (
    <div className="flex gap-2">
      <Select
        value={selected?.id || ''}
        onValueChange={(value: string) => {
          const game = games.find((g) => g.id === value)
          if (game) onSelect(game)
        }}
        disabled={!hasGames}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder={hasGames ? "Select a game..." : "Add a game to start..."} />
        </SelectTrigger>
        <SelectContent>
          {games.map((game) => (
            <SelectItem key={game.id} value={game.id}>
              {game.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <AddGameDialog />
    </div>
  )
}


