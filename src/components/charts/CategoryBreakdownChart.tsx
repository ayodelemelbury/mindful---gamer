import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts'
import { useSessionStore } from '../../store/sessionStore'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PieChart as PieIcon } from "lucide-react"

const COLORS = [
  "oklch(0.66 0.19 41.6)",
  "oklch(0.68 0.16 184.9)",
  "oklch(0.85 0.19 85.4)",
  "oklch(0.74 0.19 66.3)",
  "oklch(0.71 0.097 111.7)",
]

export function CategoryBreakdownChart() {
  const games = useSessionStore((s) => s.games)
  const categoryMap = games.reduce((acc, g) => {
    if (g.totalTime > 0) {
      acc[g.category] = (acc[g.category] || 0) + g.totalTime
    }
    return acc
  }, {} as Record<string, number>)

  const data = Object.entries(categoryMap).map(([name, value]) => ({
    name,
    value,
  }))

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Category Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <PieIcon size={40} className="text-muted-foreground/50 mb-2" />
            <p className="text-sm text-muted-foreground">
              No category data yet
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">Category Breakdown</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={200}>
          <PieChart aria-label="Gaming time by category">
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={70}
              label
            >
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
