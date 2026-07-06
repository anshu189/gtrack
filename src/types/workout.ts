export type WorkoutID = string

export type WorkoutType = 'push' | 'pull' | 'legs' | 'rest'

export const WORKOUT_TYPES: WorkoutType[] = ['push', 'pull', 'legs', 'rest']

export const WORKOUT_LABELS: Record<WorkoutType, string> = {
  push: 'Push',
  pull: 'Pull',
  legs: 'Legs',
  rest: 'Rest',
}

export interface Workout {
  id: WorkoutID
  date: string
  type: WorkoutType
  createdAt?: string
  updatedAt?: string
}
