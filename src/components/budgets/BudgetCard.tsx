import type { ReactNode } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { formatDuration } from "@/lib/formatDuration"
import { motion } from "framer-motion"
import { AlertTriangle, CheckCircle2 } from "lucide-react"

interface BudgetCardProps {
  label: string
  current: number
  limit: number
  icon?: ReactNode
}

export function BudgetCard({ label, current, limit, icon }: BudgetCardProps) {
  const percentage = Math.min((current / limit) * 100, 100)
  const remaining = Math.max(limit - current, 0)

  // Determine status for visual feedback
  const isWarning = percentage >= 80 && percentage < 100
  const isExceeded = percentage >= 100
  const isSafe = percentage < 80

  // Get status color
  const getStatusColor = () => {
    if (isExceeded) return "text-destructive"
    if (isWarning) return "text-chart-4"
    return "text-chart-2"
  }

  const getStatusBg = () => {
    if (isExceeded) return "bg-destructive/10"
    if (isWarning) return "bg-chart-4/10"
    return "bg-chart-2/10"
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02, y: -2 }}
      transition={{ type: "spring" as const, stiffness: 400, damping: 25 }}
    >
      <Card className="overflow-hidden relative group">
        <div className={`absolute top-0 right-0 w-16 h-16 ${getStatusBg()} rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 pointer-events-none opacity-50 group-hover:opacity-100 transition-opacity`} />
        <CardContent className="pt-4 relative">
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center gap-2">
              {icon && (
                <motion.span
                  className="text-muted-foreground"
                  whileHover={{ scale: 1.2, rotate: 10 }}
                  transition={{ type: "spring" as const, stiffness: 400, damping: 25 }}
                >
                  {icon}
                </motion.span>
              )}
              <span className="text-sm font-medium text-foreground">{label}</span>
            </div>
            <motion.div
              className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${getStatusBg()} ${getStatusColor()}`}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              {isExceeded ? (
                <>
                  <AlertTriangle className="h-3 w-3" />
                  <span>Exceeded</span>
                </>
              ) : isSafe ? (
                <>
                  <CheckCircle2 className="h-3 w-3" />
                  <span>{formatDuration(remaining)} left</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="h-3 w-3" />
                  <span>{formatDuration(remaining)} left</span>
                </>
              )}
            </motion.div>
          </div>

          <div className="space-y-2">
            <div className="relative">
              <Progress value={percentage} className="h-2" />
              {/* Animated progress indicator dot */}
              <motion.div
                className={`absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full ${
                  isExceeded ? 'bg-destructive' : isWarning ? 'bg-chart-4' : 'bg-chart-2'
                } shadow-sm`}
                style={{ left: `calc(${Math.min(percentage, 100)}% - 6px)` }}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: "spring" as const, stiffness: 500, damping: 25 }}
              />
            </div>

            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{formatDuration(current)}</span>
              <span>{formatDuration(limit)}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
