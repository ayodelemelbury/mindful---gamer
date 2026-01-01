import { useState } from 'react'
import { TimeByGameChart } from '../../components/charts/TimeByGameChart'
import { CategoryBreakdownChart } from '../../components/charts/CategoryBreakdownChart'
import { WeeklyTrendChart } from '../../components/charts/WeeklyTrendChart'
import { TimeOfDayChart } from "../../components/charts/TimeOfDayChart"
import { SessionDurationChart } from "../../components/charts/SessionDurationChart"
import { useSessionStore } from '../../store/sessionStore'
import { useBudgetStore } from '../../store/budgetStore'
import { formatDuration } from "@/lib/formatDuration"
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Clock, Target, Gamepad2, Trophy, Timer } from "lucide-react"

const TABS = ['Overview', 'Trends'] as const
type Tab = typeof TABS[number]

export function InsightsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("Overview")
  const weekTotal = useSessionStore((s) => s.weekTotal)
  const games = useSessionStore((s) => s.games)
  const recentSessions = useSessionStore((s) => s.recentSessions)
  const { weeklyBudget } = useBudgetStore()

  const budgetPercent =
    weeklyBudget.limit > 0
      ? Math.round((weeklyBudget.current / weeklyBudget.limit) * 100)
      : 0

  const mostPlayedGame =
    games.length > 0
      ? games.reduce((a, b) => (a.totalTime > b.totalTime ? a : b))
      : null

  const avgSessionLength =
    recentSessions.length > 0
      ? Math.round(
          recentSessions.reduce((sum, s) => sum + s.duration, 0) /
            recentSessions.length
        )
      : 0

  const totalPlaytime = games.reduce((sum, g) => sum + g.totalTime, 0)

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold text-foreground md:text-3xl">
          Insights
        </h1>
        <p className="text-muted-foreground text-sm">
          Reflect on your gaming habits
        </p>
      </header>

      {/* Stats cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                <Clock size={20} className="text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">This Week</p>
                <p className="text-lg font-semibold text-foreground">
                  {weekTotal > 0 ? formatDuration(weekTotal) : "0m"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-chart-2/20 flex items-center justify-center">
                <Timer size={20} className="text-chart-2" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Avg Session</p>
                <p className="text-lg font-semibold text-foreground">
                  {avgSessionLength > 0
                    ? formatDuration(avgSessionLength)
                    : "--"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-chart-4/20 flex items-center justify-center">
                <Target size={20} className="text-chart-4" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Weekly Budget</p>
                <p className="text-lg font-semibold text-foreground">
                  {budgetPercent}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-chart-5/20 flex items-center justify-center">
                <Gamepad2 size={20} className="text-chart-5" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Games</p>
                <p className="text-lg font-semibold text-foreground">
                  {games.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Most Played Highlight */}
      {mostPlayedGame && mostPlayedGame.totalTime > 0 && (
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="pt-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center">
                <Trophy size={24} className="text-primary" />
              </div>
              {mostPlayedGame.backgroundImage ? (
                <img
                  src={mostPlayedGame.backgroundImage}
                  alt=""
                  className="w-16 h-12 object-cover rounded"
                />
              ) : null}
              <div className="flex-1">
                <p className="text-xs text-muted-foreground">Most Played</p>
                <p className="font-semibold text-foreground">
                  {mostPlayedGame.name}
                </p>
                <p className="text-sm text-muted-foreground">
                  {formatDuration(mostPlayedGame.totalTime)} total
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <div className="flex gap-2">
        {TABS.map((tab) => (
          <Button
            key={tab}
            onClick={() => setActiveTab(tab)}
            variant={activeTab === tab ? "default" : "secondary"}
            size="sm"
          >
            {tab}
          </Button>
        ))}
      </div>

      {/* Charts */}
      {activeTab === "Overview" && (
        <div className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {games.length > 0 && totalPlaytime > 0 ? (
              <>
                <TimeByGameChart />
                <CategoryBreakdownChart />
              </>
            ) : (
              <Card className="md:col-span-2">
                <CardContent className="py-12 text-center">
                  <Gamepad2
                    size={48}
                    className="mx-auto text-muted-foreground/50 mb-4"
                  />
                  <p className="text-muted-foreground">
                    {games.length === 0
                      ? "Add games and track sessions to see your insights."
                      : "Log some gaming sessions to see your breakdown."}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Detailed Analytics Row */}
          {recentSessions.length > 0 && (
            <div className="grid md:grid-cols-2 gap-6">
              <TimeOfDayChart />
              <SessionDurationChart />
            </div>
          )}
        </div>
      )}

      {activeTab === "Trends" && <WeeklyTrendChart />}
    </div>
  )
}
