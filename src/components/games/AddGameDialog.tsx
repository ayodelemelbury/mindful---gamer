import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Plus, X, Search, Loader2, Gamepad2, ExternalLink } from "lucide-react"
import { useSessionStore } from "../../store/sessionStore"
import { useRAWGSearch } from "../../hooks/useRAWGSearch"
import {
  mapGenreToCategory,
  mapToVibeTags,
  type RAWGGame,
} from "../../lib/rawg"

const CATEGORIES = [
  "Action",
  "RPG",
  "Casual",
  "FPS",
  "Platformer",
  "Roguelike",
  "Strategy",
  "Sports",
  "Other",
] as const
const VIBE_TAGS = [
  "Relaxing",
  "Challenging",
  "Social",
  "Immersive",
  "Short sessions",
  "Competitive",
  "Creative",
] as const

interface AddGameDialogProps {
  trigger?: React.ReactNode
  onGameAdded?: () => void
}

export function AddGameDialog({ trigger, onGameAdded }: AddGameDialogProps) {
  const [open, setOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<"search" | "manual">("search")

  // Manual entry state
  const [name, setName] = useState("")
  const [category, setCategory] = useState<string>("")
  const [selectedTags, setSelectedTags] = useState<string[]>([])

  // RAWG search state
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedGame, setSelectedGame] = useState<RAWGGame | null>(null)
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  const { results, isLoading, error, search, clearResults } = useRAWGSearch()

  const addGame = useSessionStore((s) => s.addGame)

  // Search as user types
  useEffect(() => {
    if (activeTab === "search") {
      search(searchQuery)
    }
  }, [searchQuery, activeTab, search])

  // Reset state when dialog closes - using callback in onOpenChange instead
  const resetForm = () => {
    setName("")
    setCategory("")
    setSelectedTags([])
    setSearchQuery("")
    setSelectedGame(null)
    setHighlightedIndex(-1)
    clearResults()
    setActiveTab("search")
  }

  // Reset highlight when results change - derive from results length instead
  const prevResultsLength = results.length
  if (prevResultsLength > 0 && highlightedIndex >= prevResultsLength) {
    setHighlightedIndex(-1)
  }

  const handleTagToggle = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    )
  }

  const handleSelectFromSearch = (game: RAWGGame) => {
    setSelectedGame(game)
    // Auto-fill form fields
    setName(game.name)
    setCategory(mapGenreToCategory(game.genres))
    setSelectedTags(mapToVibeTags(game))
  }

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (results.length === 0) return

    if (e.key === "ArrowDown") {
      e.preventDefault()
      setHighlightedIndex((i) => (i < results.length - 1 ? i + 1 : 0))
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setHighlightedIndex((i) => (i > 0 ? i - 1 : results.length - 1))
    } else if (e.key === "Enter" && highlightedIndex >= 0) {
      e.preventDefault()
      handleSelectFromSearch(results[highlightedIndex])
    }
  }

  const getYear = (dateStr: string | null) => dateStr?.split("-")[0] || null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !category) return

    addGame({
      name: name.trim(),
      category,
      vibeTags: selectedTags,
      // Add RAWG metadata if available
      ...(selectedGame && {
        rawgId: selectedGame.id,
        backgroundImage: selectedGame.background_image || undefined,
        genres: selectedGame.genres?.map((g) => g.name),
        platforms: selectedGame.platforms?.map((p) => p.platform.name),
        metacritic: selectedGame.metacritic,
      }),
    })

    setOpen(false)
    onGameAdded?.()
  }

  const isValid = name.trim().length > 0 && category.length > 0

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen)
    if (!newOpen) resetForm()
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger || (
          <Button size="icon" variant="outline" className="shrink-0">
            <Plus size={18} />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add New Game</DialogTitle>
        </DialogHeader>

        <Tabs
          value={activeTab}
          onValueChange={(v) => setActiveTab(v as "search" | "manual")}
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="search" className="gap-2">
              <Search size={14} />
              Search
            </TabsTrigger>
            <TabsTrigger value="manual" className="gap-2">
              <Gamepad2 size={14} />
              Manual
            </TabsTrigger>
          </TabsList>

          <TabsContent value="search" className="space-y-4 mt-4">
            {/* Search Input */}
            <div className="space-y-2">
              <Label htmlFor="search-game">Search Games</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search-game"
                  placeholder="Search for a game..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleSearchKeyDown}
                  className="pl-9"
                  autoFocus
                />
              </div>
            </div>

            {/* Search Results */}
            {isLoading && (
              <div className="flex items-center justify-center py-8 text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
                Searching...
              </div>
            )}

            {error && (
              <div className="text-destructive text-sm py-4 text-center">
                {error}
              </div>
            )}

            {!isLoading && !error && results.length > 0 && (
              <ScrollArea className="h-64">
                <div className="space-y-2 pr-4">
                  {results.map((game, index) => (
                    <button
                      key={game.id}
                      type="button"
                      onClick={() => handleSelectFromSearch(game)}
                      className={`w-full flex items-center gap-3 p-2 rounded-lg border transition-colors text-left
                        ${
                          selectedGame?.id === game.id
                            ? "border-primary bg-primary/10"
                            : index === highlightedIndex
                            ? "border-muted-foreground bg-muted/50"
                            : "border-border hover:bg-muted/50"
                        }`}
                    >
                      {game.background_image ? (
                        <img
                          src={game.background_image}
                          alt={game.name}
                          className="w-16 h-12 object-cover rounded"
                        />
                      ) : (
                        <div className="w-16 h-12 bg-muted rounded flex items-center justify-center">
                          <Gamepad2 className="h-6 w-6 text-muted-foreground" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">
                          {game.name}
                          {getYear(game.released) && (
                            <span className="text-muted-foreground font-normal ml-1">
                              ({getYear(game.released)})
                            </span>
                          )}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {game.genres
                            ?.slice(0, 3)
                            .map((g) => g.name)
                            .join(", ") || "Unknown genre"}
                        </p>
                      </div>
                      {game.metacritic && (
                        <Badge variant="secondary" className="shrink-0">
                          {game.metacritic}
                        </Badge>
                      )}
                    </button>
                  ))}
                </div>
              </ScrollArea>
            )}

            {!isLoading && !error && searchQuery && results.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <p>No games found</p>
                <Button
                  variant="link"
                  className="mt-2"
                  onClick={() => {
                    setName(searchQuery)
                    setActiveTab("manual")
                  }}
                >
                  Add "{searchQuery}" manually
                </Button>
              </div>
            )}

            {/* Selected Game Preview */}
            {selectedGame && (
              <div className="p-3 rounded-lg border border-primary bg-primary/5">
                <p className="text-sm font-medium">
                  Selected: {selectedGame.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  Category: {category} •{" "}
                  {selectedTags.length > 0 &&
                    `Tags: ${selectedTags.join(", ")}`}
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="manual" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="game-name">Game Name</Label>
              <Input
                id="game-name"
                placeholder="e.g., Minecraft"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus={activeTab === "manual"}
              />
            </div>
          </TabsContent>
        </Tabs>

        {/* Category and Tags (shared) */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger id="category">
                <SelectValue placeholder="Select category..." />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Vibe Tags (optional)</Label>
            <div className="flex flex-wrap gap-2">
              {VIBE_TAGS.map((tag) => (
                <Badge
                  key={tag}
                  variant={selectedTags.includes(tag) ? "default" : "outline"}
                  className="cursor-pointer transition-colors"
                  onClick={() => handleTagToggle(tag)}
                >
                  {selectedTags.includes(tag) && (
                    <X size={12} className="mr-1" />
                  )}
                  {tag}
                </Badge>
              ))}
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <a
              href="https://rawg.io"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 mr-auto"
            >
              Powered by RAWG <ExternalLink size={10} />
            </a>
            <DialogClose asChild>
              <Button type="button" variant="ghost">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" disabled={!isValid}>
              Add Game
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
