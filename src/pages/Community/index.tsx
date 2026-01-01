import { useState } from 'react'
import { GameRankingCard } from '../../components/community/GameRankingCard'
import { RecommendationCard } from "../../components/community/RecommendationCard"
import { AddGameDialog } from "../../components/games/AddGameDialog"
import { ActivityFeed } from "../../components/community/ActivityFeed"
import { CommunityReviewCard } from "../../components/community/CommunityReviewCard"
import { SubmitReviewDialog } from "../../components/community/SubmitReviewDialog"
import { useSessionStore } from "../../store/sessionStore"
import { useRecommendations } from "../../hooks/useRecommendations"
import { useCommunityReviews } from "../../hooks/useCommunityReviews"
import { useAuth } from "../../hooks/useAuth"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Gamepad2,
  Compass,
  Trophy,
  Loader2,
  RefreshCw,
  Rss,
  Star,
  Plus,
} from "lucide-react"

const DISCOVER_TAGS = [
  { value: "top-rated", label: "Top Rated" },
  { value: "singleplayer", label: "Single Player" },
  { value: "multiplayer", label: "Multiplayer" },
  { value: "co-op", label: "Co-op" },
  { value: "relaxing", label: "Relaxing" },
] as const

const LIBRARY_FILTERS = [
  "All",
  "Relaxing",
  "Short Sessions",
  "Social",
  "Challenging",
] as const
type LibraryFilter = (typeof LIBRARY_FILTERS)[number]

const REVIEW_FILTERS = [
  "All",
  "Relaxing",
  "Challenging",
  "Social",
  "Story-driven",
] as const
type ReviewFilter = (typeof REVIEW_FILTERS)[number]

const SORT_OPTIONS = [
  { value: "rating", label: "Highest Rated" },
  { value: "playtime", label: "Most Played" },
  { value: "metacritic", label: "Metacritic" },
] as const
type SortOption = (typeof SORT_OPTIONS)[number]["value"]

