import type { Game } from '../../types'
import { VibeTag } from './VibeTag'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useSessionStore } from '../../store/sessionStore'
import { Star, Gamepad2, Clock } from 'lucide-react'
import { formatDuration } from '@/lib/formatDuration'

interface GameRankingCardProps {
  game: Game
  rank: number
}

export function GameRankingCard({ game, rank }: GameRankingCardProps) {
  const updateGameRating = useSessionStore((s) => s.updateGameRating)

  const handleRating = (newRating: number) => {
    updateGameRating(game.id, newRating)
  }

  return (
    <Card>
      <CardContent className="pt-4 flex gap-4">
        <div className="flex flex-col items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold text-sm">
            {rank}
          </div>
          {game.backgroundImage ? (
            <img
              src={game.backgroundImage}
              alt={game.name}
              className="w-16 h-20 object-cover rounded"
            />
          ) : (
            <div className="w-16 h-20 bg-muted rounded flex items-center justify-center">
              <Gamepad2 className="w-6 h-6 text-muted-foreground" />
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h4 className="font-medium text-foreground">{game.name}</h4>
              <p className="text-xs text-muted-foreground">{game.category}</p>
            </div>
            {game.metacritic && (
              <Badge variant="secondary" className="shrink-0">
                {game.metacritic}
              </Badge>
            )}
          </div>
          
          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
            <Clock className="w-3 h-3" />
            {formatDuration(game.totalTime)} played
          </div>

          <div className="flex gap-1 mt-2 flex-wrap">
            {game.vibeTags.map((tag) => (
              <VibeTag key={tag} tag={tag} />
            ))}
          </div>

          <div className="flex items-center gap-2 mt-3">
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => handleRating(star)}
                  className="p-0.5 hover:scale-110 transition-transform"
                  aria-label={`Rate ${star} stars`}
                >
                  <Star
                    className={`w-4 h-4 ${
                      star <= game.rating
                        ? 'fill-primary text-primary'
                        : 'text-muted-foreground/40'
                    }`}
                  />
                </button>
              ))}
            </div>
            <span className="text-xs text-muted-foreground">
              {game.rating > 0 ? `${game.rating}/5` : 'Rate it'}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
