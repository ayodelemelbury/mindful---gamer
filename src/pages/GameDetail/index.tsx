/**
 * GameDetail Page
 *
 * Shows detailed stats and session history for a specific game.
 * Allows setting per-game time budgets.
 */

import { useMemo, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useSessionStore } from "../../store/sessionStore"
import { useBudgetStore } from "../../store/budgetStore"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  ArrowLeft,
  Clock,
  Calendar,
  Gamepad2,
  TrendingUp,
  Trophy,
  History,
  Star,
  Sparkles,
  ChevronDown,
  ChevronUp,
} from "lucide-react"
import { formatDuration } from "@/lib/formatDuration"
import { motion, AnimatePresence } from "framer-motion"

type BudgetPeriod = "daily" | "weekly" | "monthly" | "custom"

interface SessionGroup {
  date: string
  sessions: {
    id: string
    duration: number
    createdAt: number
    note?: string
  }[]
  totalDuration: number
}

export function GameDetailPage() {
  const { gameId } = useParams<{ gameId: string }>()
  const navigate = useNavigate()

  const games = useSessionStore((s) => s.games)
  const recentSessions = useSessionStore((s) => s.recentSessions)
  const gameBudgets = useBudgetStore((s) => s.gameBudgets)
  const setGameBudget = useBudgetStore((s) => s.setGameBudget)
  const removeGameBudget = useBudgetStore((s) => s.removeGameBudget)

  const game = games.find((g) => g.id === gameId)
  const existingBudget = gameBudgets?.find((b) => b.gameId === gameId)

  const [budgetEnabled, setBudgetEnabled] = useState(!!existingBudget)
  const [budgetLimit, setBudgetLimit] = useState(existingBudget?.limit ?? 60)
  const [budgetPeriod, setBudgetPeriod] = useState<BudgetPeriod>(
    existingBudget?.period ?? "daily"
  )
  const [customDays, setCustomDays] = useState(existingBudget?.customDays ?? 7)
  const [showBudgetSettings, setShowBudgetSettings] = useState(false)

  // Filter sessions for this game
  const gameSessions = useMemo(() => {
    if (!game) return []
    return recentSessions.filter((s) => s.gameName === game.name)
  }, [recentSessions, game])

  // Group sessions by date
  const groupedSessions = useMemo(() => {
    const groups: Record<string, SessionGroup> = {}

    gameSessions.forEach((session) => {
      const date = new Date(session.createdAt).toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      })

      if (!groups[date]) {
        groups[date] = { date, sessions: [], totalDuration: 0 }
      }

      groups[date].sessions.push({
        id: session.id,
        duration: session.duration,
        createdAt: session.createdAt,
        note: session.note,
      })
      groups[date].totalDuration += session.duration
    })

    return Object.values(groups).sort(
      (a, b) => b.sessions[0].createdAt - a.sessions[0].createdAt
    )
  }, [gameSessions])

  // Calculate stats
  const stats = useMemo(() => {
    if (gameSessions.length === 0) {
      return {
        totalSessions: 0,
        avgSessionLength: 0,
        longestSession: 0,
        lastPlayed: null,
        thisWeek: 0,
        thisMonth: 0,
      }
    }

    const now = Date.now()
    const weekAgo = now - 7 * 24 * 60 * 60 * 1000
    const monthAgo = now - 30 * 24 * 60 * 60 * 1000

    const thisWeekSessions = gameSessions.filter((s) => s.createdAt >= weekAgo)
    const thisMonthSessions = gameSessions.filter(
      (s) => s.createdAt >= monthAgo
    )

    const totalDuration = gameSessions.reduce((sum, s) => sum + s.duration, 0)
    const longestSession = Math.max(...gameSessions.map((s) => s.duration))

    return {
      totalSessions: gameSessions.length,
      avgSessionLength: Math.round(totalDuration / gameSessions.length),
      longestSession,
      lastPlayed: new Date(gameSessions[0].createdAt),
      thisWeek: thisWeekSessions.reduce((sum, s) => sum + s.duration, 0),
      thisMonth: thisMonthSessions.reduce((sum, s) => sum + s.duration, 0),
    }
  }, [gameSessions])

  // Calculate budget usage for current period
  const budgetUsage = useMemo(() => {
    if (!existingBudget || !game) return null

    const now = Date.now()
    let periodStart: number

    switch (existingBudget.period) {
      case "daily":
        periodStart = new Date().setHours(0, 0, 0, 0)
        break
      case "weekly":
        const today = new Date()
        const dayOfWeek = today.getDay()
        periodStart = new Date(
          today.setDate(today.getDate() - dayOfWeek)
        ).setHours(0, 0, 0, 0)
        break
      case "monthly":
        periodStart = new Date(
          new Date().getFullYear(),
          new Date().getMonth(),
          1
        ).getTime()
        break
      case "custom":
        periodStart =
          now - (existingBudget.customDays || 7) * 24 * 60 * 60 * 1000
        break
      default:
        periodStart = new Date().setHours(0, 0, 0, 0)
    }

    const periodSessions = gameSessions.filter(
      (s) => s.createdAt >= periodStart
    )
    const used = periodSessions.reduce((sum, s) => sum + s.duration, 0)

    return {
      used,
      limit: existingBudget.limit,
      percentage: Math.min(
        100,
        Math.round((used / existingBudget.limit) * 100)
      ),
      remaining: Math.max(0, existingBudget.limit - used),
    }
  }, [existingBudget, gameSessions, game])

  const handleSaveBudget = () => {
    if (!gameId || !game) return

    if (budgetEnabled) {
      setGameBudget(gameId, game.name, budgetLimit, budgetPeriod, customDays)
      setShowBudgetSettings(false)
    } else {
      removeGameBudget(gameId)
    }
  }

  const getPeriodLabel = (period: BudgetPeriod, days?: number) => {
    switch (period) {
      case "daily":
        return "per day"
      case "weekly":
        return "per week"
      case "monthly":
        return "per month"
      case "custom":
        return `per ${days} days`
      default:
        return ""
    }
  }

  if (!game) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 animate-in fade-in zoom-in duration-300">
        <Gamepad2 className="h-16 w-16 text-muted-foreground/50 mb-4" />
        <h2 className="text-xl font-semibold mb-2">Game not found</h2>
        <p className="text-muted-foreground mb-6 text-center max-w-xs">
          This game may have been removed or the ID is incorrect.
        </p>
        <Button variant="outline" onClick={() => navigate(-1)}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Go Back
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-background pb-20">
      {/* Hero Header */}
      <div className="relative h-[35vh] min-h-[250px] w-full overflow-hidden">
        {game.backgroundImage ? (
          <motion.img
            initial={{ scale: 1.1, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.7 }}
            src={game.backgroundImage}
            alt={game.name}
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-primary/10 flex items-center justify-center">
            <Gamepad2 className="h-24 w-24 text-primary/20" />
          </div>
        )}

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />

        {/* Navigation & Header Content */}
        <div className="absolute inset-0 flex flex-col justify-between p-4 md:p-6 z-10">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center justify-between"
          >
            <Button
              variant="secondary"
              size="icon"
              className="rounded-full bg-background/50 backdrop-blur-md border border-white/10 hover:bg-background/80 shadow-lg"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>

            {/* Package name pill if needed, or other top-right action */}
            {game.packageName && (
              <Badge
                variant="outline"
                className="bg-background/40 backdrop-blur-md text-xs font-mono border-foreground/20 text-foreground/80"
              >
                {game.packageName.split(".").pop()}
              </Badge>
            )}
          </motion.div>

          {/* Title Area */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-2"
          >
            <h1 className="text-3xl md:text-4xl font-bold text-foreground drop-shadow-sm tracking-tight leading-none">
              {game.name}
            </h1>
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="bg-primary/90 hover:bg-primary shadow-sm">
                {game.category}
              </Badge>
              {game.metacritic && (
                <Badge
                  variant={game.metacritic >= 75 ? "default" : "secondary"}
                  className={`bg-green-500/10 text-green-600 border-green-500/20 hover:bg-green-500/20 ${
                    game.metacritic >= 75
                      ? "bg-green-500 text-white border-none"
                      : ""
                  }`}
                >
                  <Star className="h-3 w-3 mr-1 fill-current" />
                  {game.metacritic}
                </Badge>
              )}
              {game.vibeTags?.slice(0, 3).map((tag) => (
                <Badge
                  key={tag}
                  variant="outline"
                  className="bg-background/40 backdrop-blur-sm"
                >
                  #{tag}
                </Badge>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      <div className="px-4 md:px-6 -mt-6 z-20 space-y-6">
        {/* Main Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4"
        >
          <Card className="bg-card/50 backdrop-blur-sm border-primary/10 shadow-sm overflow-hidden relative group">
            <div className="absolute inset-0 bg-primary/5 group-hover:bg-primary/10 transition-colors" />
            <CardContent className="p-4 relative">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Clock className="h-4 w-4" />
                <span className="text-xs font-medium uppercase tracking-wider">
                  Total Time
                </span>
              </div>
              <p className="text-xl md:text-2xl font-bold text-foreground">
                {formatDuration(game.totalTime)}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur-sm border-white/5 shadow-sm overflow-hidden relative group">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Calendar className="h-4 w-4 text-blue-500" />
                <span className="text-xs font-medium uppercase tracking-wider">
                  This Week
                </span>
              </div>
              <p className="text-xl md:text-2xl font-semibold">
                {formatDuration(stats.thisWeek)}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur-sm border-white/5 shadow-sm overflow-hidden relative group">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <TrendingUp className="h-4 w-4 text-green-500" />
                <span className="text-xs font-medium uppercase tracking-wider">
                  Avg Session
                </span>
              </div>
              <p className="text-xl md:text-2xl font-semibold">
                {formatDuration(stats.avgSessionLength)}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur-sm border-white/5 shadow-sm overflow-hidden relative group">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Gamepad2 className="h-4 w-4 text-purple-500" />
                <span className="text-xs font-medium uppercase tracking-wider">
                  Sessions
                </span>
              </div>
              <p className="text-xl md:text-2xl font-semibold">
                {stats.totalSessions}
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Content Area */}
        <div className="grid md:grid-cols-3 gap-6">
          {/* Main Column */}
          <div className="md:col-span-2 space-y-6">
            {/* Budget Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <Card className="overflow-hidden border-border/50 shadow-sm">
                <CardHeader className="bg-muted/30 pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg text-primary">
                        <Trophy className="h-5 w-5" />
                      </div>
                      <div>
                        <CardTitle className="text-base text-foreground">
                          Playtime Goal
                        </CardTitle>
                        <CardDescription className="text-xs mt-0.5">
                          Manage your screen time
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Label
                        htmlFor="budget-toggle"
                        className="text-xs text-muted-foreground mr-2 hidden sm:block"
                      >
                        {budgetEnabled ? "Active" : "Disabled"}
                      </Label>
                      <Switch
                        id="budget-toggle"
                        checked={budgetEnabled}
                        onCheckedChange={(c) => {
                          setBudgetEnabled(c)
                          if (!c && existingBudget && gameId) {
                            removeGameBudget(gameId)
                          }
                          if (c) {
                            setShowBudgetSettings(true)
                          }
                        }}
                      />
                    </div>
                  </div>
                </CardHeader>

                <AnimatePresence>
                  {budgetEnabled && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <CardContent className="pt-6 space-y-6">
                        {existingBudget && (
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm font-medium">
                              <span>
                                {formatDuration(budgetUsage?.used || 0)} used
                              </span>
                              <span
                                className={
                                  (budgetUsage?.percentage || 0) >= 100
                                    ? "text-destructive"
                                    : "text-muted-foreground"
                                }
                              >
                                {formatDuration(budgetUsage?.limit || 0)} limit
                              </span>
                            </div>
                            <div className="relative h-3 w-full bg-secondary overflow-hidden rounded-full">
                              <motion.div
                                className={`absolute left-0 top-0 h-full rounded-full ${
                                  (budgetUsage?.percentage || 0) >= 100
                                    ? "bg-destructive"
                                    : (budgetUsage?.percentage || 0) >= 80
                                    ? "bg-amber-500"
                                    : "bg-primary"
                                }`}
                                initial={{ width: 0 }}
                                animate={{
                                  width: `${Math.min(
                                    100,
                                    budgetUsage?.percentage || 0
                                  )}%`,
                                }}
                                transition={{ duration: 1, ease: "easeOut" }}
                              />
                            </div>
                            <p className="text-xs text-muted-foreground text-center">
                              {budgetUsage && budgetUsage.remaining > 0
                                ? `${formatDuration(
                                    budgetUsage.remaining
                                  )} remaining ${getPeriodLabel(
                                    existingBudget.period,
                                    existingBudget.customDays
                                  )}`
                                : "Limit exceeded for this period"}
                            </p>
                          </div>
                        )}

                        {/* Settings Toggle Button if budget is set but settings hidden */}
                        {existingBudget && !showBudgetSettings && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="w-full text-xs h-8"
                            onClick={() => setShowBudgetSettings(true)}
                          >
                            Adjust Goal Settings{" "}
                            <ChevronDown className="ml-1 h-3 w-3" />
                          </Button>
                        )}

                        {/* Editable Settings */}
                        {(showBudgetSettings || !existingBudget) && (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="space-y-4 pt-4 border-t border-border/50"
                          >
                            <div className="space-y-3">
                              <div className="flex justify-between items-center">
                                <Label className="text-sm">Time Limit</Label>
                                <span className="text-sm font-mono bg-secondary px-2 py-0.5 rounded text-secondary-foreground">
                                  {formatDuration(budgetLimit)}
                                </span>
                              </div>
                              <Slider
                                value={[budgetLimit]}
                                onValueChange={([value]) =>
                                  setBudgetLimit(value)
                                }
                                min={15}
                                max={480}
                                step={15}
                                className="py-2"
                              />
                            </div>

                            <div className="space-y-2">
                              <Label className="text-sm">Period</Label>
                              <Select
                                value={budgetPeriod}
                                onValueChange={(value) =>
                                  setBudgetPeriod(value as BudgetPeriod)
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="daily">Daily</SelectItem>
                                  <SelectItem value="weekly">Weekly</SelectItem>
                                  <SelectItem value="monthly">
                                    Monthly
                                  </SelectItem>
                                  <SelectItem value="custom">
                                    Custom Period
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            {budgetPeriod === "custom" && (
                              <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                  <Label className="text-sm">Days</Label>
                                  <span className="text-sm font-mono">
                                    {customDays} days
                                  </span>
                                </div>
                                <Slider
                                  value={[customDays]}
                                  onValueChange={([value]) =>
                                    setCustomDays(value)
                                  }
                                  min={1}
                                  max={30}
                                  step={1}
                                />
                              </div>
                            )}

                            <div className="flex gap-2 pt-2">
                              <Button
                                className="flex-1"
                                onClick={handleSaveBudget}
                              >
                                Save Goal
                              </Button>
                              {existingBudget && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => setShowBudgetSettings(false)}
                                >
                                  <ChevronUp className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </CardContent>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>
            </motion.div>

            {/* Session History Timeline */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              <div className="flex items-center gap-2 mb-4">
                <History className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold">Session History</h3>
              </div>

              {groupedSessions.length === 0 ? (
                <Card className="py-12 flex flex-col items-center justify-center text-center">
                  <Clock className="h-10 w-10 text-muted-foreground/30 mb-3" />
                  <p className="text-muted-foreground font-medium">
                    No sessions recorded yet
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Play the game to see your history here.
                  </p>
                </Card>
              ) : (
                <div className="space-y-6 pl-2">
                  {groupedSessions.map((group) => (
                    <div
                      key={group.date}
                      className="relative pl-6 border-l border-border/60 last:border-0 pb-2"
                    >
                      {/* Timeline Dot */}
                      <div className="absolute left-[-5px] top-0 h-2.5 w-2.5 rounded-full bg-primary ring-4 ring-background" />

                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-semibold text-foreground">
                          {group.date}
                        </span>
                        <Badge
                          variant="secondary"
                          className="text-[10px] h-5 px-1.5"
                        >
                          {formatDuration(group.totalDuration)}
                        </Badge>
                      </div>

                      <div className="space-y-2">
                        {group.sessions.map((session) => (
                          <Card
                            key={session.id}
                            className="bg-card/40 hover:bg-card/80 transition-colors border-0 shadow-sm ring-1 ring-inset ring-border/50"
                          >
                            <CardContent className="p-3 flex items-center justify-between">
                              <div className="flex flex-col">
                                <span className="text-xs text-muted-foreground font-medium">
                                  {new Date(
                                    session.createdAt
                                  ).toLocaleTimeString("en-US", {
                                    hour: "numeric",
                                    minute: "2-digit",
                                  })}
                                </span>
                                {session.note && (
                                  <span className="text-xs text-foreground/80 mt-0.5 line-clamp-1 italic">
                                    "{session.note}"
                                  </span>
                                )}
                              </div>
                              <span className="text-sm font-mono font-medium text-primary">
                                {formatDuration(session.duration)}
                              </span>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </div>

          {/* Right Column: Game Info & Extra Stats */}
          <motion.div
            className="space-y-6"
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                  Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {game.genres && game.genres.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold mb-2">Genres</p>
                    <div className="flex flex-wrap gap-1.5">
                      {game.genres.map((genre) => (
                        <Badge
                          key={genre}
                          variant="secondary"
                          className="text-xs font-normal"
                        >
                          {genre}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                <Separator />
                {game.platforms && game.platforms.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold mb-2">Platforms</p>
                    <p className="text-sm text-muted-foreground">
                      {game.platforms.join(", ")}
                    </p>
                  </div>
                )}
                {game.packageName && (
                  <>
                    <Separator />
                    <div>
                      <p className="text-xs font-semibold mb-1">Package Name</p>
                      <p className="text-xs font-mono text-muted-foreground break-all">
                        {game.packageName}
                      </p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Placeholder for future "Achievements" or "Insights" */}
            <Card className="bg-gradient-to-br from-primary/5 to-transparent border-primary/10">
              <CardContent className="p-4 text-center">
                <Sparkles className="h-8 w-8 text-primary mx-auto mb-2 opacity-50" />
                <h4 className="font-semibold text-sm">Keep it up!</h4>
                <p className="text-xs text-muted-foreground mt-1">
                  You're tracking this game consistently. Great job!
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
