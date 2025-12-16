import { useState } from 'react'
import { TimeByGameChart } from '../../components/charts/TimeByGameChart'
import { CategoryBreakdownChart } from '../../components/charts/CategoryBreakdownChart'
import { WeeklyTrendChart } from '../../components/charts/WeeklyTrendChart'
import { useSessionStore } from '../../store/sessionStore'
import { useBudgetStore } from '../../store/budgetStore'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Clock, Target, Gamepad2 } from 'lucide-react'

const TABS = ['Overview', 'Trends'] as const
type Tab = typeof TABS[number]

export function InsightsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('Overview')
  const weekTotal = useSessionStore((s) => s.weekTotal)
  const games = useSessionStore((s) => s.games)
  const { weeklyBudget } = useBudgetStore()

  const budgetPercent = weeklyBudget.limit > 0 
    ? Math.round((weeklyBudget.current / weeklyBudget.limit) * 100) 
    : 0

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold text-foreground md:text-3xl">Insights</h1>
        <p className="text-muted-foreground text-sm">Reflect on your gaming habits</p>
      </header>

      {/* Stats cards - responsive grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                <Clock size={20} className="text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">This Week</p>
                <p className="text-xl font-semibold text-foreground">
                  {weekTotal > 0 ? `${Math.floor(weekTotal / 60)}h ${weekTotal % 60}m` : '0m'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-chart-2/20 flex items-center justify-center">
                <Gamepad2 size={20} className="text-chart-2" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Games Tracked</p>
                <p className="text-xl font-semibold text-foreground">{games.length}</p>
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
                <p className="text-sm text-muted-foreground">Weekly Budget</p>
                <p className="text-xl font-semibold text-foreground">{budgetPercent}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

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

      {/* Charts - responsive grid on desktop */}
      {activeTab === 'Overview' && (
        <div className="grid md:grid-cols-2 gap-6">
          {games.length > 0 ? (
            <>
              <TimeByGameChart />
              <CategoryBreakdownChart />
            </>
          ) : (
            <Card className="md:col-span-2">
              <CardContent className="py-12 text-center">
                <Gamepad2 size={48} className="mx-auto text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground">Add games and track sessions to see your insights.</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {activeTab === 'Trends' && (
        <div className="grid md:grid-cols-1 gap-6">
          <WeeklyTrendChart />
        </div>
      )}
    </div>
  )
}


