import { useBudgetStore } from '../../store/budgetStore'
import { useUserStore } from '../../store/userStore'
import { useSessionStore } from '../../store/sessionStore'
import { BudgetEditor } from '../../components/budgets/BudgetEditor'
import { GamesManager } from '../../components/games/GamesManager'
import { UserProfile } from '../../components/settings/UserProfile'
import { AutoTrackingDebug } from '../../components/settings/AutoTrackingDebug'
import { IgnoredAppsManager } from '../../components/settings/IgnoredAppsManager'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { isNativeAndroid, getCurrentUsageBaseline } from '@/lib/usageTracking'
import { motion } from 'framer-motion'
import { useState } from 'react'
import {
  Settings2,
  Bell,
  Shield,
  Timer,
  Zap,
  Rocket,
  Eye,
  Users,
  Sparkles,
  Palette,
  Sun,
  Moon,
  Monitor,
  Info,
  ExternalLink,
  Heart,
  Database,
  Trash2,
  AlertTriangle
} from 'lucide-react'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring" as const,
      stiffness: 400,
      damping: 30,
    }
  },
}

const cardHoverVariants = {
  rest: { scale: 1, y: 0 },
  hover: {
    scale: 1.01,
    y: -2,
    transition: {
      type: "spring" as const,
      stiffness: 400,
      damping: 25,
    }
  },
}

interface SettingRowProps {
  id: string
  label: string
  description: string
  icon: React.ReactNode
  checked: boolean
  onCheckedChange: (checked: boolean) => void
}

function SettingRow({ id, label, description, icon, checked, onCheckedChange }: SettingRowProps) {
  return (
    <motion.div
      className="flex items-center justify-between p-3 -mx-3 rounded-xl transition-colors hover:bg-primary/5 group cursor-pointer"
      whileHover={{ x: 4 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      onClick={() => onCheckedChange(!checked)}
    >
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary transition-transform group-hover:scale-110">
          {icon}
        </div>
        <div>
          <Label htmlFor={id} className="text-sm font-medium cursor-pointer">{label}</Label>
          <p className="text-xs text-muted-foreground">
            {description}
          </p>
        </div>
      </div>
      <Switch
        id={id}
        checked={checked}
        onCheckedChange={onCheckedChange}
        onClick={(e) => e.stopPropagation()}
      />
    </motion.div>
  )
}

interface SectionHeaderProps {
  icon: React.ReactNode
  title: string
  description?: string
}

function SectionHeader({ icon, title, description }: SectionHeaderProps) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-primary">
        {icon}
      </div>
      <div>
        <h3 className="font-semibold text-foreground">{title}</h3>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
      </div>
    </div>
  )
}

interface ThemeButtonProps {
  icon: React.ReactNode
  label: string
  active: boolean
  onClick: () => void
}

