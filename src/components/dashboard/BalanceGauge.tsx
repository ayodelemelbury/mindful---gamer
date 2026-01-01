import { motion } from 'framer-motion'
import { formatDuration } from '../../lib/formatDuration'
import type { GaugeState } from '../../types'

interface BalanceGaugeProps {
  current: number
  limit: number
}

function getGaugeState(ratio: number): GaugeState {
  if (ratio < 0.7) return 'safe'
  if (ratio < 1) return 'caution'
  return 'exceeded'
}

// Using Matsu theme chart colors
const stateColors: Record<GaugeState, string> = {
  safe: 'oklch(0.68 0.16 184.9)', // chart-2 (teal/green)
  caution: 'oklch(0.85 0.19 85.4)', // chart-4 (amber)
  exceeded: 'oklch(0.63 0.24 29.2)', // destructive
}

export function BalanceGauge({ current, limit }: BalanceGaugeProps) {
  const ratio = Math.min(current / limit, 1.2)
  const state = getGaugeState(ratio)
  const percentage = Math.min(ratio * 100, 100)
  const circumference = 2 * Math.PI * 45
  const strokeDashoffset = circumference - (percentage / 100) * circumference
  const displayCurrent = current > 90 ? formatDuration(current) : current

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-40 h-40">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="45" fill="none" className="stroke-muted" strokeWidth="8" />
          <motion.circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke={stateColors[state]}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-semibold text-foreground">{displayCurrent}</span>
          <span className="text-sm text-muted-foreground">/ {limit} min</span>
        </div>
      </div>
      <p className="mt-3 text-sm text-muted-foreground capitalize">{state === 'safe' ? 'On track' : state}</p>
    </div>
  )
}

