import type { Workout } from '@/types'
import { WORKOUT_LABELS } from '@/types/workout'

interface WorkoutCardProps {
  workout: Workout
}

export const WorkoutCard = ({ workout }: WorkoutCardProps) => {
  return (
    <div className="rounded-lg border border-blue-100 bg-blue-50 p-3">
      <p className="text-xs font-medium text-blue-600">Today&apos;s workout</p>
      <p className="mt-1 text-lg font-semibold text-blue-700">{WORKOUT_LABELS[workout.type]}</p>
    </div>
  )
}

export default WorkoutCard
