import { useState, useEffect, useMemo, useCallback } from "react"
import { BalanceGauge } from "../../components/dashboard/BalanceGauge"
import { BudgetCard } from "../../components/budgets/BudgetCard"
import { GameSelector } from "../../components/dashboard/GameSelector"
import { RecentSessions } from "../../components/dashboard/RecentSessions"
import { SessionNoteDialog } from "../../components/dashboard/SessionNoteDialog"
import { NudgeToast } from "../../components/nudges/NudgeToast"
import { useBudgetStore } from "../../store/budgetStore"
import { useSessionStore } from "../../store/sessionStore"
import { useNudges } from "../../hooks/useNudges"
import { useAuth } from "../../hooks/useAuth"
import { useUsageTracking } from "../../hooks/useUsageTracking"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Play, Pause, Sparkles, Trophy, Flame } from "lucide-react"
import { AutoTrackingCard } from "@/components/AutoTrackingCard"
import { UntrackedGameBanner } from "@/components/UntrackedGameBanner"
import type { Game } from "../../types"
import { StreakCard } from "../../components/dashboard/StreakCard"
import { QuickStartBar } from "../../components/dashboard/QuickStartBar"
import { motion } from "framer-motion"

export function HomePage() {
  const { dailyBudget, weeklyBudget, updateDailyUsage } = useBudgetStore()
  const {
    games,
    recentSessions,
    addSession,
    addGame,
    activeSession,
    startSession,
    stopSession,
    updateLastBudgetMinute,
    getElapsedSeconds,
  } = useSessionStore()
  const { nudge, dismiss } = useNudges()
  const { user } = useAuth()
  const { untrackedGames, ignorePackage } = useUsageTracking()

  // Handler for adding a game from the untracked banner
  const handleAddUntrackedGame = useCallback(
    (packageName: string, displayName: string) => {
      // Add the game to library with packageName
      addGame({
        name: displayName,
        packageName,
        category: "Other",
        vibeTags: [],
      })
    },
    [addGame]
  )

  // Local state only for UI display (elapsed seconds updates)
  const [elapsedSeconds, setElapsedSeconds] = useState(() =>
    getElapsedSeconds()
  )

  // Get selected game from store's activeSession
  const selectedGame = useMemo(() => {
    if (activeSession.selectedGameId) {
      return games.find((g) => g.id === activeSession.selectedGameId) || null
    }
    return null
  }, [activeSession.selectedGameId, games])

  // Local state for game selection when not playing
  const [pendingSelectedGame, setPendingSelectedGame] = useState<Game | null>(
    null
  )
  const [showNoteDialog, setShowNoteDialog] = useState(false)
  const [finishedSession, setFinishedSession] = useState<{
    gameName: string
    duration: number
  } | null>(null)

  // Real-time session tracking with live seconds display
  useEffect(() => {
    if (!activeSession.isPlaying) {
      return
    }

    // Update elapsed seconds every second for live display
    const displayInterval = setInterval(() => {
      const elapsed = getElapsedSeconds()
      setElapsedSeconds(elapsed)

      // Update budget usage when a new minute is completed
      const currentMinute = Math.floor(elapsed / 60)
      if (currentMinute > activeSession.lastBudgetMinute) {
        updateDailyUsage(currentMinute - activeSession.lastBudgetMinute)
        updateLastBudgetMinute(currentMinute)
      }
    }, 1000) // Update display every second

    return () => clearInterval(displayInterval)
  }, [
    activeSession.isPlaying,
    activeSession.lastBudgetMinute,
    updateDailyUsage,
    updateLastBudgetMinute,
    getElapsedSeconds,
  ])

  // Format elapsed time as mm:ss
  const formatElapsedTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const handleToggle = () => {
    if (activeSession.isPlaying) {
      // Stop session and open note dialog
      const gameName = activeSession.selectedGameName
      const result = stopSession()

      if (result && result.duration > 0 && gameName) {
        setFinishedSession({
          gameName,
          duration: result.duration,
        })
        setShowNoteDialog(true)
      }
    } else if (pendingSelectedGame) {
      // Start new session with the pending selected game
      startSession(pendingSelectedGame.id, pendingSelectedGame.name)
      setPendingSelectedGame(null)
    }
  }

  const handleSaveNote = (note: string) => {
    if (finishedSession) {
      addSession(
        finishedSession.gameName,
        finishedSession.duration,
        undefined, // packageName (auto-resolved)
        false, // skipBudgetUpdate
        note // session note
      )
    }
    setShowNoteDialog(false)
    setFinishedSession(null)
  }

  // Handle game selection
  const handleGameSelect = (game: Game | null) => {
    if (!activeSession.isPlaying) {
      setPendingSelectedGame(game)
    }
  }

  const tipMessage =
    dailyBudget.current < dailyBudget.limit * 0.5
      ? "You're doing great! Enjoy your gaming session."
      : dailyBudget.current < dailyBudget.limit * 0.8
      ? "Good progress. Stay mindful of your time."
      : "Approaching your daily limit. Time to wind down soon."

  const displayName = user?.displayName || "Gamer"
  const firstName = displayName.split(" ")[0]
  const initials = displayName
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  // Welcome message based on time of day
  const getWelcomeGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return "Good morning"
    if (hour < 18) return "Good afternoon"
    return "Good evening"
  }

  // Responsive gauge size based on screen width
  const [gaugeSize, setGaugeSize] = useState(180)
  const updateGaugeSize = useCallback(() => {
    // Smaller on mobile, larger on desktop
    const width = window.innerWidth
    if (width < 640) setGaugeSize(160)
    else if (width < 1024) setGaugeSize(180)
    else setGaugeSize(200)
  }, [])

  useEffect(() => {
    updateGaugeSize()
    window.addEventListener("resize", updateGaugeSize)
    return () => window.removeEventListener("resize", updateGaugeSize)
  }, [updateGaugeSize])

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6 pb-20"
    >
      {/* Header Section */}
      <motion.header
        variants={itemVariants}
        className="flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <Avatar className="w-12 h-12 border-2 border-primary/10">
            <AvatarImage src={user?.photoURL || undefined} />
            <AvatarFallback className="bg-primary/5 text-primary font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {getWelcomeGreeting()}, {firstName}
            </h1>
            <p className="text-muted-foreground text-sm flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              {tipMessage}
            </p>
          </div>
        </div>
      </motion.header>

      {/* Untracked Game Banner - shows when playing a game not in library */}
      <UntrackedGameBanner
        untrackedGames={untrackedGames}
        onAddGame={handleAddUntrackedGame}
        onDismiss={ignorePackage}
      />

      {/* Active Session Floater (if playing) */}
      {activeSession.isPlaying && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="sticky top-2 z-50 mx-auto w-full max-w-lg"
        >
          <div className="backdrop-blur-xl bg-background/80 border border-primary/20 shadow-lg rounded-full px-6 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse motion-reduce:animate-none" />
                <div className="absolute inset-0 bg-red-500 rounded-full animate-ping opacity-75 motion-reduce:animate-none" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Now Playing
                </span>
                <span className="text-sm font-semibold truncate max-w-[150px]">
                  {activeSession.selectedGameName || selectedGame?.name}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="font-mono font-bold text-lg text-primary tabular-nums">
                {formatElapsedTime(elapsedSeconds)}
              </span>
              <Button
                size="sm"
                variant="destructive"
                className="rounded-full h-8 px-4"
                onClick={handleToggle}
              >
                Stop
              </Button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Main Dashboard Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column: Main Action & Status */}
        <div className="lg:col-span-2 space-y-6">
          {/* Hero / Balance Section */}
          <motion.div variants={itemVariants}>
            <Card className="overflow-hidden border-none shadow-md bg-gradient-to-br from-card to-card/50">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
              <CardContent className="p-6 sm:p-8">
                <div className="flex flex-col md:flex-row md:items-center gap-8">
                  <div className="flex-1 flex justify-center md:justify-start">
                    <BalanceGauge
                      current={dailyBudget.current}
                      limit={dailyBudget.limit}
                      size={gaugeSize}
                    />
                  </div>

                  <div className="flex-1 space-y-6">
                    <div>
                      <h2 className="text-xl font-semibold mb-1">
                        Ready to play?
                      </h2>
                      <p className="text-sm text-muted-foreground mb-4">
                        Select a game to start tracking your session.
                      </p>

                      <div className="space-y-4">
                        <GameSelector
                          games={games}
                          selected={
                            activeSession.isPlaying
                              ? selectedGame
                              : pendingSelectedGame
                          }
                          onSelect={handleGameSelect}
                          disabled={activeSession.isPlaying}
                        />

                        <Button
                          onClick={handleToggle}
                          disabled={
                            !pendingSelectedGame && !activeSession.isPlaying
                          }
                          className={`w-full py-6 text-base font-semibold transition-all duration-300 ${
                            activeSession.isPlaying
                              ? "bg-destructive hover:bg-destructive/90 shadow-red-500/20"
                              : "bg-primary hover:bg-primary/90 shadow-primary/25"
                          } shadow-lg`}
                          size="lg"
                        >
                          {activeSession.isPlaying ? (
                            <>
                              <Pause className="mr-2 h-5 w-5 fill-current" />
                              Pause Session
                            </>
                          ) : (
                            <>
                              <Play className="mr-2 h-5 w-5 fill-current" />
                              Start Session
                            </>
                          )}
                        </Button>
                      </div>
                    </div>

                    <QuickStartBar />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <AutoTrackingCard />
          </motion.div>

          <motion.div variants={itemVariants}>
            <RecentSessions sessions={recentSessions.slice(0, 5)} />
          </motion.div>
        </div>

        {/* Right Column: Stats & Sidebars */}
        <div className="space-y-6 flex flex-col">
          <motion.div variants={itemVariants}>
            <StreakCard />
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="grid grid-cols-2 lg:grid-cols-1 gap-4"
          >
            <BudgetCard
              label="Daily Limit"
              current={dailyBudget.current}
              limit={dailyBudget.limit}
              icon={<Flame className="h-4 w-4 text-orange-500" />}
            />
            <BudgetCard
              label="Weekly Limit"
              current={weeklyBudget.current}
              limit={weeklyBudget.limit}
              icon={<Trophy className="h-4 w-4 text-yellow-500" />}
            />
          </motion.div>

          {/* Quick Tip / Motivation Card */}
          <motion.div variants={itemVariants} className="flex-1 min-h-[100px]">
            <Card className="h-full bg-primary/5 border-primary/10 flex flex-col justify-center">
              <CardContent className="p-6 text-center space-y-2">
                <div className="w-10 h-10 rounded-full bg-background flex items-center justify-center mx-auto shadow-sm mb-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                </div>
                <p className="font-medium text-foreground">
                  {" "}
                  mindful gaming tip
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  "{tipMessage}"
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>

      <NudgeToast message={nudge || ""} visible={!!nudge} onDismiss={dismiss} />

      {finishedSession && (
        <SessionNoteDialog
          open={showNoteDialog}
          onClose={() => {
            // Save session without note if dialog is dismissed
            if (finishedSession) {
              addSession(
                finishedSession.gameName,
                finishedSession.duration,
                undefined,
                false,
                undefined
              )
            }
            setShowNoteDialog(false)
            setFinishedSession(null)
          }}
          onSave={handleSaveNote}
          gameName={finishedSession.gameName}
          duration={finishedSession.duration}
        />
      )}
    </motion.div>
  )
}
