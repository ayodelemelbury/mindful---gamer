import { useState, useEffect } from 'react'
import { useCommunityFeed } from '../../hooks/useCommunityFeed'
import { ActivityFeedItemCard } from './ActivityFeedItem'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Loader2, RefreshCw, Users, UserPlus, Sparkles } from 'lucide-react'
import { getSuggestedUsers, followUser } from '../../lib/profileService'
import type { UserProfile } from '../../types'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'

interface ActivityFeedProps {
  userId: string | null
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring" as const,
      stiffness: 400,
      damping: 30,
    }
  },
}

const userCardVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      type: "spring" as const,
      stiffness: 400,
      damping: 30,
    }
  },
}

export function ActivityFeed({ userId }: ActivityFeedProps) {
  const { feedItems, isLoading, error, refresh, isEmpty } = useCommunityFeed(userId)
  const [suggested, setSuggested] = useState<UserProfile[]>([])
  const [loadingSuggested, setLoadingSuggested] = useState(false)
  const [followingIds, setFollowingIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (isEmpty && userId) {
      setLoadingSuggested(true)
      getSuggestedUsers(userId, 5)
        .then(setSuggested)
        .finally(() => setLoadingSuggested(false))
    }
  }, [isEmpty, userId])

  const handleFollow = async (targetId: string) => {
    if (!userId) return
    setFollowingIds((prev) => new Set(prev).add(targetId))
    try {
      await followUser(userId, targetId)
    } catch {
      setFollowingIds((prev) => {
        const next = new Set(prev)
        next.delete(targetId)
        return next
      })
    }
  }

  if (isLoading) {
    return (
      <motion.div
        className="flex flex-col items-center justify-center py-16 text-muted-foreground"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
        >
          <Loader2 className="h-8 w-8 mb-4" />
        </motion.div>
        <p className="text-sm">Loading feed...</p>
      </motion.div>
    )
  }

  if (error) {
    return (
      <motion.div
        className="text-center py-12"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <Card className="border-dashed max-w-md mx-auto">
          <CardContent className="py-8">
            <p className="text-destructive mb-4">{error}</p>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button variant="outline" onClick={refresh}>
                <RefreshCw size={16} className="mr-2" />
                Try Again
              </Button>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  if (isEmpty) {
    return (
      <motion.div
        className="text-center py-12 space-y-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <motion.div
          className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center"
          animate={{
            y: [0, -8, 0],
          }}
          transition={{
            repeat: Infinity,
            duration: 3,
            ease: "easeInOut",
          }}
        >
          <Users className="w-10 h-10 text-muted-foreground/50" />
        </motion.div>
        <div>
          <p className="text-lg font-medium text-foreground mb-1">Your feed is empty</p>
          <p className="text-sm text-muted-foreground">
            Follow other users to see their activity here
          </p>
        </div>

        {loadingSuggested && (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          >
            <Loader2 className="h-6 w-6 mx-auto text-muted-foreground" />
          </motion.div>
        )}

        <AnimatePresence>
          {suggested.length > 0 && (
            <motion.div
              className="space-y-3 max-w-sm mx-auto"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              <motion.p
                className="text-sm font-medium flex items-center justify-center gap-2"
                variants={itemVariants}
              >
                <Sparkles className="h-4 w-4 text-amber-500" />
                Suggested users
              </motion.p>
              {suggested.map((user, index) => (
                <motion.div
                  key={user.id}
                  variants={userCardVariants}
                  custom={index}
                  whileHover={{ scale: 1.02, x: 4 }}
                  transition={{ type: "spring" as const, stiffness: 400, damping: 25 }}
                >
                  <Card className="overflow-hidden">
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between">
                        <Link to={`/profile/${user.id}`} className="flex items-center gap-3 group">
                          <motion.div whileHover={{ scale: 1.1 }}>
                            <Avatar className="h-10 w-10 ring-2 ring-primary/10">
                              <AvatarImage src={user.avatarUrl || undefined} />
                              <AvatarFallback className="bg-primary/10 text-primary">
                                {user.displayName.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                          </motion.div>
                          <div className="text-left">
                            <p className="text-sm font-medium group-hover:text-primary transition-colors">
                              {user.displayName}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {user.reviewCount} reviews
                            </p>
                          </div>
                        </Link>
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                          <Button
                            size="sm"
                            variant={followingIds.has(user.id) ? 'secondary' : 'default'}
                            onClick={() => handleFollow(user.id)}
                            disabled={followingIds.has(user.id)}
                            className="gap-1"
                          >
                            {followingIds.has(user.id) ? (
                              'Following'
                            ) : (
                              <>
                                <UserPlus size={14} />
                                Follow
                              </>
                            )}
                          </Button>
                        </motion.div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    )
  }

  return (
    <motion.div
      className="space-y-3"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div className="flex justify-end" variants={itemVariants}>
        <motion.div whileHover={{ rotate: 180 }} transition={{ duration: 0.3 }}>
          <Button variant="ghost" size="sm" onClick={refresh} className="gap-1">
            <RefreshCw size={14} />
            Refresh
          </Button>
        </motion.div>
      </motion.div>

      <motion.div className="space-y-2" variants={containerVariants}>
        <AnimatePresence>
          {feedItems.map((item, index) => (
            <motion.div
              key={item.id}
              variants={itemVariants}
              custom={index}
              layout
              whileHover={{ scale: 1.01, x: 4 }}
              transition={{ type: "spring" as const, stiffness: 400, damping: 30 }}
            >
              <ActivityFeedItemCard item={item} />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  )
}
