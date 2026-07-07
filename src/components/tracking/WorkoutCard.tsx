import type { Workout } from '@/types'
import { WORKOUT_LABELS } from '@/types/workout'

interface WorkoutCardProps {
  workout: Workout
}

export const WorkoutCard = ({ workout }: WorkoutCardProps) => {
  return (
    <div className="border border-slate-300 bg-neutral-50 p-3">
      <p className="text-sm font-medium text-slate-950">{WORKOUT_LABELS[workout.type] ?? workout.type}</p>
      <p className="text-sm text-slate-500 mt-1">
        {new Date(workout.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
      </p>
    </div>
  )
}
