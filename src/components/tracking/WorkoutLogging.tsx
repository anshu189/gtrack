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
          variant={selectedType === type ? 'default' : 'outline'}
          className={cn('w-full', selectedType === type && 'ring-2 ring-blue-600 ring-offset-1')}
          onClick={() => onSelect(type)}
        >
          {WORKOUT_LABELS[type]}
        </Button>
      ))}
    </div>
  )
}

export default WorkoutLogging
