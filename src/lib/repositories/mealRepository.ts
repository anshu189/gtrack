import db from '@/lib/db'
import type { Meal, DeletedMealEntry } from '@/types'

export interface MealRepository {
  getById(id: string): Promise<Meal | undefined>
  listAll(): Promise<Meal[]>
  listByDateRange(fromIso: string, toIso: string): Promise<Meal[]>
  add(meal: Meal): Promise<void>
  create(input: Partial<Meal>): Promise<Meal>
  update(id: string, patch: Partial<Meal>): Promise<void>
  delete(id: string): Promise<void>
  deleteSoft(meal: Meal): Promise<void>
  restoreDeleted(deleteId: string): Promise<void>
  listDeleted(): Promise<DeletedMealEntry[]>
  purgeExpiredDeletions(): Promise<void>
}

function generateId() {
  try {
    // @ts-ignore
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') return `meal:${crypto.randomUUID()}`
  } catch (e) {
    // ignore
  }
  return `meal:${Date.now()}-${Math.floor(Math.random() * 10000)}`
}

export class DexieMealRepository implements MealRepository {
  async getById(id: string) {
    return db.meals.get(id)
  }

  async listAll() {
    return db.meals.orderBy('loggedAt').toArray()
  }

  async listByDateRange(fromIso: string, toIso: string) {
    // loggedAt is an ISO string; do a filter in-memory for correctness and simplicity
    const items = await db.meals.where('loggedAt').between(fromIso, toIso, true, true).toArray()
    return items
  }

  async add(meal: Meal) {
    await db.meals.add(meal)
  }

  async create(input: Partial<Meal>): Promise<Meal> {
    const now = new Date().toISOString()
    const meal: Meal = {
      id: input.id ?? generateId(),
      name: input.name ?? 'Meal',
      loggedAt: input.loggedAt ?? now,
      items: input.items ?? [],
      notes: input.notes,
      createdAt: now,
      updatedAt: now,
    }
    await db.meals.add(meal)
    return meal
  }

  async update(id: string, patch: Partial<Meal>) {
    await db.meals.update(id, { ...patch, updatedAt: new Date().toISOString() })
  }

  async delete(id: string) {
    await db.meals.delete(id)
  }

  getMidnight(): string {
    const d = new Date()
    d.setHours(0, 0, 0, 0)
    return d.toISOString()
  }

  async deleteSoft(meal: Meal): Promise<void> {
    const now = new Date().toISOString()
    const entry: DeletedMealEntry = {
      id: meal.id,
      meal: { ...meal },
      deletedAt: now,
      originalLoggedAt: meal.loggedAt,
    }
    await db.deletedMeals.put(entry)
    await db.meals.delete(meal.id)
  }

  async restoreDeleted(deleteId: string): Promise<void> {
    const entry = await db.deletedMeals.get(deleteId)
    if (!entry) return
    await db.meals.add(entry.meal)
    await db.deletedMeals.delete(deleteId)
  }

  async listDeleted(): Promise<DeletedMealEntry[]> {
    await this.purgeExpiredDeletions()
    return db.deletedMeals.toArray()
  }

  async purgeExpiredDeletions(): Promise<void> {
    const midnight = this.getMidnight()
    await db.deletedMeals.where('deletedAt').below(midnight).delete()
  }
}

export const mealRepository = new DexieMealRepository()
