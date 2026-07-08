import type { WorkoutType } from '@/types'
import { WORKOUT_TYPES, WORKOUT_LABELS } from '@/types/workout'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils/cn'

interface WorkoutLoggingProps {
  selectedType?: WorkoutType
  onSelect: (type: WorkoutType) => void
}

export const WorkoutLogging = ({ selectedType, onSelect }: WorkoutLoggingProps) => {
  return (
    <div className="grid grid-cols-2 gap-2">
      {WORKOUT_TYPES.map((type) => (
        <Button
          key={type}
          variant="outline"
          className={cn(
            'w-full',
            selectedType === type && 'border-black text-white bg-black dark:border-[#FDFDFD] dark:text-[#FDFDFD] dark:bg-[#1F1F1F]',
          )}
          onClick={() => onSelect(type)}
        >
          {WORKOUT_LABELS[type]}
        </Button>
      ))}
    </div>
  )
}
