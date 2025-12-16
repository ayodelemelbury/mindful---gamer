import { Clock } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface RecentSession {
  id: string
  gameName: string
  duration: number
  timeAgo: string
}

interface RecentSessionsProps {
  sessions: RecentSession[]
}

export function RecentSessions({ sessions }: RecentSessionsProps) {
  if (sessions.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Recent Sessions</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-4">No sessions yet today</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">Recent Sessions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {sessions.map((session) => (
            <div key={session.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                  <Clock size={16} className="text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{session.gameName}</p>
                  <p className="text-xs text-muted-foreground">{session.timeAgo}</p>
                </div>
              </div>
              <span className="text-sm text-muted-foreground">{session.duration}m</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

