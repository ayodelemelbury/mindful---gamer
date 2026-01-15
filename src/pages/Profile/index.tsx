import { useParams } from 'react-router-dom'
import { useUserProfile } from '../../hooks/useUserProfile'
import { useUserReviews } from '../../hooks/useCommunityReviews'
import { useAuth } from '../../hooks/useAuth'
import { ProfileHeader } from '../../components/profile/ProfileHeader'
import { CommunityReviewCard } from '../../components/community/CommunityReviewCard'
import { UserProfileCard } from '../../components/community/UserProfileCard'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, Star, Users } from 'lucide-react'

export function ProfilePage() {
  const { userId } = useParams<{ userId: string }>()
  const { user } = useAuth()
  const currentUserId = user?.uid || null

  const {
    profile,
    isLoading: profileLoading,
    error: profileError,
    isFollowingUser,
    followers,
    following,
    follow,
    unfollow,
    refresh,
  } = useUserProfile(userId || null, currentUserId)

  const { reviews, isLoading: reviewsLoading } = useUserReviews(userId || null)

  if (profileLoading) {
    return (
      <div className="flex items-center justify-center py-20 text-muted-foreground">
        <Loader2 className="h-6 w-6 animate-spin mr-2" />
        Loading profile...
      </div>
    )
  }

  if (profileError || !profile) {
    return (
      <div className="text-center py-20">
        <h2 className="text-xl font-semibold text-destructive">Profile not found</h2>
        <p className="text-muted-foreground mt-2">
          This user may not exist or their profile is private.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <ProfileHeader
        profile={profile}
        currentUserId={currentUserId}
        isFollowing={isFollowingUser}
        onFollow={follow}
        onUnfollow={unfollow}
        onProfileUpdated={refresh}
      />

      <Tabs defaultValue="reviews">
        <TabsList>
          <TabsTrigger value="reviews" className="gap-2">
            <Star size={14} />
            Reviews {reviewsLoading ? "…" : `(${reviews.length})`}
          </TabsTrigger>
          <TabsTrigger value="followers" className="gap-2">
            <Users size={14} />
            Followers ({followers.length})
          </TabsTrigger>
          <TabsTrigger value="following" className="gap-2">
            <Users size={14} />
            Following ({following.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="reviews" className="mt-4 space-y-4">
          {reviewsLoading ? (
            <div className="flex items-center justify-center py-8 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin mr-2" />
              Loading reviews...
            </div>
          ) : reviews.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Star className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground">No reviews yet</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {reviews.map((review) => (
                <CommunityReviewCard
                  key={review.id}
                  review={review}
                  currentUserId={currentUserId}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="followers" className="mt-4">
          {followers.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Users className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground">No followers yet</p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Followers</CardTitle>
              </CardHeader>
              <CardContent className="space-y-1">
                {followers.map((follower) => (
                  <UserProfileCard
                    key={follower.id}
                    profile={follower}
                    currentUserId={currentUserId}
                    compact
                  />
                ))}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="following" className="mt-4">
          {following.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Users className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground">Not following anyone yet</p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Following</CardTitle>
              </CardHeader>
              <CardContent className="space-y-1">
                {following.map((followed) => (
                  <UserProfileCard
                    key={followed.id}
                    profile={followed}
                    currentUserId={currentUserId}
                    compact
                  />
                ))}
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
