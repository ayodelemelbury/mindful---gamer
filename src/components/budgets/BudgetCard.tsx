import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { formatDuration } from '@/lib/formatDuration'

interface BudgetCardProps {
  label: string
  current: number
  limit: number
}

export function BudgetCard({ label, current, limit }: BudgetCardProps) {
  const percentage = Math.min((current / limit) * 100, 100)
  const remaining = Math.max(limit - current, 0)

  return (
    <Card>
      <CardContent className="pt-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-foreground">{label}</span>
          <span className="text-xs text-muted-foreground">{formatDuration(remaining)} left</span>
        </div>
        <Progress value={percentage} className="h-2" />
      </CardContent>
    </Card>
  )
}
