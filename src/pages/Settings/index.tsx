import { useBudgetStore } from '../../store/budgetStore'
import { BudgetEditor } from '../../components/budgets/BudgetEditor'
import { GamesManager } from '../../components/games/GamesManager'
import { UserProfile } from '../../components/settings/UserProfile'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'

export function SettingsPage() {
  const { dailyBudget, weeklyBudget, setDailyLimit, setWeeklyLimit } = useBudgetStore()

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold text-foreground">Settings</h1>
        <p className="text-muted-foreground text-sm">Customize your experience</p>
      </header>

      <UserProfile />

      <GamesManager />

      <div className="space-y-3">
        <h3 className="font-medium text-foreground">Time Budgets</h3>
        <BudgetEditor label="Daily Limit" value={dailyBudget.limit} onChange={setDailyLimit} max={360} />
        <BudgetEditor label="Weekly Limit" value={weeklyBudget.limit} onChange={setWeeklyLimit} min={120} max={1680} />
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Notifications</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="nudges" className="text-sm text-muted-foreground">Gentle nudges</Label>
            <Switch id="nudges" defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="warnings" className="text-sm text-muted-foreground">Budget warnings</Label>
            <Switch id="warnings" defaultChecked />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Privacy</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="share" className="text-sm text-muted-foreground">Share activity with friends</Label>
            <Switch id="share" />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="rankings" className="text-sm text-muted-foreground">Show in community rankings</Label>
            <Switch id="rankings" defaultChecked />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}


