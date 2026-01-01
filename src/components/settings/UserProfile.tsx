import { useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { useUserStore } from '../../store/userStore'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { User, LogOut, RefreshCw, Cloud, CloudOff, Loader2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export function UserProfile() {
  const { user, signOut } = useAuth()
  const { profile, lastSyncedAt, syncToCloud, clearUserData } = useUserStore()
  const [syncing, setSyncing] = useState(false)
  const [syncError, setSyncError] = useState<string | null>(null)
  const navigate = useNavigate()

  const handleSync = async () => {
    if (!user) return
    setSyncing(true)
    setSyncError(null)

    try {
      await syncToCloud(user.uid)
    } catch (err) {
      setSyncError(err instanceof Error ? err.message : "Sync failed")
    } finally {
      setSyncing(false)
    }
  }

  const handleSignOut = async () => {
    try {
      // Sync data to cloud before signing out to prevent data loss
      if (user) {
        await syncToCloud(user.uid)
      }
      await signOut()
      clearUserData()
      navigate("/auth")
    } catch (err) {
      console.error("Sign out failed:", err)
    }
  }

  // Not logged in state
  if (!user) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <User className="w-4 h-4" />
            Account
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Sign in to sync your data across devices and never lose your
            progress.
          </p>
          <Button onClick={() => navigate("/auth")} className="w-full">
            Sign In / Create Account
          </Button>
        </CardContent>
      </Card>
    )
  }

  // Logged in state
  const initials = (
    profile?.displayName ||
    user.displayName ||
    user.email ||
    "U"
  )
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  const formatLastSync = (dateStr: string | null) => {
    if (!dateStr) return "Never"
    const date = new Date(dateStr)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)

    if (diffMins < 1) return "Just now"
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`
    return date.toLocaleDateString()
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <User className="w-4 h-4" />
          Account
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-3">
          <Avatar className="w-12 h-12">
            <AvatarImage
              src={profile?.avatarUrl || user.photoURL || undefined}
            />
            <AvatarFallback className="bg-primary/10 text-primary">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-foreground truncate">
              {profile?.displayName || user.displayName || "Gamer"}
            </p>
            <p className="text-sm text-muted-foreground truncate">
              {profile?.email || user.email}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between py-2 px-3 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-2 text-sm">
            {lastSyncedAt ? (
              <Cloud className="w-4 h-4 text-primary" />
            ) : (
              <CloudOff className="w-4 h-4 text-muted-foreground" />
            )}
            <span className="text-muted-foreground">
              Auto-sync • {formatLastSync(lastSyncedAt)}
            </span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSync}
            disabled={syncing}
          >
            {syncing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
          </Button>
        </div>

        {syncError && <p className="text-sm text-destructive">{syncError}</p>}

        <Button variant="outline" className="w-full" onClick={handleSignOut}>
          <LogOut className="w-4 h-4 mr-2" />
          Sign Out
        </Button>
      </CardContent>
    </Card>
  )
}