function ThemeButton({ icon, label, active, onClick }: ThemeButtonProps) {
  return (
    <motion.button
      onClick={onClick}
      className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-colors ${
        active
          ? 'border-primary bg-primary/10 text-primary'
          : 'border-border bg-card text-muted-foreground hover:border-primary/50 hover:text-foreground'
      }`}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {icon}
      <span className="text-xs font-medium">{label}</span>
    </motion.button>
  )
}

export function SettingsPage() {
  const { dailyBudget, weeklyBudget, setDailyLimit, setWeeklyLimit } = useBudgetStore()
  const { settings, updateSettings } = useUserStore()
  const { clearSessionHistory, clearAllData, recentSessions, games } = useSessionStore()
  const isAndroid = isNativeAndroid()
  const [resetSuccess, setResetSuccess] = useState<string | null>(null)

  const handleClearHistory = async () => {
    // On Android, get current usage baseline before clearing
    // This prevents old Android usage data from being re-added after clear
    if (isAndroid) {
      const baseline = await getCurrentUsageBaseline(games)
      updateSettings({
        autoTrackingDailySynced: baseline,
        autoTrackingLastSync: Date.now(),
      })
    }
    clearSessionHistory()
    setResetSuccess('Session history cleared successfully')
    setTimeout(() => setResetSuccess(null), 3000)
  }

  const handleClearAll = async () => {
    // On Android, get current usage baseline before clearing
    // This prevents old Android usage data from being re-added after clear
    if (isAndroid) {
      const baseline = await getCurrentUsageBaseline(games)
      updateSettings({
        autoTrackingDailySynced: baseline,
        autoTrackingLastSync: Date.now(),
      })
    }
    clearAllData()
    setResetSuccess('All data cleared successfully')
    setTimeout(() => setResetSuccess(null), 3000)
  }

  return (
    <motion.div
      className="space-y-8 pb-20"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header with decorative element */}
      <motion.header variants={itemVariants} className="relative">
        <div className="absolute -top-4 -left-4 w-24 h-24 bg-primary/5 rounded-full blur-2xl pointer-events-none" />
        <div className="relative flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-lg shadow-primary/20">
            <Settings2 className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground md:text-3xl">Settings</h1>
            <p className="text-muted-foreground text-sm flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              Customize your mindful gaming experience
            </p>
          </div>
        </div>
      </motion.header>

      {/* User Profile */}
      <motion.div variants={itemVariants}>
        <UserProfile />
      </motion.div>

      {/* Games Manager */}
      <motion.div variants={itemVariants}>
        <GamesManager />
      </motion.div>

      {/* Auto-Tracking Settings (Android only) */}
      {isAndroid && (
        <motion.div variants={itemVariants}>
          <motion.div
            variants={cardHoverVariants}
            initial="rest"
            whileHover="hover"
          >
            <Card className="overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-chart-2/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
              <CardHeader className="pb-2">
                <SectionHeader
                  icon={<Zap className="h-5 w-5" />}
                  title="Auto-Tracking"
                  description="Smart detection features"
                />
              </CardHeader>
              <CardContent className="space-y-1">
                <SettingRow
                  id="autoTracking"
                  label="Enable auto-tracking"
                  description="Automatically detect and log game sessions"
                  icon={<Eye className="h-4 w-4" />}
                  checked={settings?.autoTrackingEnabled ?? true}
                  onCheckedChange={(checked) => updateSettings({ autoTrackingEnabled: checked })}
                />
                <SettingRow
                  id="autoLaunch"
                  label="Auto-launch games"
                  description="Open games when starting a session"
                  icon={<Rocket className="h-4 w-4" />}
                  checked={settings?.autoLaunchEnabled ?? false}
                  onCheckedChange={(checked) => updateSettings({ autoLaunchEnabled: checked })}
                />
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      )}

      {/* Time Budgets Section */}
      <motion.div variants={itemVariants} className="space-y-4">
        <SectionHeader
          icon={<Timer className="h-5 w-5" />}
          title="Time Budgets"
          description="Set your healthy gaming limits"
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <motion.div
            variants={cardHoverVariants}
            initial="rest"
            whileHover="hover"
          >
            <BudgetEditor
              label="Daily Limit"
              value={dailyBudget.limit}
              onChange={setDailyLimit}
              max={360}
            />
          </motion.div>
          <motion.div
            variants={cardHoverVariants}
            initial="rest"
            whileHover="hover"
          >
            <BudgetEditor
              label="Weekly Limit"
              value={weeklyBudget.limit}
              onChange={setWeeklyLimit}
              min={120}
              max={1680}
            />
          </motion.div>
        </div>
      </motion.div>

      {/* Notifications */}
      <motion.div variants={itemVariants}>
        <motion.div
          variants={cardHoverVariants}
          initial="rest"
          whileHover="hover"
        >
          <Card className="overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-chart-4/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
            <CardHeader className="pb-2">
              <SectionHeader
                icon={<Bell className="h-5 w-5" />}
                title="Notifications"
                description="Stay informed without feeling pressured"
              />
            </CardHeader>
            <CardContent className="space-y-1">
              <SettingRow
                id="nudges"
                label="Gentle nudges"
                description="Friendly reminders to take breaks"
                icon={<Sparkles className="h-4 w-4" />}
                checked={settings?.sessionReminders ?? true}
                onCheckedChange={(checked) => updateSettings({ sessionReminders: checked })}
              />
              <SettingRow
                id="warnings"
                label="Budget warnings"
                description="Alerts when approaching your limits"
                icon={<Bell className="h-4 w-4" />}
                checked={settings?.notifications ?? true}
                onCheckedChange={(checked) => updateSettings({ notifications: checked })}
              />
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* Privacy */}
      <motion.div variants={itemVariants}>
        <motion.div
          variants={cardHoverVariants}
          initial="rest"
          whileHover="hover"
        >
          <Card className="overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-chart-5/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
            <CardHeader className="pb-2">
              <SectionHeader
                icon={<Shield className="h-5 w-5" />}
                title="Privacy"
                description="Control your visibility"
              />
            </CardHeader>
            <CardContent className="space-y-1">
              <SettingRow
                id="share"
                label="Share activity with friends"
                description="Let friends see your gaming activity"
                icon={<Users className="h-4 w-4" />}
                checked={settings?.shareActivityWithFriends ?? false}
                onCheckedChange={(checked) => updateSettings({ shareActivityWithFriends: checked })}
              />
              <SettingRow
                id="rankings"
                label="Show in community rankings"
                description="Appear in leaderboards and stats"
                icon={<Eye className="h-4 w-4" />}
                checked={settings?.showInCommunityRankings ?? true}
                onCheckedChange={(checked) => updateSettings({ showInCommunityRankings: checked })}
              />
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* Appearance */}
      <motion.div variants={itemVariants}>
        <motion.div
          variants={cardHoverVariants}
          initial="rest"
          whileHover="hover"
        >
          <Card className="overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-chart-1/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
            <CardHeader className="pb-2">
              <SectionHeader
                icon={<Palette className="h-5 w-5" />}
                title="Appearance"
                description="Customize how the app looks"
              />
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Label className="text-sm text-muted-foreground">Theme</Label>
                <div className="grid grid-cols-3 gap-2">
                  <ThemeButton
                    icon={<Sun className="h-4 w-4" />}
                    label="Light"
                    active={settings?.theme === 'light'}
                    onClick={() => updateSettings({ theme: 'light' })}
                  />
                  <ThemeButton
                    icon={<Moon className="h-4 w-4" />}
                    label="Dark"
                    active={settings?.theme === 'dark'}
                    onClick={() => updateSettings({ theme: 'dark' })}
                  />
                  <ThemeButton
                    icon={<Monitor className="h-4 w-4" />}
                    label="System"
                    active={settings?.theme === 'system'}
                    onClick={() => updateSettings({ theme: 'system' })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* Data Management */}
      <motion.div variants={itemVariants}>
        <motion.div
          variants={cardHoverVariants}
          initial="rest"
          whileHover="hover"
        >
          <Card className="overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-destructive/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
            <CardHeader className="pb-2">
              <SectionHeader
                icon={<Database className="h-5 w-5" />}
                title="Data Management"
                description="Manage your tracked data"
              />
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Stats */}
              <div className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg">
                <div className="flex-1 text-center">
                  <p className="text-2xl font-bold text-foreground">{recentSessions.length}</p>
                  <p className="text-xs text-muted-foreground">Sessions</p>
                </div>
                <div className="w-px h-8 bg-border" />
                <div className="flex-1 text-center">
                  <p className="text-2xl font-bold text-foreground">{games.length}</p>
                  <p className="text-xs text-muted-foreground">Games</p>
                </div>
              </div>

              {/* Success message */}
              {resetSuccess && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg text-green-700 dark:text-green-400 text-sm text-center"
                >
                  {resetSuccess}
                </motion.div>
              )}

              {/* Clear Session History */}
              <div className="space-y-3">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start gap-3 h-auto py-3"
                    >
                      <div className="w-9 h-9 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-600">
                        <Trash2 className="h-4 w-4" />
                      </div>
                      <div className="text-left">
                        <p className="font-medium">Clear Session History</p>
                        <p className="text-xs text-muted-foreground">
                          Remove all sessions, keep your games library
                        </p>
                      </div>
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-amber-500" />
                        Clear Session History?
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        This will permanently delete all your gaming session records and reset your daily/weekly usage stats. Your games library will be preserved.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleClearHistory}
                        className="bg-amber-600 hover:bg-amber-700"
                      >
                        Clear History
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start gap-3 h-auto py-3 border-destructive/30 hover:bg-destructive/5"
                    >
                      <div className="w-9 h-9 rounded-lg bg-destructive/10 flex items-center justify-center text-destructive">
                        <AlertTriangle className="h-4 w-4" />
                      </div>
                      <div className="text-left">
                        <p className="font-medium text-destructive">Reset All Data</p>
                        <p className="text-xs text-muted-foreground">
                          Delete everything and start fresh
                        </p>
                      </div>
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle className="flex items-center gap-2 text-destructive">
                        <AlertTriangle className="h-5 w-5" />
                        Reset All Data?
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        <span className="font-semibold text-destructive">This action cannot be undone.</span> This will permanently delete:
                        <ul className="list-disc list-inside mt-2 space-y-1">
                          <li>All gaming session records</li>
                          <li>Your entire games library</li>
                          <li>Daily and weekly usage statistics</li>
                        </ul>
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleClearAll}
                        className="bg-destructive hover:bg-destructive/90"
                      >
                        Reset Everything
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* App Info */}
      <motion.div variants={itemVariants}>
        <motion.div
          variants={cardHoverVariants}
          initial="rest"
          whileHover="hover"
        >
          <Card className="overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-chart-3/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
            <CardHeader className="pb-2">
              <SectionHeader
                icon={<Info className="h-5 w-5" />}
                title="About"
                description="App information"
              />
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Mindful Gamer</p>
                    <p className="text-xs text-muted-foreground">Version 1.0.0</p>
                  </div>
                </div>
              </div>
              <div className="space-y-2 pt-2 border-t border-border">
                <a
                  href="https://github.com/anthropics/mindful-gamer"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-2 -mx-2 rounded-lg hover:bg-primary/5 transition-colors group"
                >
                  <span className="text-sm text-muted-foreground">View on GitHub</span>
                  <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </a>
                <a
                  href="mailto:support@mindfulgamer.app"
                  className="flex items-center justify-between p-2 -mx-2 rounded-lg hover:bg-primary/5 transition-colors group"
                >
                  <span className="text-sm text-muted-foreground">Send Feedback</span>
                  <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </a>
              </div>
              <div className="pt-2 border-t border-border">
                <p className="text-xs text-muted-foreground text-center flex items-center justify-center gap-1">
                  Made with <Heart className="h-3 w-3 text-red-500 fill-red-500" /> for mindful gamers
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* Debug panel (Android only) */}
      {isAndroid && (
        <motion.div variants={itemVariants}>
          <AutoTrackingDebug />
        </motion.div>
      )}

      {/* Ignored apps manager (Android only) */}
      {isAndroid && (
        <motion.div variants={itemVariants}>
          <IgnoredAppsManager />
        </motion.div>
      )}
    </motion.div>
  )
}


