import type { UserProfile } from '../../types'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Link } from 'react-router-dom'

interface UserProfileCardProps {
  profile: UserProfile
  currentUserId?: string | null
  isFollowing?: boolean
  onFollow?: () => void
  onUnfollow?: () => void
  compact?: boolean
}

export function UserProfileCard({
  profile,
  currentUserId,
  isFollowing = false,
  onFollow,
  onUnfollow,
  compact = false,
}: UserProfileCardProps) {
  const isOwnProfile = currentUserId === profile.id

  if (compact) {
    return (
      <div className="flex items-center gap-3 p-2">
        <Link to={`/profile/${profile.id}`}>
          <Avatar className="h-10 w-10">
            <AvatarImage src={profile.avatarUrl || undefined} />
            <AvatarFallback>
              {profile.displayName.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </Link>
        <div className="flex-1 min-w-0">
          <Link
            to={`/profile/${profile.id}`}
            className="font-medium text-sm hover:underline truncate block"
          >
            {profile.displayName}
          </Link>
          <p className="text-xs text-muted-foreground truncate">
            {profile.reviewCount} reviews
          </p>
        </div>
        {!isOwnProfile && onFollow && onUnfollow && (
          <Button
            variant={isFollowing ? 'outline' : 'default'}
            size="sm"
            onClick={isFollowing ? onUnfollow : onFollow}
          >
            {isFollowing ? 'Following' : 'Follow'}
          </Button>
        )}
      </div>
    )
  }

  return (
    <Card>
      <CardContent className="pt-4">
        <div className="flex items-start gap-4">
          <Link to={`/profile/${profile.id}`}>
            <Avatar className="h-14 w-14">
              <AvatarImage src={profile.avatarUrl || undefined} />
              <AvatarFallback className="text-lg">
                {profile.displayName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </Link>
          <div className="flex-1 min-w-0">
            <Link
              to={`/profile/${profile.id}`}
              className="font-semibold hover:underline"
            >
              {profile.displayName}
            </Link>
            {profile.bio && (
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                {profile.bio}
              </p>
            )}
            <div className="flex gap-4 mt-2 text-sm text-muted-foreground">
              <span>
                <strong className="text-foreground">{profile.followerCount}</strong> followers
              </span>
              <span>
                <strong className="text-foreground">{profile.followingCount}</strong> following
              </span>
              <span>
                <strong className="text-foreground">{profile.reviewCount}</strong> reviews
              </span>
            </div>
          </div>
          {!isOwnProfile && onFollow && onUnfollow && (
            <Button
              variant={isFollowing ? 'outline' : 'default'}
              size="sm"
              onClick={isFollowing ? onUnfollow : onFollow}
            >
              {isFollowing ? 'Following' : 'Follow'}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
