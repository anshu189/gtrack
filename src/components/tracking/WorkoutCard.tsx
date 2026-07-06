import React from 'react'
import type { Workout } from '@/types'
import { WORKOUT_LABELS } from '@/types/workout'
import { Card } from '@/components/ui/card'

interface WorkoutCardProps {
  workout: Workout
}

export const WorkoutCard: React.FC<WorkoutCardProps> = ({ workout }) => {
  return (
    <Card className="rounded-sm border border-slate-200 p-3 shadow-sm">
      <div className="text-xs text-slate-500">Today&apos;s workout</div>
      <div className="mt-1 text-lg font-semibold text-slate-950">{WORKOUT_LABELS[workout.type]}</div>
    </Card>
  )
}

export default WorkoutCard
