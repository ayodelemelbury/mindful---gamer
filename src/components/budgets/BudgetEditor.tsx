import { Card, CardContent } from '@/components/ui/card'
import { Slider } from '@/components/ui/slider'

interface BudgetEditorProps {
  label: string
  value: number
  min?: number
  max?: number
  step?: number
  onChange: (value: number) => void
}

export function BudgetEditor({ label, value, min = 30, max = 480, step = 15, onChange }: BudgetEditorProps) {
  const hours = Math.floor(value / 60)
  const mins = value % 60

  return (
    <Card>
      <CardContent className="pt-4">
        <div className="flex justify-between items-center mb-3">
          <span className="text-sm font-medium text-foreground">{label}</span>
          <span className="text-lg font-semibold text-primary">
            {hours > 0 && `${hours}h `}{mins > 0 && `${mins}m`}
          </span>
        </div>
        <Slider
          min={min}
          max={max}
          step={step}
          value={[value]}
          onValueChange={(values: number[]) => onChange(values[0])}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-muted-foreground mt-2">
          <span>{Math.floor(min / 60)}h</span>
          <span>{Math.floor(max / 60)}h</span>
        </div>
      </CardContent>
    </Card>
  )
}

