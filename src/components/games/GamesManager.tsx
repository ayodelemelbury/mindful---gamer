import { useSessionStore } from '../../store/sessionStore'
import { AddGameDialog } from './AddGameDialog'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Trash2, Gamepad2 } from 'lucide-react'

export function GamesManager() {
  const games = useSessionStore((s) => s.games)
  const removeGame = useSessionStore((s) => s.removeGame)

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours === 0) return `${mins}m`
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">My Games</CardTitle>
          <AddGameDialog
            trigger={
              <Button size="sm" variant="outline">
                Add Game
              </Button>
            }
          />
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {games.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Gamepad2 size={40} className="text-muted-foreground/50 mb-2" />
            <p className="text-sm text-muted-foreground">
              No games added yet.
            </p>
            <p className="text-xs text-muted-foreground">
              Add a game to start tracking your sessions.
            </p>
          </div>
        ) : (
          games.map((game) => (
            <div
              key={game.id}
              className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-foreground">{game.name}</span>
                  <Badge variant="secondary" className="text-xs">
                    {game.category}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">
                    {formatTime(game.totalTime)} played
                  </span>
                  {game.vibeTags.length > 0 && (
                    <span className="text-xs text-muted-foreground">
                      • {game.vibeTags.slice(0, 2).join(', ')}
                    </span>
                  )}
                </div>
              </div>
              <Button
                size="icon"
                variant="ghost"
                className="text-muted-foreground hover:text-destructive"
                onClick={() => removeGame(game.id)}
              >
                <Trash2 size={16} />
              </Button>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}
