import type { NutritionStatus } from '@/lib/services/nutritionCalculation'
import { useNutritionStatus } from '@/hooks/useNutrition'
import { ProgressBar, ProgressRing } from '@/components/ds'

interface NutritionProgressBarProps {
  label: string
  actual: number
  target: number
  unit?: string
  /** DS data colour for this macro. */
  color?: string
}

const NutritionProgressBar = ({ label, actual, target, unit = 'g', color }: NutritionProgressBarProps) => {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-baseline justify-between">
        <span className="footnote text-black">{label}</span>
        <span className="label-text text-ink-2">
          {unit === 'g'
            ? `${Math.round(actual)} / ${Math.round(target)}g`
            : `${Math.round(actual)} / ${Math.round(target)} kcal`}
        </span>
      </div>
      <ProgressBar label={label} value={actual} max={target} color={color} />
    </div>
  )
}

interface NutritionSummaryProps {
  status: NutritionStatus | null
  compact?: boolean
}

export const NutritionSummary = ({ status, compact = false }: NutritionSummaryProps) => {
  const statusStrings = useNutritionStatus(status)

  if (!status) {
    return <p className="text-sm text-ink-2">No nutrition data</p>
  }

  if (compact) {
    return (
      <div className="flex items-center justify-between gap-2 text-xs">
        <div>
          <span className="font-medium text-black">{Math.round(status.actual.calories)}</span>
          <span className="text-ink-2"> / {status.target?.calories ?? 2000} kcal</span>
        </div>
        <div className="text-ink-2">
          {statusStrings?.calories ?? 'On target'} &middot; P: {Math.round(status.actual.protein)}g &middot; C:{' '}
          {Math.round(status.actual.carbs)}g &middot; F: {Math.round(status.actual.fat)}g
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Same ring treatment as the Dashboard nutrition card. Each prints its
          own label, so colour never carries the meaning on its own. */}
      <div className="mb-6 grid grid-cols-4 gap-3">
        {([
          { key: 'calories', label: 'Calories', actual: status.actual.calories, goal: status.target?.calories ?? 2000, pct: status.percentage.calories, color: 'var(--ink)' },
          { key: 'protein', label: 'Protein', actual: status.actual.protein, goal: status.target?.protein ?? 150, pct: status.percentage.protein, color: 'var(--protein)' },
          { key: 'carbs', label: 'Carbs', actual: status.actual.carbs, goal: status.target?.carbs ?? 250, pct: status.percentage.carbs, color: 'var(--carbs)' },
          { key: 'fat', label: 'Fat', actual: status.actual.fat, goal: status.target?.fat ?? 70, pct: status.percentage.fat, color: 'var(--fat)' },
        ]).map((m) => (
          <div key={m.key} className="flex flex-col items-center gap-2">
            <ProgressRing
              value={m.actual}
              max={m.goal}
              size={68}
              stroke={6}
              color={m.color}
              label={`${m.label}: ${Math.round(m.pct)}% of goal`}
            >
              <span className="footnote text-black">{Math.round(m.pct)}%</span>
            </ProgressRing>
            <p className="caption text-ink-2">{m.label}</p>
          </div>
        ))}
      </div>

      <div className="space-y-3">
        <NutritionProgressBar label="Calories" actual={status.actual.calories} target={status.target?.calories ?? 2000} unit="kcal" color="var(--ink)" />
        <NutritionProgressBar label="Protein" actual={status.actual.protein} target={status.target?.protein ?? 150} unit="g" color="var(--protein)" />
        <NutritionProgressBar label="Carbs" actual={status.actual.carbs} target={status.target?.carbs ?? 250} unit="g" color="var(--carbs)" />
        <NutritionProgressBar label="Fat" actual={status.actual.fat} target={status.target?.fat ?? 70} unit="g" color="var(--fat)" />
      </div>

      {statusStrings && (
        <div className="mt-4 bg-surface-2 p-3">
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink-2">
            <span><span className="font-medium text-ink-2">Calories:</span> {statusStrings.calories}</span>
            <span><span className="font-medium text-ink-2">Protein:</span> {statusStrings.protein}</span>
            <span><span className="font-medium text-ink-2">Carbs:</span> {statusStrings.carbs}</span>
            <span><span className="font-medium text-ink-2">Fat:</span> {statusStrings.fat}</span>
          </div>
        </div>
      )}
    </div>
  )
}

export default NutritionSummary
