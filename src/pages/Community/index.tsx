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
import { Card, CardContent } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { motion, AnimatePresence } from "framer-motion"
import {
  Gamepad2,
  Compass,
  Trophy,
  Loader2,
  RefreshCw,
  Rss,
  Star,
  Plus,
  Users,
  Sparkles,
  Heart,
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

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.1,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring" as const,
      stiffness: 400,
      damping: 30,
    }
  },
}

const cardHoverVariants = {
  rest: { scale: 1, y: 0 },
  hover: {
    scale: 1.02,
    y: -4,
    transition: {
      type: "spring" as const,
      stiffness: 400,
      damping: 25,
    }
  },
}

const gridVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
}

const gridItemVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      type: "spring" as const,
      stiffness: 400,
      damping: 30,
    }
  },
}

interface FilterButtonProps {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}

function FilterButton({ active, onClick, children }: FilterButtonProps) {
  return (
    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
      <Button
        onClick={onClick}
        variant={active ? "default" : "secondary"}
        size="sm"
        className="rounded-full whitespace-nowrap relative overflow-hidden"
      >
        {active && (
          <motion.div
            className="absolute inset-0 bg-primary"
            layoutId="activeFilter"
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
          />
        )}
        <span className="relative z-10">{children}</span>
      </Button>
    </motion.div>
  )
}

interface EmptyStateProps {
  icon: React.ReactNode
  title: string
  description: string
  action?: React.ReactNode
}

function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.2 }}
    >
      <Card className="border-dashed">
        <CardContent className="py-16 text-center">
          <motion.div
            className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center"
            animate={{
              y: [0, -8, 0],
            }}
            transition={{
              repeat: Infinity,
              duration: 3,
              ease: "easeInOut",
            }}
          >
            {icon}
          </motion.div>
          <p className="text-lg font-medium text-foreground mb-2">{title}</p>
          <p className="text-muted-foreground text-sm max-w-sm mx-auto mb-6">
            {description}
          </p>
          {action}
        </CardContent>
      </Card>
    </motion.div>
  )
}

