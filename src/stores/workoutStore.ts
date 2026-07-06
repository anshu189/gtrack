import { create } from 'zustand'
import type { Workout, WorkoutType } from '@/types'
import { workoutRepository } from '@/lib/repositories/workoutRepository'

type WorkoutState = {
  todayWorkout?: Workout
  recentWorkouts: Workout[]
  loading: boolean
  error?: string | null
  loadToday: (dateIso: string) => Promise<void>
  loadRecent: (limit?: number) => Promise<void>
  setWorkoutType: (dateIso: string, type: WorkoutType) => Promise<void>
}

export const useWorkoutStore = create<WorkoutState>((set) => ({
  recentWorkouts: [],
  loading: false,
  error: null,

  loadToday: async (dateIso: string) => {
    set({ loading: true, error: null })
    try {
      const workout = await workoutRepository.getByDate(dateIso)
      set({ todayWorkout: workout, loading: false })
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : String(e)
      set({ loading: false, error: message })
    }
  },

  loadRecent: async (limit = 7) => {
    try {
      const items = await workoutRepository.listRecent(limit)
      set({ recentWorkouts: items })
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : String(e)
      set({ error: message })
    }
  },

  setWorkoutType: async (dateIso: string, type: WorkoutType) => {
    const now = new Date().toISOString()
    const workout: Workout = {
      id: `workout:${dateIso}`,
      date: dateIso,
      type,
      createdAt: now,
      updatedAt: now,
    }
    const saved = await workoutRepository.upsert(workout)
    set({ todayWorkout: saved })
    const items = await workoutRepository.listRecent(7)
    set({ recentWorkouts: items })
  },
}))
