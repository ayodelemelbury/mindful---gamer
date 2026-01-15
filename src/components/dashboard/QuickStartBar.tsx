import { useSessionStore } from "../../store/sessionStore"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Play } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

export function QuickStartBar() {
  const { recentSessions, startSession, activeSession, games } =
    useSessionStore()

  // Get unique recent games
  const recentGames = recentSessions.reduce((acc, session) => {
    if (!acc.some((g) => g.name === session.gameName) && acc.length < 4) {
      const game = games.find((g) => g.name === session.gameName)
      if (game) {
        acc.push(game)
      }
    }
    return acc
  }, [] as typeof games)

  if (recentGames.length === 0) return null

  const handleStart = (gameId: string, gameName: string) => {
    if (!activeSession.isPlaying) {
      startSession(gameId, gameName)
    }
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">Quick Start</CardTitle>
      </CardHeader>
      <CardContent className="flex gap-4 overflow-x-auto pb-4">
        {recentGames.map((game) => (
          <div
            key={game.id}
            className="flex flex-col items-center gap-2 min-w-[70px]"
          >
            <Button
              variant="outline"
              size="icon"
              className="w-14 h-14 rounded-full p-0 overflow-hidden relative group"
              onClick={() => handleStart(game.id, game.name)}
              disabled={activeSession.isPlaying}
            >
              {game.backgroundImage ? (
                <img
                  src={game.backgroundImage}
                  alt={game.name}
                  className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                />
              ) : (
                <Avatar className="w-full h-full rounded-none">
                  <AvatarFallback>
                    {game.name.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              )}
              <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity">
                <Play
                  className="w-6 h-6 text-white text-shadow-sm"
                  fill="white"
                />
              </div>
            </Button>
            <span
              className="text-xs text-center truncate w-full"
              title={game.name}
            >
              {game.name}
            </span>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
