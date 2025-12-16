import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts'
import { useSessionStore } from '../../store/sessionStore'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function TimeByGameChart() {
  const games = useSessionStore((s) => s.games)
  const data = games.map((g) => ({ name: g.name, hours: Math.round(g.totalTime / 60 * 10) / 10 }))

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">Time by Game (hours)</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={data} layout="vertical">
            <XAxis type="number" tick={{ fontSize: 12 }} />
            <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} width={80} />
            <Tooltip />
            <Bar dataKey="hours" fill="oklch(0.71 0.097 111.7)" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

