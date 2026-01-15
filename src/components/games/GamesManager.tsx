import { useNavigate } from 'react-router-dom'
import { useSessionStore } from '../../store/sessionStore'
import { useBudgetStore } from '../../store/budgetStore'
import { AddGameDialog } from './AddGameDialog'
import { AddFromDeviceDialog } from './AddFromDeviceDialog'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Trash2, Gamepad2, Plus, ChevronRight, Timer } from 'lucide-react'
import { formatDuration } from '@/lib/formatDuration'
import { isNativeAndroid } from '@/lib/usageTracking'

export function GamesManager() {
  const navigate = useNavigate()
  const games = useSessionStore((s) => s.games)
  const removeGame = useSessionStore((s) => s.removeGame)
  const gameBudgets = useBudgetStore((s) => s.gameBudgets)
  const isAndroid = isNativeAndroid()

  const getGameBudget = (gameId: string) => {
    return gameBudgets?.find((b) => b.gameId === gameId)
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">My Games</CardTitle>
          <div className="flex items-center gap-2">
            {isAndroid ? (
              // On Android, "Add Game" opens the device app picker (primary method)
              <AddFromDeviceDialog
                trigger={
                  <Button size="sm" variant="default">
                    <Plus className="h-4 w-4 mr-1" />
                    Add Game
                  </Button>
                }
              />
            ) : (
              // On web/iOS, fall back to manual entry
              <AddGameDialog
                trigger={
                  <Button size="sm" variant="default">
                    <Plus className="h-4 w-4 mr-1" />
                    Add Game
                  </Button>
                }
              />
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {games.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Gamepad2 size={40} className="text-muted-foreground/50 mb-2" />
            <p className="text-sm text-muted-foreground">
              No games added yet.
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {isAndroid
                ? "Add games from your device to start auto-tracking."
                : "Add a game to start tracking your sessions."}
            </p>
          </div>
        ) : (
          games.map((game) => {
            const budget = getGameBudget(game.id)
            return (
              <div
                key={game.id}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer"
                onClick={() => navigate(`/game/${game.id}`)}
              >
                <div className="space-y-1 flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-foreground truncate">{game.name}</span>
                    <Badge variant="secondary" className="text-xs shrink-0">
                      {game.category}
                    </Badge>
                    {budget && (
                      <Badge variant="outline" className="text-xs shrink-0">
                        <Timer className="h-3 w-3 mr-1" />
                        {formatDuration(budget.limit)}
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      {formatDuration(game.totalTime)} played
                    </span>
                    {game.vibeTags.length > 0 && (
                      <span className="text-xs text-muted-foreground">
                        • {game.vibeTags.slice(0, 2).join(', ')}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="text-muted-foreground hover:text-destructive"
                    onClick={(e) => {
                      e.stopPropagation()
                      removeGame(game.id)
                    }}
                  >
                    <Trash2 size={16} />
                  </Button>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </div>
              </div>
            )
          })
        )}
      </CardContent>
    </Card>
  )
}
