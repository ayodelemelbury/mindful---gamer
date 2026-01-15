import { Clock, Gamepad2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatTimeAgo } from "@/lib/utils"
import { formatDuration } from "@/lib/formatDuration"
import { motion } from 'framer-motion'

interface RecentSession {
  id: string
  gameName: string
  duration: number
  createdAt: number // Unix timestamp in milliseconds
  note?: string
}

interface RecentSessionsProps {
  sessions: RecentSession[]
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, x: -10 },
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

export function RecentSessions({ sessions }: RecentSessionsProps) {
  if (sessions.length === 0) {
    return (
      <Card className="overflow-hidden">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Clock size={16} className="text-primary" />
            Recent Sessions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <motion.div
            className="flex flex-col items-center py-8 text-center"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <motion.div
              className="w-16 h-16 rounded-2xl bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center mb-4"
              animate={{
                y: [0, -6, 0],
              }}
              transition={{
                repeat: Infinity,
                duration: 3,
                ease: "easeInOut",
              }}
            >
              <Gamepad2 size={28} className="text-muted-foreground/50" />
            </motion.div>
            <p className="text-sm font-medium text-foreground mb-1">
              No sessions yet
            </p>
            <p className="text-xs text-muted-foreground">
              Start a session to track your gaming
            </p>
          </motion.div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="overflow-hidden relative">
      <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
      <CardHeader className="pb-2 relative">
        <CardTitle className="text-sm flex items-center gap-2">
          <Clock size={16} className="text-primary" />
          Recent Sessions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <motion.div
          className="space-y-1"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {sessions.map((session, index) => (
            <motion.div
              key={session.id}
              variants={itemVariants}
              className="group"
            >
              <motion.div
                className="flex items-center justify-between py-3 px-3 -mx-3 rounded-xl transition-colors hover:bg-primary/5 cursor-default"
                whileHover={{ x: 4 }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <motion.div
                    className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center flex-shrink-0"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  >
                    <Gamepad2 size={18} className="text-primary" />
                  </motion.div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors">
                      {session.gameName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatTimeAgo(session.createdAt)}
                    </p>
                    {session.note && (
                      <motion.p
                        className="text-xs text-muted-foreground/70 italic mt-0.5 line-clamp-1"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                      >
                        "{session.note}"
                      </motion.p>
                    )}
                  </div>
                </div>
                <motion.div
                  className="flex items-center gap-2 flex-shrink-0"
                  whileHover={{ scale: 1.05 }}
                >
                  <div className="text-right">
                    <span className="text-sm font-medium text-foreground tabular-nums">
                      {formatDuration(session.duration)}
                    </span>
                  </div>
                </motion.div>
              </motion.div>
              {index < sessions.length - 1 && (
                <div className="border-b border-border/50 mx-3" />
              )}
            </motion.div>
          ))}
        </motion.div>
      </CardContent>
    </Card>
  )
}
