import { Button } from "@/components/ui/button"

export type TimePeriod = "this-week" | "last-week" | "this-month" | "last-30-days"

interface PeriodSelectorProps {
  value: TimePeriod
  onChange: (value: TimePeriod) => void
}

export function PeriodSelector({ value, onChange }: PeriodSelectorProps) {
  const periods: { value: TimePeriod; label: string }[] = [
    { value: "this-week", label: "This Week" },
    { value: "last-week", label: "Last Week" },
    { value: "this-month", label: "This Month" },
    // { value: "last-30-days", label: "Last 30 Days" }, // keeping simple for now
  ]

  return (
    <div className="flex gap-1 bg-muted p-1 rounded-lg inline-flex">
      {periods.map((period) => (
        <Button
          key={period.value}
          variant={value === period.value ? "secondary" : "ghost"}
          size="sm"
          className="h-7 text-xs"
          onClick={() => onChange(period.value)}
        >
          {period.label}
        </Button>
      ))}
    </div>
  )
}
