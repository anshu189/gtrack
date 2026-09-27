import type { Workout } from '@/types'
import { WORKOUT_LABELS } from '@/types/workout'
import { cn } from '@/lib/utils/cn'

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
    return <p className="footnote text-ink-2">No previous workouts logged.</p>
  }

  return (
    <div className="overflow-hidden rounded-md">
      {items.map((workout, i) => (
        <div
          key={workout.id}
          className={cn(
            'flex items-center justify-between px-3 py-2.5 text-sm',
            i % 2 === 0 ? 'bg-surface' : 'bg-surface-2',
            i > 0 && 'border-t border-line',
          )}
        >
          <span className="footnote text-black">{formatDate(workout.date)}</span>
          <span className="footnote text-ink-2">{WORKOUT_LABELS[workout.type]}</span>
        </div>
      ))}
    </div>
  )
}

export default WorkoutHistory
