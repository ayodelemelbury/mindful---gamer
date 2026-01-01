/**
 * StreakCard Component
 *
 * Displays the user's current streak for staying within budget.
 * A streak is maintained when daily usage stays within the daily limit.
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Flame, Trophy } from "lucide-react"
import { useUserStore } from "@/store/userStore"

export function StreakCard() {
  const { settings } = useUserStore()
  const { currentStreak, longestStreak } = settings

  // Only show if user has any streak history
  if (currentStreak === 0 && longestStreak === 0) {
    return (
      <Card className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20 border-orange-200 dark:border-orange-900">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Flame className="h-4 w-4 text-orange-500" />
            Balance Streak
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Stay within your daily budget to start a streak!
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20 border-orange-200 dark:border-orange-900">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm">
          <Flame className="h-4 w-4 text-orange-500" />
          Balance Streak
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center">
              <span className="text-xl font-bold text-white">{currentStreak}</span>
            </div>
            <div>
              <p className="text-sm font-medium">
                {currentStreak === 1 ? "day" : "days"}
              </p>
              <p className="text-xs text-muted-foreground">Current streak</p>
            </div>
          </div>
          {longestStreak > 0 && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Trophy className="h-4 w-4" />
              <span className="text-sm">Best: {longestStreak}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
