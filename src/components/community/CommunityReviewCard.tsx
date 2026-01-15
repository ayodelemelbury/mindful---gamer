import { useState } from "react"
import type { CommunityReview } from "../../types"
import { VibeTag } from "./VibeTag"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useReviewLike } from "../../hooks/useCommunityReviews"
import { formatDistanceToNow } from "../../lib/utils"
import {
  Star,
  Heart,
  MessageCircle,
  Flag,
  Trash2,
  Gamepad2,
  MoreHorizontal,
} from "lucide-react"
import { Link } from "react-router-dom"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { CommentSection } from "./CommentSection"
import { ReportDialog } from "./ReportDialog"

interface CommunityReviewCardProps {
  review: CommunityReview
  currentUserId: string | null
  onDelete?: (reviewId: string) => void
}

export function CommunityReviewCard({
  review,
  currentUserId,
  onDelete,
}: CommunityReviewCardProps) {
  const { hasLiked, toggleLike } = useReviewLike(review.id, currentUserId)
  const [showComments, setShowComments] = useState(false)
  const [showReport, setShowReport] = useState(false)
  const [likeCount, setLikeCount] = useState(review.likeCount)

  const isOwn = currentUserId === review.userId

  const handleLike = async () => {
    try {
      const newLikedState = await toggleLike()
      // Only update count if toggle succeeded (returned a boolean, not null)
      if (newLikedState !== null) {
        setLikeCount((prev) => (newLikedState ? prev + 1 : prev - 1))
      }
    } catch (error) {
      // Log the error; UI remains unchanged so it stays consistent with server state
      console.error("Failed to toggle like:", error)
    }
  }

  const handleDelete = () => {
    if (onDelete && window.confirm("Delete this review?")) {
      onDelete(review.id)
    }
  }

  return (
    <>
      <Card>
        <CardContent className="pt-4 space-y-3">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <Link to={`/profile/${review.userId}`}>
                <Avatar className="h-10 w-10">
                  <AvatarImage src={review.userAvatar || undefined} />
                  <AvatarFallback>
                    {(review.userDisplayName?.charAt(0) || "?").toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </Link>
              <div>
                <Link
                  to={`/profile/${review.userId}`}
                  className="font-medium hover:underline text-sm"
                >
                  {review.userDisplayName}
                </Link>
                <p className="text-xs text-muted-foreground">
                  {formatDistanceToNow(review.createdAt)}
                </p>
              </div>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal size={16} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {isOwn ? (
                  <DropdownMenuItem
                    onClick={handleDelete}
                    className="text-destructive"
                  >
                    <Trash2 size={14} className="mr-2" />
                    Delete
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem onClick={() => setShowReport(true)}>
                    <Flag size={14} className="mr-2" />
                    Report
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Game Info */}
          <div className="flex gap-3">
            {review.gameImage ? (
              <img
                src={review.gameImage}
                alt={review.gameName}
                className="w-16 h-20 object-cover rounded"
              />
            ) : (
              <div className="w-16 h-20 bg-muted rounded flex items-center justify-center">
                <Gamepad2 className="w-6 h-6 text-muted-foreground" />
              </div>
            )}
            <div className="flex-1">
              <h4 className="font-medium">{review.gameName}</h4>
              <div className="flex items-center gap-1 mt-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    size={14}
                    className={
                      star <= review.rating
                        ? "fill-primary text-primary"
                        : "text-muted-foreground/40"
                    }
                  />
                ))}
              </div>
              <div className="flex gap-1 mt-2 flex-wrap">
                {review.vibeTags.map((tag) => (
                  <VibeTag key={tag} tag={tag} />
                ))}
              </div>
            </div>
          </div>

          {/* Review Text */}
          {review.reviewText && (
            <p className="text-sm text-muted-foreground">{review.reviewText}</p>
          )}

          {/* Actions */}
          <div className="flex items-center gap-4 pt-2 border-t">
            <Button
              variant="ghost"
              size="sm"
              className={`gap-1 ${hasLiked ? "text-rose-500" : ""}`}
              onClick={handleLike}
              disabled={!currentUserId}
            >
              <Heart size={16} className={hasLiked ? "fill-current" : ""} />
              {likeCount}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="gap-1"
              onClick={() => setShowComments(!showComments)}
            >
              <MessageCircle size={16} />
              {review.commentCount}
            </Button>
          </div>

          {/* Comments Section */}
          {showComments && (
            <CommentSection
              reviewId={review.id}
              currentUserId={currentUserId}
            />
          )}
        </CardContent>
      </Card>

      <ReportDialog
        open={showReport}
        onOpenChange={setShowReport}
        contentType="review"
        contentId={review.id}
        reporterId={currentUserId}
      />
    </>
  )
}
