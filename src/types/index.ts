export interface Session {
  id: string
  gameId: string
  gameName: string
  startTime: Date
  endTime: Date
  duration: number // minutes
  note?: string // optional session note
}

export interface Budget {
  id: string
  type: "daily" | "weekly" | "game"
  gameId?: string
  limit: number // minutes
  current: number
  rolloverMinutes?: number
  baseLimit?: number
}

export interface Game {
  id: string
  name: string
  packageName?: string // Android package name for auto-launch
  icon?: string
  category: string
  totalTime: number
  vibeTags: string[]
  rating: number
  // RAWG.io metadata (optional)
  rawgId?: number
  backgroundImage?: string
  genres?: string[]
  platforms?: string[]
  metacritic?: number | null
}

export type GaugeState = "safe" | "caution" | "exceeded"

// ============ Community Types ============

export interface UserProfile {
  id: string
  displayName: string
  avatarUrl: string | null
  bio: string
  followerCount: number
  followingCount: number
  reviewCount: number
  isAdmin: boolean
  createdAt: Date
}

export interface CommunityReview {
  id: string
  userId: string
  userDisplayName: string
  userAvatar: string | null
  rawgId: number | null
  gameName: string
  gameImage: string | null
  rating: number
  reviewText: string
  vibeTags: string[]
  likeCount: number
  commentCount: number
  status: "active" | "hidden" | "removed"
  createdAt: Date
}

export interface Comment {
  id: string
  reviewId: string
  userId: string
  userDisplayName: string
  userAvatar: string | null
  text: string
  status: "active" | "hidden" | "removed"
  createdAt: Date
}

export interface Like {
  id: string
  reviewId: string
  userId: string
  createdAt: Date
}

export interface Follow {
  id: string
  followerId: string
  followingId: string
  createdAt: Date
}

export type ActivityType = "new_review" | "new_follower" | "comment" | "like"

export interface ActivityFeedItem {
  id: string
  type: ActivityType
  actorId: string
  actorName: string
  actorAvatar: string | null
  targetId: string
  targetType: "review" | "user"
  preview: string | null
  read: boolean
  createdAt: Date
}

export type ReportReason = "spam" | "inappropriate" | "misleading" | "other"
export type ReportStatus = "pending" | "reviewed" | "actioned"
export type ContentType = "review" | "comment" | "profile"

export interface ModerationReport {
  id: string
  contentType: ContentType
  contentId: string
  reporterId: string
  reason: ReportReason
  details: string
  status: ReportStatus
  createdAt: Date
}
