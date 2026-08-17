import type { NutritionStatus } from '@/lib/services/nutritionCalculation'
import { useNutritionStatus } from '@/hooks/useNutrition'
import { formatNum } from '@/lib/utils/format'
import { ProgressBar } from '@astryxdesign/core'

interface NutritionProgressBarProps {
  label: string
  actual: number
  target: number
  unit?: string
}

const NutritionProgressBar = ({ label, actual, target, unit = 'g' }: NutritionProgressBarProps) => {
  const percentage = Math.min((actual / target) * 100, 100)

  return (
    <div>
      <ProgressBar label={label} value={actual} max={target} />
      <div className="mt-1 flex justify-between text-xs text-[var(--color-muted)]">
        <span>{formatNum(actual)} / {formatNum(target)} {unit}</span>
      </div>
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
    return <p className="text-sm text-[var(--color-muted)]">No nutrition data</p>
  }

  if (compact) {
    return (
      <div className="flex items-center justify-between gap-2 text-xs">
        <div>
          <span className="font-medium text-[var(--color-text)]">{formatNum(status.actual.calories)}</span>
          <span className="text-[var(--color-muted)]"> / {status.target?.calories ?? 2000} kcal</span>
        </div>
        <div className="text-[var(--color-muted)]">
          {statusStrings?.calories ?? 'On target'} &middot; P: {formatNum(status.actual.protein)}g &middot; C:{' '}
          {formatNum(status.actual.carbs)}g &middot; F: {formatNum(status.actual.fat)}g
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-4 grid grid-cols-4 gap-3">
        <div className="bg-[var(--color-surface-alt)] p-3 text-center">
          <p className="text-lg font-bold text-[var(--color-text)]">{formatNum(status.actual.calories)}</p>
          <p className="text-xs text-[var(--color-muted)]">kcal</p>
          <p className="text-xs text-[var(--color-muted)]">{formatNum(status.percentage.calories)}%</p>
        </div>
        <div className="bg-[var(--color-surface-alt)] p-3 text-center">
          <p className="text-lg font-bold text-[var(--color-text)]">{formatNum(status.actual.protein)}</p>
          <p className="text-xs text-[var(--color-muted)]">protein</p>
          <p className="text-xs text-[var(--color-muted)]">{formatNum(status.percentage.protein)}%</p>
        </div>
        <div className="bg-[var(--color-surface-alt)] p-3 text-center">
          <p className="text-lg font-bold text-[var(--color-text)]">{formatNum(status.actual.carbs)}</p>
          <p className="text-xs text-[var(--color-muted)]">carbs</p>
          <p className="text-xs text-[var(--color-muted)]">{formatNum(status.percentage.carbs)}%</p>
        </div>
        <div className="bg-[var(--color-surface-alt)] p-3 text-center">
          <p className="text-lg font-bold text-[var(--color-text)]">{formatNum(status.actual.fat)}</p>
          <p className="text-xs text-[var(--color-muted)]">fat</p>
          <p className="text-xs text-[var(--color-muted)]">{formatNum(status.percentage.fat)}%</p>
        </div>
      </div>

      <div className="space-y-3">
        <NutritionProgressBar label="Calories" actual={status.actual.calories} target={status.target?.calories ?? 2000} unit="kcal" />
        <NutritionProgressBar label="Protein" actual={status.actual.protein} target={status.target?.protein ?? 150} unit="g" />
        <NutritionProgressBar label="Carbs" actual={status.actual.carbs} target={status.target?.carbs ?? 250} unit="g" />
        <NutritionProgressBar label="Fat" actual={status.actual.fat} target={status.target?.fat ?? 70} unit="g" />
      </div>

      {statusStrings && (
        <div className="mt-4 bg-[var(--color-surface-alt)] p-3">
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-[var(--color-muted)]">
            <span><span className="font-medium text-[var(--color-text-muted)]">Calories:</span> {statusStrings.calories}</span>
            <span><span className="font-medium text-[var(--color-text-muted)]">Protein:</span> {statusStrings.protein}</span>
            <span><span className="font-medium text-[var(--color-text-muted)]">Carbs:</span> {statusStrings.carbs}</span>
            <span><span className="font-medium text-[var(--color-text-muted)]">Fat:</span> {statusStrings.fat}</span>
          </div>
        </div>
      )}
    </div>
  )
}

export default NutritionSummary
