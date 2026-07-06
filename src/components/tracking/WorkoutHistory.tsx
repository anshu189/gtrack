import type { Workout } from '@/types'
import { WORKOUT_LABELS } from '@/types/workout'

interface WorkoutHistoryProps {
  workouts: Workout[]
  excludeDate?: string
}

function formatDate(dateIso: string) {
  return new Date(`${dateIso}T12:00:00`).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })
}

export const WorkoutHistory = ({ workouts, excludeDate }: WorkoutHistoryProps) => {
  const items = workouts.filter((w) => w.date !== excludeDate)

  if (items.length === 0) {
    return <p className="text-sm text-slate-500">No previous workouts logged.</p>
  }

  return (
    <ul className="divide-y divide-slate-100 rounded-lg border border-slate-200">
      {items.map((workout) => (
        <li key={workout.id} className="flex items-center justify-between px-3 py-2 text-sm">
          <span className="text-slate-500">{formatDate(workout.date)}</span>
          <span className="font-medium text-slate-950">{WORKOUT_LABELS[workout.type]}</span>
        </li>
      ))}
    </ul>
  )
}

export default WorkoutHistory
