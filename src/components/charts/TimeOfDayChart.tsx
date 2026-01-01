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
import { Clock } from "lucide-react"

export function TimeOfDayChart() {
  const recentSessions = useSessionStore((s) => s.recentSessions)

  // Aggregate sessions by hour (0-23)
  const hourCounts = new Array(24).fill(0)

  recentSessions.forEach((session) => {
    const date = new Date(session.createdAt)
    const hour = date.getHours()
    hourCounts[hour] += session.duration
  })

  // Format data for chart
  const data = hourCounts
    .map((minutes, hour) => {
      // Format label: 0 -> 12am, 13 -> 1pm
      const label =
        hour === 0
          ? "12am"
          : hour === 12
          ? "12pm"
          : hour > 12
          ? `${hour - 12}pm`
          : `${hour}am`
      return {
        hour,
        label,
        minutes,
      }
    })
    .filter((d) => d.minutes > 0)
    .sort((a, b) => a.hour - b.hour)

  const hasData = data.length > 0

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">Time of Day (Minutes)</CardTitle>
      </CardHeader>
      <CardContent>
        {hasData ? (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={data} aria-label="Gaming activity by time of day">
              <XAxis
                dataKey="label"
                tick={{ fontSize: 10 }}
                interval={0}
                angle={-45}
                textAnchor="end"
                height={50}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip
                cursor={{ fill: "rgba(0,0,0,0.05)" }}
                contentStyle={{
                  borderRadius: "8px",
                  border: "none",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                }}
              />
              <Bar
                dataKey="minutes"
                radius={[4, 4, 0, 0]}
                fill="var(--chart-2)"
              />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Clock size={40} className="text-muted-foreground/50 mb-2" />
            <p className="text-sm text-muted-foreground">
              No recent session data to analyze.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
