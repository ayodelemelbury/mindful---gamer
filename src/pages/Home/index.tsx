import { useState, useEffect, useRef } from 'react'
import { BalanceGauge } from '../../components/dashboard/BalanceGauge'
import { BudgetCard } from '../../components/budgets/BudgetCard'
import { GameSelector } from '../../components/dashboard/GameSelector'
import { RecentSessions } from '../../components/dashboard/RecentSessions'
import { NudgeToast } from '../../components/nudges/NudgeToast'
import { useBudgetStore } from '../../store/budgetStore'
import { useSessionStore } from '../../store/sessionStore'
import { useNudges } from '../../hooks/useNudges'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Play, Pause } from 'lucide-react'
import type { Game } from '../../types'

export function HomePage() {
  const { dailyBudget, weeklyBudget, updateDailyUsage } = useBudgetStore()
  const { games, recentSessions, addSession } = useSessionStore()
  const { nudge, dismiss } = useNudges()
  const [isPlaying, setIsPlaying] = useState(false)
  const [selectedGame, setSelectedGame] = useState<Game | null>(null)
  const [elapsedSeconds, setElapsedSeconds] = useState(0) // Track elapsed time in seconds
  const sessionStartRef = useRef<number | null>(null) // Track when session started
  const lastMinuteRef = useRef(0) // Track last minute we updated budget for

  // Real-time session tracking with live seconds display
  useEffect(() => {
    if (!isPlaying) return

    // Update elapsed seconds every second for live display
    const displayInterval = setInterval(() => {
      if (sessionStartRef.current) {
        const elapsed = Math.floor((Date.now() - sessionStartRef.current) / 1000)
        setElapsedSeconds(elapsed)
        
        // Update budget usage when a new minute is completed
        const currentMinute = Math.floor(elapsed / 60)
        if (currentMinute > lastMinuteRef.current) {
          updateDailyUsage(currentMinute - lastMinuteRef.current)
          lastMinuteRef.current = currentMinute
        }
      }
    }, 1000) // Update display every second

    return () => clearInterval(displayInterval)
  }, [isPlaying, updateDailyUsage])

  // Format elapsed time as mm:ss
  const formatElapsedTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleToggle = () => {
    if (isPlaying && selectedGame && elapsedSeconds > 0) {
      // Store session with duration in minutes (rounded up to nearest minute)
      const durationMinutes = Math.ceil(elapsedSeconds / 60)
      addSession(selectedGame.name, durationMinutes)
    }
    if (isPlaying) {
      // Reset timer refs when stopping
      sessionStartRef.current = null
      lastMinuteRef.current = 0
      setElapsedSeconds(0)
    } else {
      // Start new session
      sessionStartRef.current = Date.now()
      lastMinuteRef.current = 0
      setElapsedSeconds(0)
    }
    setIsPlaying(!isPlaying)
  }

  const tipMessage = dailyBudget.current < dailyBudget.limit * 0.5
    ? "You're on track today. Enjoy your gaming!"
    : dailyBudget.current < dailyBudget.limit * 0.8
    ? "Good progress. Consider a short break before your next session."
    : "You're approaching your limit. Time to wrap up soon."

  return (
    <div className="space-y-6">
      <header className="md:flex md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground md:text-3xl">Today's Balance</h1>
          <p className="text-muted-foreground text-sm">Play smarter. Play balanced.</p>
        </div>
        <div className="hidden md:block text-right">
          <p className="text-sm text-muted-foreground">Current Session</p>
          <p className="text-lg font-semibold text-foreground">
            {isPlaying ? `${formatElapsedTime(elapsedSeconds)} playing ${selectedGame?.name}` : 'Not playing'}
          </p>
        </div>
      </header>

      {/* Desktop: 2-column grid layout */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Left column: Gauge and session controls */}
        <div className="space-y-6">
          <Card className="flex flex-col items-center">
            <CardContent className="pt-6">
              <BalanceGauge current={dailyBudget.current} limit={dailyBudget.limit} />
            </CardContent>
          </Card>

          <div className="space-y-3">
            <GameSelector games={games} selected={selectedGame} onSelect={setSelectedGame} />
            
            <Button
              onClick={handleToggle}
              disabled={!selectedGame && !isPlaying}
              variant={isPlaying ? "destructive" : "default"}
              className="w-full py-6"
              size="lg"
            >
              {isPlaying ? <Pause size={20} /> : <Play size={20} />}
              {isPlaying ? `Stop Session (${formatElapsedTime(elapsedSeconds)})` : 'Start Session'}
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
            <BudgetCard label="Daily Budget" current={dailyBudget.current} limit={dailyBudget.limit} />
            <BudgetCard label="Weekly Budget" current={weeklyBudget.current} limit={weeklyBudget.limit} />
          </div>

          <RecentSessions sessions={recentSessions} />

          {/* Tip card - desktop only */}
          <Card className="hidden md:block bg-primary/10 border-primary/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-primary">💡 Quick Tip</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-primary/80">{tipMessage}</p>
            </CardContent>
          </Card>
        </div>
      </div>

      <NudgeToast message={nudge || ''} visible={!!nudge} onDismiss={dismiss} />
    </div>
  )
}

