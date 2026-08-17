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
    return <p className="text-sm text-[#96A0AB]">No previous workouts logged.</p>
  }

  return (
    <div className="rounded-lg border border-[#24292D] overflow-hidden">
      {items.map((workout, i) => (
        <div
          key={workout.id}
          className={cn(
            'flex items-center justify-between px-3 py-2.5 text-sm',
            i % 2 === 0 ? 'bg-[#101314]' : 'bg-[#1a1d20]',
            i > 0 && 'border-t border-[#24292D]',
          )}
        >
          <span className="font-semibold text-[#E8F1F6]">{formatDate(workout.date)}</span>
          <span className="text-[#96A0AB]">{WORKOUT_LABELS[workout.type]}</span>
        </div>
      ))}
    </div>
  )
}

export default WorkoutHistory
