import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell } from 'recharts'
import { useNavigate } from 'react-router-dom'
import { useSessionStore } from '../../store/sessionStore'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { BarChart3 } from "lucide-react"

export function TimeByGameChart() {
  const navigate = useNavigate()
  const games = useSessionStore((s) => s.games)
  const data = games
    .filter((g) => g.totalTime > 0)
    .map((g) => ({
      id: g.id,
      name: g.name,
      hours: Math.round((g.totalTime / 60) * 10) / 10,
    }))
    .sort((a, b) => b.hours - a.hours)
    .slice(0, 5)

  const handleBarClick = (data: { id?: string }) => {
    if (data?.id) {
      navigate(`/game/${data.id}`)
    }
  }

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Time by Game (hours)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <BarChart3 size={40} className="text-muted-foreground/50 mb-2" />
            <p className="text-sm text-muted-foreground">
              No playtime logged yet
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">Time by Game (hours)</CardTitle>
        <CardDescription className="text-xs">Tap a bar to view game details</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart
            data={data}
            layout="vertical"
            aria-label="Playtime by game"
          >
            <XAxis type="number" tick={{ fontSize: 12 }} />
            <YAxis
              type="category"
              dataKey="name"
              tick={{ fontSize: 12 }}
              width={80}
            />
            <Tooltip
              formatter={(value) => [`${value}h`, 'Playtime']}
              cursor={{ fill: 'hsl(var(--muted))' }}
            />
            <Bar
              dataKey="hours"
              fill="var(--primary)"
              radius={[0, 4, 4, 0]}
              className="cursor-pointer"
              onClick={(data) => handleBarClick(data)}
            >
              {data.map((entry) => (
                <Cell
                  key={entry.id}
                  className="hover:opacity-80 transition-opacity cursor-pointer"
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
