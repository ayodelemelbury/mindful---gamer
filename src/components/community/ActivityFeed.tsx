import { useCommunityFeed } from '../../hooks/useCommunityFeed'
import { ActivityFeedItemCard } from './ActivityFeedItem'
import { Button } from '@/components/ui/button'
import { Loader2, RefreshCw, Users } from 'lucide-react'

interface ActivityFeedProps {
  userId: string | null
}

export function ActivityFeed({ userId }: ActivityFeedProps) {
  const { feedItems, isLoading, error, refresh, isEmpty } = useCommunityFeed(userId)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin mr-2" />
        Loading feed...
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-destructive mb-4">{error}</p>
        <Button variant="outline" onClick={refresh}>
          <RefreshCw size={16} className="mr-2" />
          Try Again
        </Button>
      </div>
    )
  }

  if (isEmpty) {
    return (
      <div className="text-center py-16 space-y-4">
        <Users className="w-12 h-12 mx-auto text-muted-foreground" />
        <div>
          <p className="text-muted-foreground">Your feed is empty</p>
          <p className="text-sm text-muted-foreground">
            Follow other users to see their activity here
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <Button variant="ghost" size="sm" onClick={refresh}>
          <RefreshCw size={14} className="mr-1" />
          Refresh
        </Button>
      </div>

      <div className="space-y-2">
        {feedItems.map((item) => (
          <ActivityFeedItemCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  )
}
