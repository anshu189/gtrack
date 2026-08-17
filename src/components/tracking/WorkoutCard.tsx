import type { Workout } from '@/types'
import { WORKOUT_LABELS } from '@/types/workout'

interface WorkoutCardProps {
  workout: Workout
}

export const WorkoutCard = ({ workout }: WorkoutCardProps) => {
  return (
    <div className="rounded-lg border border-[#24292D] bg-[#101314] p-3">
      <p className="text-md font-medium text-[#E8F1F6]">{WORKOUT_LABELS[workout.type] ?? workout.type}</p>
      <p className="text-sm text-[#96A0AB] mt-1">
        {new Date(workout.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
      </p>
    </div>
  )
}
