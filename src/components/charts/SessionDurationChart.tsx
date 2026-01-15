import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useSessionStore } from "../../store/sessionStore"
import { Timer } from "lucide-react"

export function SessionDurationChart() {
  const recentSessions = useSessionStore((s) => s.recentSessions)

  // Bins: <15m, 15-30m, 30-60m, 60-120m, >2h
  const bins = [
    { label: "<15m", count: 0, min: 0, max: 15 },
    { label: "15-30m", count: 0, min: 15, max: 30 },
    { label: "30-60m", count: 0, min: 30, max: 60 },
    { label: "1-2h", count: 0, min: 60, max: 120 },
    { label: ">2h", count: 0, min: 120, max: Infinity },
  ]

  recentSessions.forEach((session) => {
    const duration = session.duration
    const bin = bins.find((b) => duration >= b.min && duration < b.max)
    if (bin) {
      bin.count++
    }
  })

  const hasData = recentSessions.length > 0

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">Session Length Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        {hasData ? (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={bins} aria-label="Session duration distribution">
              <XAxis dataKey="label" tick={{ fontSize: 11 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
              <Tooltip
                cursor={{ fill: "rgba(0,0,0,0.05)" }}
                contentStyle={{
                  borderRadius: "8px",
                  border: "none",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                }}
              />
              <Bar
                dataKey="count"
                name="Sessions"
                radius={[4, 4, 0, 0]}
                fill="var(--chart-1)"
              />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Timer size={40} className="text-muted-foreground/50 mb-2" />
            <p className="text-sm text-muted-foreground">
              Track more sessions to see duration patterns.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
