/**
 * StreakCard Component
 *
 * Displays the user's current streak for staying within budget.
 * A streak is maintained when daily usage stays within the daily limit.
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Flame, Trophy, Sparkles } from "lucide-react"
import { useUserStore } from "@/store/userStore"
import { motion } from "framer-motion"

const flameVariants = {
  idle: {
    scale: [1, 1.1, 1],
    rotate: [0, -5, 5, 0],
  },
}

export function StreakCard() {
  const { settings } = useUserStore()
  const { currentStreak, longestStreak } = settings

  // Only show if user has any streak history
  if (currentStreak === 0 && longestStreak === 0) {
    return (
      <Card className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20 border-orange-200 dark:border-orange-900 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-20 h-20 bg-orange-300/20 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm">
            <motion.div
              animate={flameVariants.idle}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <Flame className="h-4 w-4 text-orange-500" />
            </motion.div>
            Balance Streak
          </CardTitle>
        </CardHeader>
        <CardContent>
          <motion.div
            className="flex items-center gap-3"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <motion.div
              className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-200 to-amber-100 dark:from-orange-900/50 dark:to-amber-900/30 flex items-center justify-center"
              whileHover={{ scale: 1.1 }}
              transition={{ type: "spring" as const, stiffness: 400, damping: 25 }}
            >
              <Sparkles className="h-5 w-5 text-orange-400" />
            </motion.div>
            <p className="text-sm text-muted-foreground">
              Stay within your daily budget to start a streak!
            </p>
          </motion.div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20 border-orange-200 dark:border-orange-900 overflow-hidden relative">
      <div className="absolute top-0 right-0 w-24 h-24 bg-orange-300/20 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
      <CardHeader className="pb-2 relative">
        <CardTitle className="flex items-center gap-2 text-sm">
          <motion.div
            animate={flameVariants.idle}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <Flame className="h-4 w-4 text-orange-500" />
          </motion.div>
          Balance Streak
        </CardTitle>
      </CardHeader>
      <CardContent>
        <motion.div
          className="flex items-center justify-between"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex items-center gap-3">
            <motion.div
              className="w-14 h-14 rounded-full bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center shadow-lg shadow-orange-500/20"
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ type: "spring" as const, stiffness: 400, damping: 25 }}
            >
              <motion.span
                className="text-2xl font-bold text-white"
                key={currentStreak}
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring" as const, stiffness: 500, damping: 25 }}
              >
                {currentStreak}
              </motion.span>
            </motion.div>
            <div>
              <p className="text-sm font-medium">
                {currentStreak === 1 ? "day" : "days"}
              </p>
              <p className="text-xs text-muted-foreground">Current streak</p>
            </div>
          </div>
          {longestStreak > 0 && (
            <motion.div
              className="flex items-center gap-2 text-muted-foreground bg-white/50 dark:bg-white/10 px-3 py-1.5 rounded-full"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              whileHover={{ scale: 1.05 }}
            >
              <Trophy className="h-4 w-4 text-amber-500" />
              <span className="text-sm font-medium">Best: {longestStreak}</span>
            </motion.div>
          )}
        </motion.div>
      </CardContent>
    </Card>
  )
}
