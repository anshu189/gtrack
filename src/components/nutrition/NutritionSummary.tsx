import type { NutritionStatus } from '@/lib/services/nutritionCalculation'
import { useNutritionStatus } from '@/hooks/useNutrition'

interface NutritionProgressBarProps {
  label: string
  actual: number
  target: number
  unit?: string
}

const NutritionProgressBar = ({ label, actual, target, unit = 'g' }: NutritionProgressBarProps) => {
  const percentage = Math.min((actual / target) * 100, 100)
  const isOver = actual > target
  const barColor = isOver ? 'bg-orange-500' : percentage > 80 ? 'bg-green-500' : 'bg-blue-500'

  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-xs font-medium">
        <span className="text-slate-600">{label}</span>
        <span className="text-slate-500">
          {Math.round(actual)} / {Math.round(target)} {unit}
        </span>
      </div>
      <div className="h-2 w-full rounded-full bg-slate-100">
        <div
          className={`${barColor} h-2 rounded-full transition-all`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
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
    return <p className="text-sm text-slate-500">No nutrition data</p>
  }

  if (compact) {
    return (
      <div className="flex items-center justify-between gap-2 text-xs">
        <div>
          <span className="font-medium text-slate-950">{Math.round(status.actual.calories)}</span>
          <span className="text-slate-500"> / {status.target?.calories ?? 2000} kcal</span>
        </div>
        <div className="text-slate-500">
          {statusStrings?.calories ?? 'On target'} &middot; P: {Math.round(status.actual.protein)}g &middot; C:{' '}
          {Math.round(status.actual.carbs)}g &middot; F: {Math.round(status.actual.fat)}g
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-4 grid grid-cols-4 gap-3">
        <div className="rounded-lg bg-slate-50 p-3 text-center">
          <p className="text-lg font-bold text-slate-950">{Math.round(status.actual.calories)}</p>
          <p className="text-xs text-slate-500">kcal</p>
          <p className="text-xs text-slate-400">{Math.round(status.percentage.calories)}%</p>
        </div>
        <div className="rounded-lg bg-slate-50 p-3 text-center">
          <p className="text-lg font-bold text-slate-950">{Math.round(status.actual.protein)}</p>
          <p className="text-xs text-slate-500">protein</p>
          <p className="text-xs text-slate-400">{Math.round(status.percentage.protein)}%</p>
        </div>
        <div className="rounded-lg bg-slate-50 p-3 text-center">
          <p className="text-lg font-bold text-slate-950">{Math.round(status.actual.carbs)}</p>
          <p className="text-xs text-slate-500">carbs</p>
          <p className="text-xs text-slate-400">{Math.round(status.percentage.carbs)}%</p>
        </div>
        <div className="rounded-lg bg-slate-50 p-3 text-center">
          <p className="text-lg font-bold text-slate-950">{Math.round(status.actual.fat)}</p>
          <p className="text-xs text-slate-500">fat</p>
          <p className="text-xs text-slate-400">{Math.round(status.percentage.fat)}%</p>
        </div>
      </div>

      <div className="space-y-3">
        <NutritionProgressBar label="Calories" actual={status.actual.calories} target={status.target?.calories ?? 2000} unit="kcal" />
        <NutritionProgressBar label="Protein" actual={status.actual.protein} target={status.target?.protein ?? 150} unit="g" />
        <NutritionProgressBar label="Carbs" actual={status.actual.carbs} target={status.target?.carbs ?? 250} unit="g" />
        <NutritionProgressBar label="Fat" actual={status.actual.fat} target={status.target?.fat ?? 70} unit="g" />
      </div>

      {statusStrings && (
        <div className="mt-4 rounded-lg bg-slate-50 p-3">
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-600">
            <span><span className="font-medium text-slate-700">Calories:</span> {statusStrings.calories}</span>
            <span><span className="font-medium text-slate-700">Protein:</span> {statusStrings.protein}</span>
            <span><span className="font-medium text-slate-700">Carbs:</span> {statusStrings.carbs}</span>
            <span><span className="font-medium text-slate-700">Fat:</span> {statusStrings.fat}</span>
          </div>
        </div>
      )}
    </div>
  )
}

export default NutritionSummary
