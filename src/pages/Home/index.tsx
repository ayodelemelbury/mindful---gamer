import { useState, useEffect, useMemo } from "react"
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
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Play, Pause } from "lucide-react"
import { AutoTrackingCard } from "@/components/AutoTrackingCard"
import type { Game } from "../../types"

export function HomePage() {
  const { dailyBudget, weeklyBudget, updateDailyUsage } = useBudgetStore()
  const {
    games,
    recentSessions,
    addSession,
    activeSession,
    startSession,
    stopSession,
    updateLastBudgetMinute,
    getElapsedSeconds,
  } = useSessionStore()
  const { nudge, dismiss } = useNudges()
  const { user } = useAuth()

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
        false,     // skipBudgetUpdate
        note       // session note
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
      ? "You're on track today. Enjoy your gaming!"
      : dailyBudget.current < dailyBudget.limit * 0.8
      ? "Good progress. Consider a short break before your next session."
      : "You're approaching your limit. Time to wrap up soon."

  const displayName = user?.displayName || "Gamer"
  const initials = displayName
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  return (
    <div className="space-y-6">
      <header className="md:flex md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          {/* Mobile user avatar */}
          <Avatar className="w-10 h-10 md:hidden">
            <AvatarImage src={user?.photoURL || undefined} />
            <AvatarFallback className="bg-primary/10 text-primary text-sm">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-semibold text-foreground md:text-3xl">
              <span className="md:hidden">
                Hi, {displayName.split(" ")[0]}!
              </span>
              <span className="hidden md:inline">Today's Balance</span>
            </h1>
            <p className="text-muted-foreground text-sm">
              Play smarter. Play balanced.
            </p>
          </div>
        </div>
        <div className="hidden md:block text-right">
          <p className="text-sm text-muted-foreground">Current Session</p>
          <p className="text-lg font-semibold text-foreground">
            {activeSession.isPlaying
              ? `${formatElapsedTime(elapsedSeconds)} playing ${
                  activeSession.selectedGameName || selectedGame?.name
                }`
              : "Not playing"}
          </p>
        </div>
      </header>

      {/* Desktop: 2-column grid layout */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Left column: Gauge and session controls */}
        <div className="space-y-6">
          <Card className="flex flex-col items-center">
            <CardContent className="pt-6">
              <BalanceGauge
                current={dailyBudget.current}
                limit={dailyBudget.limit}
              />
            </CardContent>
          </Card>

          <div className="space-y-3">
            <GameSelector
              games={games}
              selected={
                activeSession.isPlaying ? selectedGame : pendingSelectedGame
              }
              onSelect={handleGameSelect}
              disabled={activeSession.isPlaying}
            />

            <Button
              onClick={handleToggle}
              disabled={!pendingSelectedGame && !activeSession.isPlaying}
              variant={activeSession.isPlaying ? "destructive" : "default"}
              className="w-full py-6"
              size="lg"
            >
              {activeSession.isPlaying ? (
                <Pause size={20} />
              ) : (
                <Play size={20} />
              )}
              {activeSession.isPlaying
                ? `Stop Session (${formatElapsedTime(elapsedSeconds)})`
                : "Start Session"}
            </Button>
          </div>

          {/* Tip card - visible on mobile, hidden on desktop (shown in right column) */}
          <Card className="md:hidden">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Quick Tip</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{tipMessage}</p>
            </CardContent>
          </Card>
        </div>

        {/* Right column: Budgets and recent sessions */}
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2 gap-3">
            <BudgetCard
              label="Daily Budget"
              current={dailyBudget.current}
              limit={dailyBudget.limit}
            />
            <BudgetCard
              label="Weekly Budget"
              current={weeklyBudget.current}
              limit={weeklyBudget.limit}
            />
          </div>

          <RecentSessions sessions={recentSessions.slice(0, 5)} />

          {/* Auto-detected sessions (Android only) */}
          <AutoTrackingCard />

          {/* Tip card - desktop only */}
          <Card className="hidden md:block bg-primary/10 border-primary/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-primary">
                💡 Quick Tip
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-primary/80">{tipMessage}</p>
            </CardContent>
          </Card>
        </div>
      </div>

      <NudgeToast message={nudge || ""} visible={!!nudge} onDismiss={dismiss} />
      
      {finishedSession && (
        <SessionNoteDialog
          open={showNoteDialog}
          onClose={() => setShowNoteDialog(false)}
          onSave={handleSaveNote}
          gameName={finishedSession.gameName}
          duration={finishedSession.duration}
        />
      )}
    </div>
  )
}
