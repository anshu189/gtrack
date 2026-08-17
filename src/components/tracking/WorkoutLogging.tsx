import type { WorkoutType } from '@/types'
import { WORKOUT_TYPES, WORKOUT_LABELS } from '@/types/workout'
import { cn } from '@/lib/utils/cn'

interface WorkoutLoggingProps {
  selectedType?: WorkoutType
  onSelect: (type: WorkoutType) => void
}

export const WorkoutLogging = ({ selectedType, onSelect }: WorkoutLoggingProps) => {
  return (
    <div className="grid grid-cols-2 gap-2">
      {WORKOUT_TYPES.map((type) => (
        <button
          key={type}
          type="button"
          className={cn(
            'w-full py-2 px-4 rounded-lg text-sm font-medium border transition-colors',
            selectedType === type
              ? 'bg-[#E8F1F6] text-[#101314] border-[#E8F1F6]'
              : 'bg-transparent text-[#E8F1F6] border-[#24292D] hover:bg-[#24292D]',
          )}
          onClick={() => onSelect(type)}
        >
          {WORKOUT_LABELS[type]}
        </button>
      ))}
    </div>
  )
}
