import { formatDistanceToNow } from '../../lib/utils'
import type { ActivityFeedItem } from '../../types'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Heart, MessageCircle, UserPlus, Star } from 'lucide-react'
import { Link } from 'react-router-dom'

interface ActivityFeedItemProps {
  item: ActivityFeedItem
}

const ACTIVITY_ICONS = {
  new_review: Star,
  new_follower: UserPlus,
  comment: MessageCircle,
  like: Heart,
}

const ACTIVITY_COLORS = {
  new_review: 'text-primary',
  new_follower: 'text-blue-500',
  comment: 'text-green-500',
  like: 'text-rose-500',
}

export function ActivityFeedItemCard({ item }: ActivityFeedItemProps) {
  const Icon = ACTIVITY_ICONS[item.type]
  const colorClass = ACTIVITY_COLORS[item.type]

  const getActivityText = () => {
    switch (item.type) {
      case 'new_review':
        return item.preview || 'shared a review'
      case 'new_follower':
        return 'started following you'
      case 'comment':
        return 'commented on a review'
      case 'like':
        return 'liked a review'
      default:
        return 'did something'
    }
  }

  return (
    <Card className="hover:bg-muted/50 transition-colors">
      <CardContent className="py-3 flex items-center gap-3">
        <Link to={`/profile/${item.actorId}`}>
          <Avatar className="h-10 w-10">
            <AvatarImage src={item.actorAvatar || undefined} />
            <AvatarFallback>
              {item.actorName.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </Link>

        <div className="flex-1 min-w-0">
          <p className="text-sm">
            <Link
              to={`/profile/${item.actorId}`}
              className="font-medium hover:underline"
            >
              {item.actorName}
            </Link>
            {' '}
            <span className="text-muted-foreground">{getActivityText()}</span>
          </p>
          <p className="text-xs text-muted-foreground">
            {formatDistanceToNow(item.createdAt)}
          </p>
        </div>

        <div className={`p-2 rounded-full bg-muted ${colorClass}`}>
          <Icon size={16} />
        </div>
      </CardContent>
    </Card>
  )
}
