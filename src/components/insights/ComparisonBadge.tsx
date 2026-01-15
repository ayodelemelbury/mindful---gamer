import { ArrowUp, ArrowDown, Minus } from "lucide-react"

interface ComparisonBadgeProps {
  current: number
  previous: number
  inverse?: boolean // If true, lower is better (green)
  suffix?: string
}

export function ComparisonBadge({ current, previous, inverse = false, suffix = "%" }: ComparisonBadgeProps) {
  if (!previous) return null

  const diff = current - previous
  const percentChange = Math.round((diff / previous) * 100)

  if (percentChange === 0) {
      return (
          <span className="inline-flex items-center text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full">
              <Minus className="w-3 h-3 mr-1" /> 0{suffix}
          </span>
      )
  }

  const isPositive = percentChange > 0
  // Color logic:
  // If inverse (e.g. usage), Positive (More usage) is BAD (Red), Negative (Less usage) is GOOD (Green)
  // If not inverse (e.g. Streak), Positive (More streak) is GOOD (Green), Negative is BAD (Red)

  const isGood = inverse ? !isPositive : isPositive

  const colorClass = isGood
    ? "text-emerald-700 bg-emerald-100 dark:bg-emerald-950/30 dark:text-emerald-400"
    : "text-rose-700 bg-rose-100 dark:bg-rose-950/30 dark:text-rose-400"

  return (
    <span className={`inline-flex items-center text-xs px-1.5 py-0.5 rounded-full font-medium ${colorClass}`}>
      {isPositive ? <ArrowUp className="w-3 h-3 mr-1" /> : <ArrowDown className="w-3 h-3 mr-1" />}
      {Math.abs(percentChange)}{suffix}
    </span>
  )
}
