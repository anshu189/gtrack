import db from '@/lib/db'
import type { Workout } from '@/types'

export class WorkoutRepository {
  async getById(id: string) {
    return db.workouts.get(id)
  }

  async getByDate(dateIso: string) {
    return db.workouts.where('date').equals(dateIso).first()
  }

  async listByDate(dateIso: string) {
    return db.workouts.where('date').equals(dateIso).toArray()
  }

  async listRecent(limit = 7) {
    return db.workouts.orderBy('date').reverse().limit(limit).toArray()
  }

  async listAll() {
    return db.workouts.orderBy('date').reverse().toArray()
  }

  async add(workout: Workout) {
    await db.workouts.add(workout)
  }

  async update(id: string, patch: Partial<Workout>) {
    await db.workouts.update(id, { ...patch, updatedAt: new Date().toISOString() })
  }

  async delete(id: string) {
    await db.workouts.delete(id)
  }

  async upsert(workout: Workout): Promise<Workout> {
    const existing = await this.getByDate(workout.date)
    if (existing) {
      await this.update(existing.id, { type: workout.type })
      return { ...existing, type: workout.type, updatedAt: new Date().toISOString() }
    }
    await this.add(workout)
    return workout
  }
}

export const workoutRepository = new WorkoutRepository()