function LoadingState({ message }: { message: string }) {
  return (
    <motion.div
      className="flex flex-col items-center justify-center py-16 text-muted-foreground"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
      >
        <Loader2 className="h-8 w-8 mb-4" />
      </motion.div>
      <p className="text-sm">{message}</p>
    </motion.div>
  )
}

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
    <motion.div
      className="space-y-6 pb-20"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.header variants={itemVariants} className="relative">
        <div className="absolute -top-4 -left-4 w-24 h-24 bg-chart-5/10 rounded-full blur-2xl pointer-events-none" />
        <div className="relative flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-chart-5 to-chart-5/60 flex items-center justify-center shadow-lg shadow-chart-5/20">
            <Users className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground md:text-3xl">
              Community
            </h1>
            <p className="text-muted-foreground text-sm flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              Connect, share, and discover mindful games
            </p>
          </div>
        </div>
      </motion.header>

      <motion.div variants={itemVariants}>
        <Tabs defaultValue="feed" className="space-y-6">
          <TabsList className="flex-wrap h-auto bg-card/50 p-1">
            <TabsTrigger value="feed" className="gap-2 data-[state=active]:shadow-md transition-all">
              <Rss size={14} />
              Feed
            </TabsTrigger>
            <TabsTrigger value="reviews" className="gap-2 data-[state=active]:shadow-md transition-all">
              <Star size={14} />
              Reviews
            </TabsTrigger>
            <TabsTrigger value="ranking" className="gap-2 data-[state=active]:shadow-md transition-all">
              <Trophy size={14} />
              Ranking
            </TabsTrigger>
            <TabsTrigger value="discover" className="gap-2 data-[state=active]:shadow-md transition-all">
              <Compass size={14} />
              Discover
            </TabsTrigger>
          </TabsList>

          {/* Activity Feed Tab */}
          <TabsContent value="feed" className="space-y-4 mt-4">
            <AnimatePresence mode="wait">
              <motion.div
                key="feed-content"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <ActivityFeed userId={currentUserId} />
              </motion.div>
            </AnimatePresence>
          </TabsContent>

          {/* Community Reviews Tab */}
          <TabsContent value="reviews" className="space-y-4 mt-4">
            <AnimatePresence mode="wait">
              <motion.div
                key="reviews-content"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4"
              >
                <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
                  <motion.div
                    className="flex gap-2 overflow-x-auto pb-2 sm:pb-0"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                  >
                    {REVIEW_FILTERS.map((filter) => (
                      <motion.div key={filter} variants={itemVariants}>
                        <FilterButton
                          active={reviewFilter === filter}
                          onClick={() => setReviewFilter(filter)}
                        >
                          {filter}
                        </FilterButton>
                      </motion.div>
                    ))}
                  </motion.div>
                  <div className="flex gap-2">
                    <motion.div whileHover={{ rotate: 180 }} transition={{ duration: 0.3 }}>
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
                    </motion.div>
                    <SubmitReviewDialog
                      trigger={
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                          <Button size="sm" className="gap-1">
                            <Plus size={14} />
                            Share Review
                          </Button>
                        </motion.div>
                      }
                      onSuccess={refreshReviews}
                    />
                  </div>
                </div>

                {reviewsLoading && <LoadingState message="Loading reviews..." />}

                {reviewsError && (
                  <motion.div
                    className="text-center py-8 text-destructive"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    {reviewsError}
                  </motion.div>
                )}

                {!reviewsLoading && !reviewsError && (
                  <>
                    {reviews.length === 0 ? (
                      <EmptyState
                        icon={<Star className="w-10 h-10 text-muted-foreground/50" />}
                        title="No reviews yet"
                        description="Be the first to share your thoughts on a game with the community!"
                        action={
                          <SubmitReviewDialog
                            trigger={
                              <Button className="gap-2">
                                <Heart size={16} />
                                Share a Review
                              </Button>
                            }
                            onSuccess={refreshReviews}
                          />
                        }
                      />
                    ) : (
                      <motion.div
                        className="grid sm:grid-cols-2 gap-4"
                        variants={gridVariants}
                        initial="hidden"
                        animate="visible"
                      >
                        {reviews.map((review) => (
                          <motion.div
                            key={review.id}
                            variants={gridItemVariants}
                          >
                            <motion.div
                              variants={cardHoverVariants}
                              initial="rest"
                              whileHover="hover"
                            >
                              <CommunityReviewCard
                                review={review}
                                currentUserId={currentUserId}
                                onDelete={handleDeleteReview}
                              />
                            </motion.div>
                          </motion.div>
                        ))}
                      </motion.div>
                    )}
                  </>
                )}
              </motion.div>
            </AnimatePresence>
          </TabsContent>

          {/* Ranking Tab */}
          <TabsContent value="ranking" className="space-y-4 mt-4">
            <AnimatePresence mode="wait">
              <motion.div
                key="ranking-content"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4"
              >
                <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
                  <motion.div
                    className="flex gap-2 overflow-x-auto pb-2 sm:pb-0"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                  >
                    {LIBRARY_FILTERS.map((filter) => (
                      <motion.div key={filter} variants={itemVariants}>
                        <FilterButton
                          active={libraryFilter === filter}
                          onClick={() => setLibraryFilter(filter)}
                        >
                          {filter}
                        </FilterButton>
                      </motion.div>
                    ))}
                  </motion.div>
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
                  <EmptyState
                    icon={<Gamepad2 className="w-10 h-10 text-muted-foreground/50" />}
                    title="No games yet"
                    description="Add games to your library to see them ranked here."
                    action={
                      <AddGameDialog
                        trigger={
                          <Button className="gap-2">
                            <Plus size={16} />
                            Add your first game
                          </Button>
                        }
                      />
                    }
                  />
                ) : (
                  <motion.div
                    className="grid md:grid-cols-2 gap-4"
                    variants={gridVariants}
                    initial="hidden"
                    animate="visible"
                  >
                    {filteredGames.length > 0 ? (
                      filteredGames.map((game, i) => (
                        <motion.div key={game.id} variants={gridItemVariants}>
                          <motion.div
                            variants={cardHoverVariants}
                            initial="rest"
                            whileHover="hover"
                          >
                            <GameRankingCard game={game} rank={i + 1} />
                          </motion.div>
                        </motion.div>
                      ))
                    ) : (
                      <motion.p
                        className="text-center text-muted-foreground py-8 md:col-span-2"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                      >
                        No games match this filter
                      </motion.p>
                    )}
                  </motion.div>
                )}
              </motion.div>
            </AnimatePresence>
          </TabsContent>

          {/* Discover Tab */}
          <TabsContent value="discover" className="space-y-4 mt-4">
            <AnimatePresence mode="wait">
              <motion.div
                key="discover-content"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4"
              >
                <div className="flex items-center gap-3">
                  <motion.div
                    className="flex gap-2 overflow-x-auto pb-2 sm:pb-0"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                  >
                    {DISCOVER_TAGS.map((t) => (
                      <motion.div key={t.value} variants={itemVariants}>
                        <FilterButton
                          active={discoverTag === t.value}
                          onClick={() => setDiscoverTag(t.value)}
                        >
                          {t.label}
                        </FilterButton>
                      </motion.div>
                    ))}
                  </motion.div>
                  <motion.div whileHover={{ rotate: 180 }} transition={{ duration: 0.3 }}>
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
                  </motion.div>
                </div>

                {discoverLoading && <LoadingState message="Finding great games..." />}

                {discoverError && (
                  <motion.div
                    className="text-center py-8 text-destructive"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    {discoverError}
                  </motion.div>
                )}

                {!discoverLoading && !discoverError && (
                  <motion.div
                    className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4"
                    variants={gridVariants}
                    initial="hidden"
                    animate="visible"
                  >
                    {recommendations.map((game) => (
                      <motion.div key={game.id} variants={gridItemVariants}>
                        <motion.div
                          variants={cardHoverVariants}
                          initial="rest"
                          whileHover="hover"
                        >
                          <RecommendationCard game={game} />
                        </motion.div>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </motion.div>
            </AnimatePresence>
          </TabsContent>
        </Tabs>
      </motion.div>
    </motion.div>
  )
}
