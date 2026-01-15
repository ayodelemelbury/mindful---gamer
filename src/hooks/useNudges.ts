import { useState, useCallback, useMemo } from 'react'
import { useBudgetStore } from '../store/budgetStore'

const NUDGE_MESSAGES = {
  approaching: "You're approaching your daily limit. Consider wrapping up soon.",
  exceeded: "You've exceeded your daily budget. Time for a break?",
  halfwayWeek: "You've used half your weekly budget. Pace yourself!",
}

export function useNudges() {
  const [dismissed, setDismissed] = useState<Set<string>>(new Set())
  const dailyBudget = useBudgetStore((s) => s.dailyBudget)

  // Derive nudge from state without using setState in useEffect
  const nudge = useMemo(() => {
    const ratio = dailyBudget.current / dailyBudget.limit
    if (ratio >= 1 && !dismissed.has(NUDGE_MESSAGES.exceeded)) {
      return NUDGE_MESSAGES.exceeded
    } else if (ratio >= 0.8 && ratio < 1 && !dismissed.has(NUDGE_MESSAGES.approaching)) {
      return NUDGE_MESSAGES.approaching
    }
    return null
  }, [dailyBudget, dismissed])

  const dismiss = useCallback(() => {
    if (nudge) {
      setDismissed((prev) => new Set(prev).add(nudge))
    }
  }, [nudge])

  return { nudge, dismiss }
}
