import type { WorkoutType } from '@/types'
import { WORKOUT_TYPES, WORKOUT_LABELS } from '@/types/workout'
import { SegmentedControl } from '@/components/ds'

interface WorkoutLoggingProps {
  selectedType?: WorkoutType
  onSelect: (type: WorkoutType) => void
}

/**
 * Push / Pull / Legs / Rest is four short, mutually exclusive options — exactly
 * what the DS SegmentedControl is specified for (2–5 options, selected segment
 * lifts to a white pill).
 */
export const WorkoutLogging = ({ selectedType, onSelect }: WorkoutLoggingProps) => (
  <SegmentedControl
    label="Workout type"
    value={selectedType}
    onChange={onSelect}
    options={WORKOUT_TYPES.map((type) => ({ value: type, label: WORKOUT_LABELS[type] }))}
  />
)
