import type { Game } from '../../types'
import { VibeTag } from './VibeTag'
import { Card, CardContent } from '@/components/ui/card'

interface GameRankingCardProps {
  game: Game
  rank: number
}

export function GameRankingCard({ game, rank }: GameRankingCardProps) {
  return (
    <Card>
      <CardContent className="pt-4 flex gap-4 items-center">
        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold text-sm">
          {rank}
        </div>
        <div className="flex-1">
          <h4 className="font-medium text-foreground">{game.name}</h4>
          <p className="text-xs text-muted-foreground">{game.category}</p>
          <div className="flex gap-1 mt-2 flex-wrap">
            {game.vibeTags.map((tag) => (
              <VibeTag key={tag} tag={tag} />
            ))}
          </div>
        </div>
        <div className="text-right">
          <span className="text-lg font-semibold text-primary">{game.rating}</span>
          <p className="text-xs text-muted-foreground">rating</p>
        </div>
      </CardContent>
    </Card>
  )
}

