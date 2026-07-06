import db from '@/lib/db'
import type { HistoryEntry } from '@/types'

export interface HistoryRepository {
  getById(id: string): Promise<HistoryEntry | undefined>
  listAll(): Promise<HistoryEntry[]>
  listByType(type: string): Promise<HistoryEntry[]>
  add(entry: HistoryEntry): Promise<void>
  delete(id: string): Promise<void>
}

export class DexieHistoryRepository implements HistoryRepository {
  async getById(id: string) {
    return db.history.get(id)
  }

  async listAll() {
    return db.history.orderBy('loggedAt').reverse().toArray()
  }

  async listByType(type: string) {
    return db.history.where('type').equals(type).toArray()
  }

  async add(entry: HistoryEntry) {
    await db.history.add(entry)
  }

  async delete(id: string) {
    await db.history.delete(id)
  }

  /**
   * List recent distinct food IDs derived from meal history ordered by most recent occurrence.
   * Returns up to `limit` distinct food IDs.
   */
  async listRecentFoodIds(limit = 20): Promise<string[]> {
    const all = await db.history.orderBy('loggedAt').reverse().toArray()
    const allMeals = all.filter((e) => (e as any).type === 'meal')
    const seen = new Set<string>()
    const result: string[] = []

    for (const entry of allMeals) {
      // mealSnapshot should exist for meal history entries
      // @ts-ignore - runtime shape check
      const meal = (entry as any).mealSnapshot
      if (!meal || !Array.isArray(meal.items)) continue
      for (const item of meal.items) {
        if (!item || !item.foodId) continue
        if (!seen.has(item.foodId)) {
          seen.add(item.foodId)
          result.push(item.foodId)
          if (result.length >= limit) return result
        }
      }
    }

    return result
  }

  /**
   * Resolve recent foods (Food objects) using Food repository
   */
  async listRecentFoods(limit = 20) {
    const ids = await this.listRecentFoodIds(limit)
    const foods = [] as any[]
    for (const id of ids) {
      // fetch each food; if missing skip
      // eslint-disable-next-line no-await-in-loop
      const f = await db.foods.get(id)
      if (f) foods.push(f)
    }
    return foods
  }
}

export const historyRepository = new DexieHistoryRepository()
