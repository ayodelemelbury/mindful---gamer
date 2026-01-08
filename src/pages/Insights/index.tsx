import { useState, useMemo } from "react"
import { TimeByGameChart } from "../../components/charts/TimeByGameChart"
import { CategoryBreakdownChart } from "../../components/charts/CategoryBreakdownChart"
import { WeeklyTrendChart } from "../../components/charts/WeeklyTrendChart"
import { TimeOfDayChart } from "../../components/charts/TimeOfDayChart"
import { SessionDurationChart } from "../../components/charts/SessionDurationChart"
import { useSessionStore } from "../../store/sessionStore"
import { useBudgetStore } from "../../store/budgetStore"
import { formatDuration } from "@/lib/formatDuration"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Clock, Target, Gamepad2, Trophy, Timer, BarChart3, Sparkles } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import {
  PeriodSelector,
  type TimePeriod,
} from "@/components/insights/PeriodSelector"
import { ComparisonBadge } from "@/components/insights/ComparisonBadge"

const TABS = ["Overview", "Trends"] as const
type Tab = (typeof TABS)[number]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.1,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
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

const cardHoverVariants = {
  rest: { scale: 1, y: 0 },
  hover: {
    scale: 1.02,
    y: -4,
    transition: {
      type: "spring" as const,
      stiffness: 400,
      damping: 25,
    }
  },
}

const tabContentVariants = {
  hidden: { opacity: 0, x: 20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      type: "spring" as const,
      stiffness: 300,
      damping: 30,
    }
  },
  exit: {
    opacity: 0,
    x: -20,
    transition: {
      duration: 0.15
    }
  }
}

interface StatCardProps {
  icon: React.ReactNode
  iconBg: string
  label: string
  value: string
  comparison?: React.ReactNode
  delay?: number
}

