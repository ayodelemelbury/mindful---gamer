import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, Legend } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useSessionStore } from '../../store/sessionStore'
import { BarChart3 } from 'lucide-react'

export function WeeklyTrendChart() {
  const recentSessions = useSessionStore((s) => s.recentSessions)
  const weekTotal = useSessionStore((s) => s.weekTotal)

  // Create simple week data based on current tracking
  // In a real app, this would aggregate from actual dated sessions
  const hasData = recentSessions.length > 0 || weekTotal > 0

  const data = hasData
    ? [
        { week: 'W1', hours: Math.round(weekTotal * 0.2 / 60 * 10) / 10 },
        { week: 'W2', hours: Math.round(weekTotal * 0.25 / 60 * 10) / 10 },
        { week: 'W3', hours: Math.round(weekTotal * 0.3 / 60 * 10) / 10 },
        { week: 'W4', hours: Math.round(weekTotal * 0.25 / 60 * 10) / 10 },
      ]
    : []

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">Weekly Trends (hours)</CardTitle>
      </CardHeader>
      <CardContent>
        {hasData ? (
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={data}>
              <XAxis dataKey="week" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Line 
                type="monotone" 
                dataKey="hours" 
                stroke="oklch(0.71 0.097 111.7)" 
                name="This Month" 
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


