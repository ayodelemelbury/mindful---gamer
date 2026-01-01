import { Clock } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatTimeAgo } from "@/lib/utils"
import { formatDuration } from "@/lib/formatDuration"

interface RecentSession {
  id: string
  gameName: string
  duration: number
  createdAt: number // Unix timestamp in milliseconds
  note?: string
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
          <div className="flex flex-col items-center py-6 text-center">
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
              <Clock size={24} className="text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">
              No sessions yet today
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Start a session to track your gaming
            </p>
          </div>
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
            <div
              key={session.id}
              className="flex items-center justify-between py-2 border-b border-border last:border-0"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                  <Clock size={16} className="text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {session.gameName}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatTimeAgo(session.createdAt)}
                  </p>
                  {session.note && (
                    <p className="text-xs text-muted-foreground/80 italic mt-0.5 line-clamp-1">
                      "{session.note}"
                    </p>
                  )}
                </div>
              </div>
              <span className="text-sm text-muted-foreground">
                {formatDuration(session.duration)}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
