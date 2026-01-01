import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, Legend } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useSessionStore } from '../../store/sessionStore'
import { BarChart3 } from 'lucide-react'

interface WeekData {
  week: string
  hours: number
}

function getWeekNumber(date: Date): number {
  const startOfYear = new Date(date.getFullYear(), 0, 1)
  const pastDaysOfYear = (date.getTime() - startOfYear.getTime()) / 86400000
  return Math.ceil((pastDaysOfYear + startOfYear.getDay() + 1) / 7)
}

function formatWeekLabel(weekNum: number, year: number): string {
  // Get start of week (Sunday)
  const startOfYear = new Date(year, 0, 1)
  const daysOffset = (weekNum - 1) * 7 - startOfYear.getDay()
  const weekStart = new Date(year, 0, 1 + daysOffset)

  const month = weekStart.toLocaleDateString("en-US", { month: "short" })
  const day = weekStart.getDate()
  return `${month} ${day}`
}

export function WeeklyTrendChart() {
  const recentSessions = useSessionStore((s) => s.recentSessions)

  // Aggregate sessions by week from actual session dates
  const weeklyData = new Map<
    string,
    { week: number; year: number; hours: number }
  >()

  recentSessions.forEach((session) => {
    const date = new Date(session.createdAt)
    const weekNum = getWeekNumber(date)
    const year = date.getFullYear()
    const key = `${year}-W${weekNum}`

    const existing = weeklyData.get(key) || { week: weekNum, year, hours: 0 }
    existing.hours += session.duration / 60 // Convert minutes to hours
    weeklyData.set(key, existing)
  })

  // Sort by date and take last 4 weeks
  const sortedData: WeekData[] = Array.from(weeklyData.entries())
    .sort((a, b) => {
      if (a[1].year !== b[1].year) return a[1].year - b[1].year
      return a[1].week - b[1].week
    })
    .slice(-4)
    .map(([, value]) => ({
      week: formatWeekLabel(value.week, value.year),
      hours: Math.round(value.hours * 10) / 10,
    }))

  const hasData = sortedData.length > 0

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">Weekly Trends (hours)</CardTitle>
      </CardHeader>
      <CardContent>
        {hasData ? (
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={sortedData} aria-label="Weekly gaming trends">
              <XAxis dataKey="week" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Line
                type="monotone"
                dataKey="hours"
                stroke="var(--primary)"
                name="Hours Played"
                strokeWidth={2}
                dot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <BarChart3 size={40} className="text-muted-foreground/50 mb-2" />
            <p className="text-sm text-muted-foreground">
              Start tracking sessions to see your weekly trends.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
