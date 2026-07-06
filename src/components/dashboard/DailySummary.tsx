import React from 'react'
import { Card } from '@/components/ui/card'
import type { WorkoutType } from '@/types'
import { WORKOUT_LABELS } from '@/types/workout'

interface DailySummaryCardProps {
  label: string
  value: string | number
  unit?: string
}

export const DailySummaryCard: React.FC<DailySummaryCardProps> = ({ label, value, unit }) => {
  return (
    <Card className="rounded-sm border border-slate-200 p-3 shadow-sm">
      <div className="text-xs font-medium text-slate-500">{label}</div>
      <div className="mt-1 text-lg font-bold text-slate-950">
        {value}
        {unit && <span className="ml-1 text-sm font-normal text-slate-500">{unit}</span>}
      </div>
    </Card>
  )
}


interface DailySummaryProps {
  mealsCount: number
  totalCalories: number
  workoutType?: WorkoutType
  waterTotal?: number
  waterGoal?: number
}

export const DailySummary: React.FC<DailySummaryProps> = ({
  mealsCount,
  totalCalories,
  workoutType,
  waterTotal = 0,
  waterGoal = 2000,
}) => {
  const workoutStatus = workoutType ? WORKOUT_LABELS[workoutType] : 'Not set'
  const waterStatus = waterTotal > 0 ? `${Math.round(waterTotal)} / ${waterGoal} ml` : 'Not logged'

  return (
    <div className="grid grid-cols-2 gap-2">
      <DailySummaryCard label="Meals" value={mealsCount} />
      <DailySummaryCard label="Calories" value={Math.round(totalCalories)} unit="kcal" />
      <DailySummaryCard label="Workout" value={workoutStatus} />
      <DailySummaryCard label="Water" value={waterStatus} />
    </div>
  )
}

export default DailySummary