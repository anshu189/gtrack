import type { Workout } from '@/types'
import { WORKOUT_LABELS } from '@/types/workout'

interface WorkoutCardProps {
  workout: Workout
}

export const WorkoutCard = ({ workout }: WorkoutCardProps) => {
  return (
    <div className="rounded-md bg-surface-2 p-4">
      <p className="headline text-black">{WORKOUT_LABELS[workout.type] ?? workout.type}</p>
      <p className="footnote text-ink-2 mt-1">
        {new Date(workout.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
      </p>
    </div>
  )
}
