import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts'
import { useSessionStore } from '../../store/sessionStore'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

// Matsu theme chart colors
const COLORS = [
  'oklch(0.66 0.19 41.6)',   // chart-1 (orange)
  'oklch(0.68 0.16 184.9)',  // chart-2 (teal)
  'oklch(0.85 0.19 85.4)',   // chart-4 (amber)
  'oklch(0.74 0.19 66.3)',   // chart-5 (coral)
]

export function CategoryBreakdownChart() {
  const games = useSessionStore((s) => s.games)
  const categoryMap = games.reduce((acc, g) => {
    acc[g.category] = (acc[g.category] || 0) + g.totalTime
    return acc
  }, {} as Record<string, number>)

  const data = Object.entries(categoryMap).map(([name, value]) => ({ name, value }))

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">Category Breakdown</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label>
              {data.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

