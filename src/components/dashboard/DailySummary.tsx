import type { WorkoutType } from '@/types'
import { WORKOUT_LABELS } from '@/types/workout'

interface DailySummaryCardProps {
  label: string
  value: string | number
  unit?: string
}

const DailySummaryCard = ({ label, value, unit }: DailySummaryCardProps) => (
  <div className="border border-slate-200 bg-white p-4">
    <p className="text-xs font-medium text-slate-500">{label}</p>
    <p className="mt-1 text-xl font-bold text-slate-950">
      {value}
      {unit && <span className="ml-1 text-sm font-normal text-slate-500">{unit}</span>}
    </p>
  </div>
)

interface DailySummaryProps {
  mealsCount: number
  totalCalories: number
  workoutType?: WorkoutType
  waterTotal?: number
  waterGoal?: number
}

export const DailySummary = ({
  mealsCount,
  totalCalories,
  workoutType,
  waterTotal = 0,
  waterGoal = 2000,
}: DailySummaryProps) => {
  const workoutStatus = workoutType ? WORKOUT_LABELS[workoutType] : 'Not set'
  const waterStatus = waterTotal > 0 ? `${Math.round(waterTotal)} / ${waterGoal} ml` : 'Not logged'

  return (
    <div className="grid grid-cols-2 gap-3">
      <DailySummaryCard label="Meals" value={mealsCount} />
      <DailySummaryCard label="Calories" value={Math.round(totalCalories)} unit="kcal" />
      <DailySummaryCard label="Workout" value={workoutStatus} />
      <DailySummaryCard label="Water" value={waterStatus} />
    </div>
  )
}

export default DailySummary
