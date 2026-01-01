import { useState } from "react"
import { useSessionStore } from "../../store/sessionStore"
import { useUserStore } from "../../store/userStore"
import { useCommunityReviews } from "../../hooks/useCommunityReviews"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Star, Loader2, Gamepad2 } from "lucide-react"

// Available vibe tags for selection
const VIBE_TAGS = [
  "Relaxing",
  "Challenging",
  "Social",
  "Short Sessions",
  "Story-driven",
  "Competitive",
  "Creative",
  "Immersive",
]

interface SubmitReviewDialogProps {
  trigger?: React.ReactNode
  onSuccess?: () => void
}

export function SubmitReviewDialog({
  trigger,
  onSuccess,
}: SubmitReviewDialogProps) {
  const [open, setOpen] = useState(false)
  const [selectedGameId, setSelectedGameId] = useState<string>("")
  const [rating, setRating] = useState(0)
  const [reviewText, setReviewText] = useState("")
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const games = useSessionStore((s) => s.games)
  const profile = useUserStore((s) => s.profile)
  const isAuthenticated = useUserStore((s) => s.isAuthenticated)
  const { submit } = useCommunityReviews()

  const selectedGame = games.find((g) => g.id === selectedGameId)

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    )
  }

  const resetForm = () => {
    setSelectedGameId("")
    setRating(0)
    setReviewText("")
    setSelectedTags([])
    setError(null)
  }

  const handleSubmit = async () => {
    if (!selectedGame || !profile || rating === 0) {
      setError("Please select a game and rating")
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      // Get user ID from Firebase auth
      const { auth } = await import("../../lib/firebase")
      const userId = auth.currentUser?.uid
      if (!userId) {
        setError("Not authenticated")
        return
      }

      await submit({
        userId,
        userDisplayName: profile.displayName,
        userAvatar: profile.avatarUrl,
        rawgId: selectedGame.rawgId || null,
        gameName: selectedGame.name,
        gameImage: selectedGame.backgroundImage || null,
        rating,
        reviewText: reviewText.trim(),
        vibeTags:
          selectedTags.length > 0 ? selectedTags : selectedGame.vibeTags,
      })

      resetForm()
      setOpen(false)
      onSuccess?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit review")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isAuthenticated) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          {trigger || <Button>Share a Review</Button>}
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sign in required</DialogTitle>
            <DialogDescription>
              You need to be signed in to share reviews.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || <Button>Share a Review</Button>}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Share a Game Review</DialogTitle>
          <DialogDescription>
            Share your thoughts on a game from your library.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Game Selector */}
          <div className="space-y-2">
            <Label>Select a game</Label>
            {games.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Add games to your library first
              </p>
            ) : (
              <Select value={selectedGameId} onValueChange={setSelectedGameId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a game" />
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
                          <Gamepad2
                            size={16}
                            className="text-muted-foreground"
                          />
                        )}
                        {game.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Rating */}
          <div className="space-y-2">
            <Label>Your rating</Label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="p-1 hover:scale-110 transition-transform"
                >
                  <Star
                    size={24}
                    className={
                      star <= rating
                        ? "fill-primary text-primary"
                        : "text-muted-foreground/40"
                    }
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Review Text */}
          <div className="space-y-2">
            <Label htmlFor="review">Review (optional)</Label>
            <Textarea
              id="review"
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder="Share your thoughts..."
              rows={3}
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground text-right">
              {reviewText.length}/500
            </p>
          </div>

          {/* Vibe Tags */}
          <div className="space-y-2">
            <Label>Vibe tags (optional)</Label>
            <div className="flex flex-wrap gap-2">
              {VIBE_TAGS.map((tag) => (
                <Button
                  key={tag}
                  type="button"
                  variant={selectedTags.includes(tag) ? "default" : "outline"}
                  size="sm"
                  className="rounded-full text-xs"
                  onClick={() => toggleTag(tag)}
                >
                  {tag}
                </Button>
              ))}
            </div>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !selectedGameId || rating === 0}
          >
            {isSubmitting ? (
              <>
                <Loader2 size={16} className="mr-2 animate-spin" />
                Sharing...
              </>
            ) : (
              "Share Review"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
