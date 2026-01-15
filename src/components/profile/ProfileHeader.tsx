import { useState } from 'react'
import type { UserProfile } from '../../types'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Pencil } from 'lucide-react'
import { EditProfileDialog } from './EditProfileDialog'

interface ProfileHeaderProps {
  profile: UserProfile
  currentUserId: string | null
  isFollowing: boolean
  onFollow: () => void
  onUnfollow: () => void
  onProfileUpdated?: () => void
}

export function ProfileHeader({
  profile,
  currentUserId,
  isFollowing,
  onFollow,
  onUnfollow,
  onProfileUpdated,
}: ProfileHeaderProps) {
  const [showEditDialog, setShowEditDialog] = useState(false)
  const isOwnProfile = currentUserId === profile.id

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-start gap-4">
          <Avatar className="h-20 w-20">
            <AvatarImage src={profile.avatarUrl || undefined} />
            <AvatarFallback className="text-2xl">
              {profile.displayName.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold">{profile.displayName}</h1>
              {profile.isAdmin && (
                <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                  Admin
                </span>
              )}
            </div>

            {profile.bio && (
              <p className="text-muted-foreground mt-1">{profile.bio}</p>
            )}

            <div className="flex gap-6 mt-3 text-sm">
              <div>
                <span className="font-semibold">{profile.followerCount}</span>
                <span className="text-muted-foreground ml-1">followers</span>
              </div>
              <div>
                <span className="font-semibold">{profile.followingCount}</span>
                <span className="text-muted-foreground ml-1">following</span>
              </div>
              <div>
                <span className="font-semibold">{profile.reviewCount}</span>
                <span className="text-muted-foreground ml-1">reviews</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          {isOwnProfile ? (
            <Button
              variant="outline"
              className="gap-2"
              onClick={() => setShowEditDialog(true)}
            >
              <Pencil size={16} />
              Edit Profile
            </Button>
          ) : (
            <Button
              variant={isFollowing ? 'outline' : 'default'}
              onClick={isFollowing ? onUnfollow : onFollow}
            >
              {isFollowing ? 'Unfollow' : 'Follow'}
            </Button>
          )}
        </div>
      </div>

      {isOwnProfile && (
        <EditProfileDialog
          open={showEditDialog}
          onOpenChange={setShowEditDialog}
          profile={profile}
          onSuccess={onProfileUpdated}
        />
      )}
    </>
  )
}