export function CommunityPage() {
  const [discoverTag, setDiscoverTag] = useState("top-rated")
  const [libraryFilter, setLibraryFilter] = useState<LibraryFilter>("All")
  const [reviewFilter, setReviewFilter] = useState<ReviewFilter>("All")
  const [sortBy, setSortBy] = useState<SortOption>("rating")

  const { user } = useAuth()
  const currentUserId = user?.uid || null

  const games = useSessionStore((s) => s.games)
  const {
    games: recommendations,
    isLoading: discoverLoading,
    error: discoverError,
    refresh: refreshDiscover,
  } = useRecommendations(discoverTag === "top-rated" ? undefined : discoverTag)

  const {
    reviews,
    isLoading: reviewsLoading,
    error: reviewsError,
    refresh: refreshReviews,
    remove: removeReview,
  } = useCommunityReviews(reviewFilter === "All" ? undefined : reviewFilter)

  const filteredGames = games
    .filter((game) => {
      if (libraryFilter === "All") return true
      if (libraryFilter === "Short Sessions")
        return game.vibeTags.some((t) => t.toLowerCase().includes("short"))
      return game.vibeTags.some((t) =>
        t.toLowerCase().includes(libraryFilter.toLowerCase())
      )
    })
    .sort((a, b) => {
      if (sortBy === "rating") return b.rating - a.rating
      if (sortBy === "playtime") return b.totalTime - a.totalTime
      if (sortBy === "metacritic")
        return (b.metacritic ?? 0) - (a.metacritic ?? 0)
      return 0
    })

  const handleDeleteReview = async (reviewId: string) => {
    if (currentUserId) {
      await removeReview(reviewId, currentUserId)
    }
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold text-foreground md:text-3xl">
          Community
        </h1>
        <p className="text-muted-foreground text-sm">
          Connect, share, and discover mindful games
        </p>
      </header>

      <Tabs defaultValue="feed">
        <TabsList className="flex-wrap h-auto">
          <TabsTrigger value="feed" className="gap-2">
            <Rss size={14} />
            Feed
          </TabsTrigger>
          <TabsTrigger value="reviews" className="gap-2">
            <Star size={14} />
            Reviews
          </TabsTrigger>
          <TabsTrigger value="ranking" className="gap-2">
            <Trophy size={14} />
            Ranking
          </TabsTrigger>
          <TabsTrigger value="discover" className="gap-2">
            <Compass size={14} />
            Discover
          </TabsTrigger>
        </TabsList>

        {/* Activity Feed Tab */}
        <TabsContent value="feed" className="space-y-4 mt-4">
          <ActivityFeed userId={currentUserId} />
        </TabsContent>

        {/* Community Reviews Tab */}
        <TabsContent value="reviews" className="space-y-4 mt-4">
          <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
            <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
              {REVIEW_FILTERS.map((filter) => (
                <Button
                  key={filter}
                  onClick={() => setReviewFilter(filter)}
                  variant={reviewFilter === filter ? "default" : "secondary"}
                  size="sm"
                  className="rounded-full whitespace-nowrap"
                >
                  {filter}
                </Button>
              ))}
            </div>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={refreshReviews}
                disabled={reviewsLoading}
              >
                <RefreshCw
                  size={16}
                  className={reviewsLoading ? "animate-spin" : ""}
                />
              </Button>
              <SubmitReviewDialog
                trigger={
                  <Button size="sm" className="gap-1">
                    <Plus size={14} />
                    Share Review
                  </Button>
                }
                onSuccess={refreshReviews}
              />
            </div>
          </div>

          {reviewsLoading && (
            <div className="flex items-center justify-center py-12 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin mr-2" />
              Loading reviews...
            </div>
          )}

          {reviewsError && (
            <div className="text-center py-8 text-destructive">
              {reviewsError}
            </div>
          )}

          {!reviewsLoading && !reviewsError && (
            <>
              {reviews.length === 0 ? (
                <div className="text-center py-16 space-y-4">
                  <Star className="w-12 h-12 mx-auto text-muted-foreground" />
                  <p className="text-muted-foreground">
                    No reviews yet. Be the first to share!
                  </p>
                  <SubmitReviewDialog
                    trigger={<Button>Share a Review</Button>}
                    onSuccess={refreshReviews}
                  />
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 gap-4">
                  {reviews.map((review) => (
                    <CommunityReviewCard
                      key={review.id}
                      review={review}
                      currentUserId={currentUserId}
                      onDelete={handleDeleteReview}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </TabsContent>

        {/* Ranking Tab */}
        <TabsContent value="ranking" className="space-y-4 mt-4">
          <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
            <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
              {LIBRARY_FILTERS.map((filter) => (
                <Button
                  key={filter}
                  onClick={() => setLibraryFilter(filter)}
                  variant={libraryFilter === filter ? "default" : "secondary"}
                  size="sm"
                  className="rounded-full whitespace-nowrap"
                >
                  {filter}
                </Button>
              ))}
            </div>
            <Select
              value={sortBy}
              onValueChange={(v) => setSortBy(v as SortOption)}
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SORT_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {games.length === 0 ? (
            <div className="text-center py-16 space-y-4">
              <Gamepad2 className="w-12 h-12 mx-auto text-muted-foreground" />
              <p className="text-muted-foreground">
                No games in your library yet
              </p>
              <AddGameDialog trigger={<Button>Add your first game</Button>} />
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {filteredGames.length > 0 ? (
                filteredGames.map((game, i) => (
                  <GameRankingCard key={game.id} game={game} rank={i + 1} />
                ))
              ) : (
                <p className="text-center text-muted-foreground py-8 md:col-span-2">
                  No games match this filter
                </p>
              )}
            </div>
          )}
        </TabsContent>

        {/* Discover Tab */}
        <TabsContent value="discover" className="space-y-4 mt-4">
          <div className="flex items-center gap-3">
            <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
              {DISCOVER_TAGS.map((t) => (
                <Button
                  key={t.value}
                  onClick={() => setDiscoverTag(t.value)}
                  variant={discoverTag === t.value ? "default" : "secondary"}
                  size="sm"
                  className="rounded-full whitespace-nowrap"
                >
                  {t.label}
                </Button>
              ))}
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={refreshDiscover}
              disabled={discoverLoading}
            >
              <RefreshCw
                size={16}
                className={discoverLoading ? "animate-spin" : ""}
              />
            </Button>
          </div>

          {discoverLoading && (
            <div className="flex items-center justify-center py-12 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin mr-2" />
              Loading recommendations...
            </div>
          )}

          {discoverError && (
            <div className="text-center py-8 text-destructive">
              {discoverError}
            </div>
          )}

          {!discoverLoading && !discoverError && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {recommendations.map((game) => (
                <RecommendationCard key={game.id} game={game} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
