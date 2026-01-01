import { useState } from "react"
import { useComments } from "../../hooks/useComments"
import { formatDistanceToNow } from "../../lib/utils"
import { useUserStore } from "../../store/userStore"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2, Send } from "lucide-react"
import { Link } from "react-router-dom"

interface CommentSectionProps {
  reviewId: string
  currentUserId: string | null
}

export function CommentSection({
  reviewId,
  currentUserId,
}: CommentSectionProps) {
  const { comments, isLoading, add, remove } = useComments(reviewId)
  const [newComment, setNewComment] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const profile = useUserStore((s) => s.profile)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim() || !currentUserId || !profile) return

    setIsSubmitting(true)
    const success = await add(
      newComment.trim(),
      currentUserId,
      profile.displayName,
      profile.avatarUrl
    )
    if (success) {
      setNewComment("")
    }
    setIsSubmitting(false)
  }

  const handleDelete = async (commentId: string) => {
    if (!currentUserId) return
    if (window.confirm("Delete this comment?")) {
      await remove(commentId, currentUserId)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-4 text-muted-foreground text-sm">
        <Loader2 className="h-4 w-4 animate-spin mr-2" />
        Loading comments...
      </div>
    )
  }

  return (
    <div className="space-y-3 pt-2 border-t">
      {/* Comment List */}
      {comments.length > 0 ? (
        <div className="space-y-3 max-h-60 overflow-y-auto">
          {comments.map((comment) => (
            <div key={comment.id} className="flex gap-2">
              <Link to={`/profile/${comment.userId}`}>
                <Avatar className="h-8 w-8">
                  <AvatarImage src={comment.userAvatar || undefined} />
                  <AvatarFallback className="text-xs">
                    {comment.userDisplayName.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </Link>
              <div className="flex-1 min-w-0">
                <div className="bg-muted rounded-lg px-3 py-2">
                  <Link
                    to={`/profile/${comment.userId}`}
                    className="text-xs font-medium hover:underline"
                  >
                    {comment.userDisplayName}
                  </Link>
                  <p className="text-sm">{comment.text}</p>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(comment.createdAt)}
                  </span>
                  {currentUserId === comment.userId && (
                    <button
                      onClick={() => handleDelete(comment.id)}
                      className="text-xs text-muted-foreground hover:text-destructive"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground text-center py-2">
          No comments yet
        </p>
      )}

      {/* Add Comment Form */}
      {currentUserId ? (
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src={profile?.avatarUrl || undefined} />
            <AvatarFallback className="text-xs">
              {profile?.displayName?.charAt(0).toUpperCase() || "?"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 flex gap-2">
            <Input
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Write a comment..."
              className="h-8 text-sm"
              disabled={isSubmitting}
            />
            <Button
              type="submit"
              size="icon"
              className="h-8 w-8"
              disabled={!newComment.trim() || isSubmitting}
            >
              {isSubmitting ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Send size={14} />
              )}
            </Button>
          </div>
        </form>
      ) : (
        <p className="text-xs text-muted-foreground text-center">
          Sign in to comment
        </p>
      )}
    </div>
  )
}
