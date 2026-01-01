import { type RAWGGame, mapGenreToCategory, mapToVibeTags } from '../../lib/rawg'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useSessionStore } from '../../store/sessionStore'
import { Gamepad2, Plus, Check, Star } from 'lucide-react'

interface RecommendationCardProps {
  game: RAWGGame
}

export function RecommendationCard({ game }: RecommendationCardProps) {
  const games = useSessionStore((s) => s.games)
  const addGame = useSessionStore((s) => s.addGame)
  
  const isInLibrary = games.some((g) => g.rawgId === game.id)

  const handleAdd = () => {
    addGame({
      name: game.name,
      category: mapGenreToCategory(game.genres),
      vibeTags: mapToVibeTags(game),
      rawgId: game.id,
      backgroundImage: game.background_image || undefined,
      genres: game.genres?.map((g) => g.name),
      platforms: game.platforms?.map((p) => p.platform.name),
      metacritic: game.metacritic,
    })
  }

  return (
    <Card className="overflow-hidden">
      {game.background_image ? (
        <img
          src={game.background_image}
          alt={game.name}
          className="w-full h-32 object-cover"
        />
      ) : (
        <div className="w-full h-32 bg-muted flex items-center justify-center">
          <Gamepad2 className="w-10 h-10 text-muted-foreground" />
        </div>
      )}
      <CardContent className="pt-3 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <h4 className="font-medium text-foreground leading-tight">{game.name}</h4>
          {game.metacritic && (
            <Badge variant="secondary" className="shrink-0">{game.metacritic}</Badge>
          )}
        </div>
        
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>{game.genres?.slice(0, 2).map((g) => g.name).join(', ') || 'Unknown'}</span>
          {game.rating > 0 && (
            <span className="flex items-center gap-0.5">
              <Star className="w-3 h-3 fill-primary text-primary" />
              {game.rating.toFixed(1)}
            </span>
          )}
        </div>

        <Button
          size="sm"
          variant={isInLibrary ? "secondary" : "default"}
          className="w-full mt-2"
          onClick={handleAdd}
          disabled={isInLibrary}
        >
          {isInLibrary ? (
            <>
              <Check size={14} className="mr-1" />
              In Library
            </>
          ) : (
            <>
              <Plus size={14} className="mr-1" />
              Add to Library
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  )
}
