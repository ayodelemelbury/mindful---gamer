/**
 * AutoTrackingCard Component
 *
 * Displays auto-detected game sessions from Android UsageStats.
 * Allows users to sync sessions to their main session log.
 */

import { Component, type ReactNode } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Smartphone, RefreshCw, Check, Settings, Zap, AlertTriangle } from "lucide-react"
import { useUsageTracking } from "@/hooks/useUsageTracking"
import { formatDistanceToNow } from "@/lib/utils"
import { formatDuration } from "@/lib/formatDuration"
import type { AutoTrackedSession } from "@/lib/usageTracking"

// Error boundary for plugin failures
class AutoTrackingErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  render() {
    if (this.state.hasError) {
      return (
        <Card className="border-destructive/50">
          <CardContent className="py-6">
            <div className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              <span className="text-sm">Auto-tracking unavailable</span>
            </div>
          </CardContent>
        </Card>
      )
    }
    return this.props.children
  }
}

function SessionSkeleton() {
  return (
    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
      <div className="flex-1 min-w-0 space-y-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-3 w-20" />
      </div>
      <Skeleton className="h-5 w-16 ml-2" />
    </div>
  )
}

function SessionItem({ session }: { session: AutoTrackedSession }) {
  return (
    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">{session.gameName}</p>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>{formatDuration(session.duration)}</span>
          <span>•</span>
          <span>{formatDistanceToNow(session.detectedAt)}</span>
        </div>
      </div>
      <Badge variant="secondary" className="ml-2 shrink-0">
        <Check className="h-3 w-3 mr-1" />
        Synced
      </Badge>
    </div>
  )
}

export function AutoTrackingCard() {
  return (
    <AutoTrackingErrorBoundary>
      <AutoTrackingCardInner />
    </AutoTrackingErrorBoundary>
  )
}

function AutoTrackingCardInner() {
  const {
    isAvailable,
    permissionStatus,
    autoSessions,
    isLoading,
    error,
    lastSyncTime,
    requestPermission,
    refreshSessions,
  } = useUsageTracking()

  // Not available on web/iOS - don't render anything
  if (!isAvailable) {
    return null
  }

  // Permission not granted - show enable prompt
  if (permissionStatus === "denied") {
    return (
      <Card className="border-amber-200 bg-amber-50/50 dark:border-amber-900 dark:bg-amber-950/20">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Zap className="h-5 w-5 text-amber-500" />
            Enable Auto-Tracking
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Allow Mindful Gamer to track your game sessions automatically. We'll
            detect when you play games and log the time for you.
          </p>
          <Button onClick={requestPermission} variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Enable in Settings
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Smartphone className="h-5 w-5 text-primary" />
          Auto-Tracked Sessions
        </CardTitle>
        <Button
          variant="ghost"
          size="icon"
          onClick={refreshSessions}
          disabled={isLoading}
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
        </Button>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm text-destructive">{error}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={refreshSessions}
              disabled={isLoading}
            >
              <RefreshCw
                className={`h-3 w-3 mr-1 ${isLoading ? "animate-spin" : ""}`}
              />
              Retry
            </Button>
          </div>
        )}

        {/* Loading State */}
        {isLoading && autoSessions.length === 0 && (
          <div className="space-y-2">
            <SessionSkeleton />
            <SessionSkeleton />
            <SessionSkeleton />
          </div>
        )}

        {/* Empty State */}
        {!isLoading && autoSessions.length === 0 && (
          <div className="flex flex-col items-center py-6 text-center">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-3">
              <Smartphone className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">
              No game sessions detected today
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Play some games and they'll appear here automatically
            </p>
          </div>
        )}

        {/* Sessions List */}
        {!isLoading && autoSessions.length > 0 && (
          <div className="space-y-2">
            {autoSessions.slice(0, 5).map((session) => (
              <SessionItem key={session.id} session={session} />
            ))}

            {autoSessions.length > 5 && (
              <p className="text-xs text-muted-foreground text-center pt-1">
                +{autoSessions.length - 5} more sessions
              </p>
            )}
          </div>
        )}

        {lastSyncTime && (
          <p className="text-xs text-muted-foreground text-center mt-3">
            Auto-synced: {formatDistanceToNow(lastSyncTime)}
          </p>
        )}
      </CardContent>
    </Card>
  )
}

export default AutoTrackingCard
