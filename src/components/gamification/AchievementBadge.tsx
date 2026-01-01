/**
 * AchievementBadge Component
 *
 * Displays individual achievement badges for gamification.
 */

import { cn } from "@/lib/utils"
import {
  Flame,
  Trophy,
  Target,
  Shield,
  Star,
  Zap,
  Clock,
  Award,
  type LucideIcon,
} from "lucide-react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { ACHIEVEMENTS, type Achievement } from "./achievements"

export type { Achievement }
export { ACHIEVEMENTS }

const ICON_MAP: Record<string, LucideIcon> = {
  flame: Flame,
  trophy: Trophy,
  target: Target,
  shield: Shield,
  star: Star,
  zap: Zap,
  clock: Clock,
  award: Award,
}

interface AchievementBadgeProps {
  achievementId: string
  earned: boolean
  size?: "sm" | "md" | "lg"
  showTooltip?: boolean
}

export function AchievementBadge({
  achievementId,
  earned,
  size = "md",
  showTooltip = true,
}: AchievementBadgeProps) {
  const achievement = ACHIEVEMENTS[achievementId]
  if (!achievement) return null

  const IconComponent = ICON_MAP[achievement.icon] || Star

  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-14 h-14",
  }

  const iconSizes = {
    sm: 14,
    md: 18,
    lg: 24,
  }

  const badge = (
    <div
      className={cn(
        "rounded-full flex items-center justify-center transition-all",
        sizeClasses[size],
        earned
          ? "bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg"
          : "bg-muted text-muted-foreground opacity-40"
      )}
    >
      <IconComponent
        size={iconSizes[size]}
        className={earned ? "text-white" : "text-muted-foreground"}
      />
    </div>
  )

  if (!showTooltip) return badge

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>{badge}</TooltipTrigger>
        <TooltipContent>
          <div className="text-center">
            <p className="font-medium">{achievement.name}</p>
            <p className="text-xs text-muted-foreground">
              {achievement.description}
            </p>
            {!earned && (
              <p className="text-xs text-muted-foreground mt-1">Not earned yet</p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

interface AchievementGridProps {
  earnedIds: string[]
  showAll?: boolean
}

export function AchievementGrid({ earnedIds, showAll = false }: AchievementGridProps) {
  const allIds = Object.keys(ACHIEVEMENTS)
  const displayIds = showAll ? allIds : earnedIds

  if (displayIds.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-4">
        No achievements yet. Keep gaming mindfully!
      </p>
    )
  }

  return (
    <div className="flex flex-wrap gap-2">
      {displayIds.map((id) => (
        <AchievementBadge
          key={id}
          achievementId={id}
          earned={earnedIds.includes(id)}
        />
      ))}
    </div>
  )
}
