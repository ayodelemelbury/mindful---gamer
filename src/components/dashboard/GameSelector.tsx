import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { AddGameDialog } from '../games/AddGameDialog'
import { Gamepad2 } from "lucide-react"
import type { Game } from "../../types"

interface GameSelectorProps {
  games: Game[]
  selected: Game | null
  onSelect: (game: Game | null) => void
  disabled?: boolean
}

export function GameSelector({
  games,
  selected,
  onSelect,
  disabled = false,
}: GameSelectorProps) {
  const hasGames = games.length > 0

  return (
    <div className="flex gap-2">
      <Select
        value={selected?.id || ""}
        onValueChange={(value: string) => {
          const game = games.find((g) => g.id === value)
          if (game) onSelect(game)
        }}
        disabled={!hasGames || disabled}
      >
        <SelectTrigger className="w-full">
          <SelectValue
            placeholder={
              hasGames ? "Select a game..." : "Add a game to start..."
            }
          >
            {selected && (
              <div className="flex items-center gap-2">
                {selected.backgroundImage ? (
                  <img
                    src={selected.backgroundImage}
                    alt=""
                    className="w-5 h-5 rounded object-cover"
                  />
                ) : (
                  <Gamepad2 className="w-4 h-4 text-muted-foreground" />
                )}
                <span className="truncate">{selected.name}</span>
              </div>
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {games.map((game) => (
            <SelectItem key={game.id} value={game.id}>
              <div className="flex items-center gap-2">
                {game.backgroundImage ? (
                  <img
                    src={game.backgroundImage}
                    alt=""
                    className="w-6 h-6 rounded object-cover"
                  />
                ) : (
                  <div className="w-6 h-6 rounded bg-muted flex items-center justify-center">
                    <Gamepad2 className="w-3 h-3 text-muted-foreground" />
                  </div>
                )}
                <span>{game.name}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <AddGameDialog />
    </div>
  )
}
