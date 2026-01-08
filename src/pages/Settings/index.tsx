import { useBudgetStore } from '../../store/budgetStore'
import { useUserStore } from '../../store/userStore'
import { BudgetEditor } from '../../components/budgets/BudgetEditor'
import { GamesManager } from '../../components/games/GamesManager'
import { UserProfile } from '../../components/settings/UserProfile'
import { AutoTrackingDebug } from '../../components/settings/AutoTrackingDebug'
import { IgnoredAppsManager } from '../../components/settings/IgnoredAppsManager'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { isNativeAndroid } from '@/lib/usageTracking'
import { motion } from 'framer-motion'
import {
  Settings2,
  Bell,
  Shield,
  Timer,
  Zap,
  Rocket,
  Eye,
  Users,
  Sparkles
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

export function SettingsPage() {
  const { dailyBudget, weeklyBudget, setDailyLimit, setWeeklyLimit } = useBudgetStore()
  const { settings, updateSettings } = useUserStore()
  const isAndroid = isNativeAndroid()

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
                checked={true}
                onCheckedChange={() => {}}
              />
              <SettingRow
                id="warnings"
                label="Budget warnings"
                description="Alerts when approaching your limits"
                icon={<Bell className="h-4 w-4" />}
                checked={true}
                onCheckedChange={() => {}}
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
                checked={false}
                onCheckedChange={() => {}}
              />
              <SettingRow
                id="rankings"
                label="Show in community rankings"
                description="Appear in leaderboards and stats"
                icon={<Eye className="h-4 w-4" />}
                checked={true}
                onCheckedChange={() => {}}
              />
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


