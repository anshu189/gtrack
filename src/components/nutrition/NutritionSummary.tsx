import React from 'react'
import type { NutritionStatus } from '@/lib/services/nutritionCalculation'
import { useNutritionStatus } from '@/hooks/useNutrition'

interface NutritionProgressBarProps {
  label: string
  actual: number
  target: number
  unit?: string
}

const NutritionProgressBar: React.FC<NutritionProgressBarProps> = ({ label, actual, target, unit = 'g' }) => {
  const percentage = Math.min((actual / target) * 100, 100)
  const isOver = actual > target
  const barColor = isOver ? 'bg-orange-500' : percentage > 80 ? 'bg-green-500' : 'bg-blue-500'

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between text-xs font-medium">
        <span>{label}</span>
        <span className="text-gray-600">
          {Math.round(actual)} / {Math.round(target)} {unit}
        </span>
      </div>
      <div className="w-full bg-gray-100 rounded-full h-2">
        <div className={`${barColor} h-2 rounded-full transition-all`} style={{ width: `${Math.min(percentage, 100)}%` }} />
      </div>
    </div>
  )
}

interface NutritionSummaryProps {
  status: NutritionStatus | null
  compact?: boolean
}

export const NutritionSummary: React.FC<NutritionSummaryProps> = ({ status, compact = false }) => {
  const statusStrings = useNutritionStatus(status)

  if (!status) {
    return <div className="text-sm text-gray-500">No nutrition data</div>
  }

  if (compact) {
    return (
      <div className="flex items-center justify-between text-xs gap-2">
        <div>
          <span className="font-medium">{Math.round(status.actual.calories)}</span> /{' '}
          <span className="text-gray-600">{status.target?.calories ?? 2000}</span> kcal
        </div>
        <div className="text-gray-600">
          {statusStrings?.calories ?? 'On target'} • P: {Math.round(status.actual.protein)}g • C: {Math.round(status.actual.carbs)}g • F: {Math.round(status.actual.fat)}g
        </div>
      </div>
    )
  }

  return (
    <div className="p-3 border border-gray-200 rounded-sm bg-white">
      <h3 className="text-sm font-medium mb-3">Nutrition</h3>

      {/* Main stats */}
      <div className="grid grid-cols-4 gap-2 mb-3">
        <div className="text-center">
          <div className="text-lg font-bold">{Math.round(status.actual.calories)}</div>
          <div className="text-xs text-gray-600">kcal</div>
          <div className="text-xs text-gray-500">{Math.round(status.percentage.calories)}%</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold">{Math.round(status.actual.protein)}</div>
          <div className="text-xs text-gray-600">g protein</div>
          <div className="text-xs text-gray-500">{Math.round(status.percentage.protein)}%</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold">{Math.round(status.actual.carbs)}</div>
          <div className="text-xs text-gray-600">g carbs</div>
          <div className="text-xs text-gray-500">{Math.round(status.percentage.carbs)}%</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold">{Math.round(status.actual.fat)}</div>
          <div className="text-xs text-gray-600">g fat</div>
          <div className="text-xs text-gray-500">{Math.round(status.percentage.fat)}%</div>
        </div>
      </div>

      {/* Progress bars */}
      <div className="flex flex-col gap-2">
        <NutritionProgressBar
          label="Calories"
          actual={status.actual.calories}
          target={status.target?.calories ?? 2000}
          unit="kcal"
        />
        <NutritionProgressBar
          label="Protein"
          actual={status.actual.protein}
          target={status.target?.protein ?? 150}
          unit="g"
        />
        <NutritionProgressBar label="Carbs" actual={status.actual.carbs} target={status.target?.carbs ?? 250} unit="g" />
        <NutritionProgressBar label="Fat" actual={status.actual.fat} target={status.target?.fat ?? 70} unit="g" />
      </div>

      {/* Status summary */}
      {statusStrings && (
        <div className="mt-3 p-2 bg-gray-50 rounded-sm">
          <div className="text-xs flex gap-2">
            <span>
              <strong>Calories:</strong> {statusStrings.calories}
            </span>
            <span>
              <strong>Protein:</strong> {statusStrings.protein}
            </span>
            <span>
              <strong>Carbs:</strong> {statusStrings.carbs}
            </span>
            <span>
              <strong>Fat:</strong> {statusStrings.fat}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}

export default NutritionSummary
