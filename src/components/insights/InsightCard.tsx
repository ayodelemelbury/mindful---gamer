import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

interface InsightCardProps {
  title: string
  subtitle?: string
  icon?: ReactNode
  className?: string
  children: ReactNode
}

export function InsightCard({ title, subtitle, icon, className, children }: InsightCardProps) {
  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="space-y-1">
          <CardTitle className="text-base font-medium">
             {title}
          </CardTitle>
          {subtitle && (
              <p className="text-xs text-muted-foreground">{subtitle}</p>
          )}
        </div>
        {icon && <div className="text-muted-foreground">{icon}</div>}
      </CardHeader>
      <CardContent>
        {children}
      </CardContent>
    </Card>
  )
}