function StatCard({ icon, iconBg, label, value, comparison }: StatCardProps) {
  return (
    <motion.div
      variants={cardHoverVariants}
      initial="rest"
      whileHover="hover"
      whileTap={{ scale: 0.98 }}
    >
      <Card className="overflow-hidden relative cursor-default group">
        <div className={`absolute top-0 right-0 w-20 h-20 ${iconBg} rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 pointer-events-none opacity-50 group-hover:opacity-100 transition-opacity`} />
        <CardContent className="pt-4 relative">
          <div className="flex items-center gap-3">
            <motion.div
              className={`w-10 h-10 rounded-lg ${iconBg} flex items-center justify-center`}
              whileHover={{ rotate: [0, -10, 10, 0] }}
              transition={{ duration: 0.5 }}
            >
              {icon}
            </motion.div>
            <div className="min-w-0 flex-1">
              <p className="text-xs text-muted-foreground truncate">{label}</p>
              <div className="flex items-center gap-2">
                <p className="text-lg font-semibold text-foreground">
                  {value}
                </p>
                {comparison}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

export function InsightsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("Overview")
  const [timePeriod, setTimePeriod] = useState<TimePeriod>("this-week")

  const games = useSessionStore((s) => s.games)
  const recentSessions = useSessionStore((s) => s.recentSessions)
  const { weeklyBudget } = useBudgetStore()

  // --- Date Range Logic ---
  const { currentSessions, previousSessions } = useMemo(() => {
    const now = new Date()
    let startCurrent = new Date()
    let endCurrent = new Date()
    let startPrev = new Date()
    let endPrev = new Date()

    // Reset times to midnight
    const setMidnight = (d: Date) => d.setHours(0, 0, 0, 0)

    if (timePeriod === "this-week") {
      // Monday based week
      const day = now.getDay() || 7
      if (day !== 1) startCurrent.setHours(-24 * (day - 1))
      else startCurrent = now

      startPrev = new Date(startCurrent)
      startPrev.setDate(startPrev.getDate() - 7)
      endPrev = new Date(startCurrent)
    } else if (timePeriod === "last-week") {
      const day = now.getDay() || 7
      startCurrent.setDate(now.getDate() - day - 6)
      endCurrent.setDate(now.getDate() - day + 1)

      startPrev = new Date(startCurrent)
      startPrev.setDate(startPrev.getDate() - 7)
      endPrev = new Date(startCurrent)
    } else if (timePeriod === "this-month") {
      startCurrent.setDate(1)

      startPrev = new Date(startCurrent)
      startPrev.setMonth(startPrev.getMonth() - 1)
      endPrev = new Date(startCurrent)
    }

    setMidnight(startCurrent)
    setMidnight(startPrev)
    setMidnight(endPrev) // end is usually exclusive or next period start, simplified here

    const filterSessions = (start: Date, end: Date | null = null) => {
      return recentSessions.filter((s) => {
        const date = new Date(s.createdAt)
        return date >= start && (!end || date < end)
      })
    }
    // Simplification for "This" periods: end is Now.
    // For "Last" periods: end is fixed.

    return {
      currentSessions: filterSessions(
        startCurrent,
        timePeriod.startsWith("last") ? endCurrent : null
      ),
      previousSessions: filterSessions(startPrev, endPrev),
    }
  }, [timePeriod, recentSessions])

  // --- Metrics Calculation ---
  const currentTotalTime = currentSessions.reduce(
    (acc, s) => acc + s.duration,
    0
  )
  const previousTotalTime = previousSessions.reduce(
    (acc, s) => acc + s.duration,
    0
  )

  const currentAvgSession =
    currentSessions.length > 0
      ? Math.round(currentTotalTime / currentSessions.length)
      : 0
  const previousAvgSession =
    previousSessions.length > 0
      ? Math.round(previousTotalTime / previousSessions.length)
      : 0

  const activeGameIds = new Set(currentSessions.map((s) => s.gameName)) // Using name as ID proxy effectively for now
  const activeGamesCount = activeGameIds.size

  const budgetPercent =
    weeklyBudget.limit > 0
      ? Math.round((weeklyBudget.current / weeklyBudget.limit) * 100)
      : 0

  const mostPlayedGame =
    games.length > 0
      ? games.reduce((a, b) => (a.totalTime > b.totalTime ? a : b))
      : null

  const totalPlaytime = games.reduce((sum, g) => sum + g.totalTime, 0)

  return (
    <motion.div
      className="space-y-6 pb-20"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.header
        variants={itemVariants}
        className="md:flex md:items-center md:justify-between relative"
      >
        <div className="absolute -top-4 -left-4 w-24 h-24 bg-chart-2/10 rounded-full blur-2xl pointer-events-none" />
        <div className="relative flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-chart-2 to-chart-2/60 flex items-center justify-center shadow-lg shadow-chart-2/20">
            <BarChart3 className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground md:text-3xl">
              Insights
            </h1>
            <p className="text-muted-foreground text-sm flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              Reflect on your gaming habits
            </p>
          </div>
        </div>
        <motion.div
          className="mt-4 md:mt-0"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <PeriodSelector value={timePeriod} onChange={setTimePeriod} />
        </motion.div>
      </motion.header>

      {/* Stats cards */}
      <motion.div
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
        variants={containerVariants}
      >
        <motion.div variants={itemVariants}>
          <StatCard
            icon={<Clock size={20} className="text-primary" />}
            iconBg="bg-primary/20"
            label="Total Time"
            value={currentTotalTime > 0 ? formatDuration(currentTotalTime) : "0m"}
            comparison={
              <ComparisonBadge
                current={currentTotalTime}
                previous={previousTotalTime}
                inverse
              />
            }
          />
        </motion.div>

        <motion.div variants={itemVariants}>
          <StatCard
            icon={<Timer size={20} className="text-chart-2" />}
            iconBg="bg-chart-2/20"
            label="Avg Session"
            value={currentAvgSession > 0 ? formatDuration(currentAvgSession) : "--"}
            comparison={
              <ComparisonBadge
                current={currentAvgSession}
                previous={previousAvgSession}
                inverse
              />
            }
          />
        </motion.div>

        <motion.div variants={itemVariants}>
          <StatCard
            icon={<Target size={20} className="text-chart-4" />}
            iconBg="bg-chart-4/20"
            label="Weekly Budget"
            value={`${budgetPercent}%`}
          />
        </motion.div>

        <motion.div variants={itemVariants}>
          <StatCard
            icon={<Gamepad2 size={20} className="text-chart-5" />}
            iconBg="bg-chart-5/20"
            label="Games Played"
            value={`${activeGamesCount}`}
          />
        </motion.div>
      </motion.div>

      {/* Most Played Highlight */}
      {mostPlayedGame && mostPlayedGame.totalTime > 0 && (
        <motion.div variants={itemVariants}>
          <motion.div
            variants={cardHoverVariants}
            initial="rest"
            whileHover="hover"
          >
            <Card className="bg-gradient-to-r from-primary/5 via-primary/10 to-transparent border-primary/20 overflow-hidden relative">
              <div className="absolute top-0 right-0 w-40 h-40 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none" />
              <CardContent className="pt-4 relative">
                <div className="flex items-center gap-4">
                  <motion.div
                    className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center"
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.6, ease: "easeInOut" }}
                  >
                    <Trophy size={24} className="text-primary" />
                  </motion.div>
                  {mostPlayedGame.backgroundImage ? (
                    <img
                      src={mostPlayedGame.backgroundImage}
                      alt=""
                      className="w-16 h-12 object-cover rounded-lg shadow-md"
                    />
                  ) : null}
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-amber-500" />
                      Most Played (All Time)
                    </p>
                    <p className="font-semibold text-foreground text-lg">
                      {mostPlayedGame.name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {formatDuration(mostPlayedGame.totalTime)} total
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      )}

      {/* Tabs */}
      <motion.div variants={itemVariants} className="flex gap-2">
        {TABS.map((tab) => (
          <motion.div key={tab} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              onClick={() => setActiveTab(tab)}
              variant={activeTab === tab ? "default" : "secondary"}
              size="sm"
              className="relative overflow-hidden"
            >
              {activeTab === tab && (
                <motion.div
                  className="absolute inset-0 bg-primary"
                  layoutId="activeTab"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <span className="relative z-10">{tab}</span>
            </Button>
          </motion.div>
        ))}
      </motion.div>

      {/* Charts */}
      <AnimatePresence mode="wait">
        {activeTab === "Overview" && (
          <motion.div
            key="overview"
            variants={tabContentVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="space-y-6"
          >
            <div className="grid md:grid-cols-2 gap-6">
              {games.length > 0 && totalPlaytime > 0 ? (
                <>
                  <motion.div
                    variants={cardHoverVariants}
                    initial="rest"
                    whileHover="hover"
                  >
                    <TimeByGameChart />
                  </motion.div>
                  <motion.div
                    variants={cardHoverVariants}
                    initial="rest"
                    whileHover="hover"
                  >
                    <CategoryBreakdownChart />
                  </motion.div>
                </>
              ) : (
                <motion.div
                  className="md:col-span-2"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <Card className="border-dashed">
                    <CardContent className="py-16 text-center">
                      <motion.div
                        className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center"
                        animate={{
                          y: [0, -8, 0],
                        }}
                        transition={{
                          repeat: Infinity,
                          duration: 3,
                          ease: "easeInOut",
                        }}
                      >
                        <Gamepad2 size={40} className="text-muted-foreground/50" />
                      </motion.div>
                      <p className="text-lg font-medium text-foreground mb-2">
                        {games.length === 0 ? "No games yet" : "Start tracking"}
                      </p>
                      <p className="text-muted-foreground text-sm max-w-sm mx-auto">
                        {games.length === 0
                          ? "Add games and track sessions to see your insights come to life."
                          : "Log some gaming sessions to see your breakdown."}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </div>

            {/* Detailed Analytics Row */}
            {recentSessions.length > 0 && (
              <div className="grid md:grid-cols-2 gap-6">
                <motion.div
                  variants={cardHoverVariants}
                  initial="rest"
                  whileHover="hover"
                >
                  <TimeOfDayChart />
                </motion.div>
                <motion.div
                  variants={cardHoverVariants}
                  initial="rest"
                  whileHover="hover"
                >
                  <SessionDurationChart />
                </motion.div>
              </div>
            )}
          </motion.div>
        )}

        {activeTab === "Trends" && (
          <motion.div
            key="trends"
            variants={tabContentVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <motion.div
              variants={cardHoverVariants}
              initial="rest"
              whileHover="hover"
            >
              <WeeklyTrendChart />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
