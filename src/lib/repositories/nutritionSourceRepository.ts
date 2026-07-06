import db from '@/lib/db'
import type { NutritionSource } from '@/types'

export interface NutritionSourceRepository {
  getById(id: string): Promise<NutritionSource | undefined>
  listAll(): Promise<NutritionSource[]>
  add(s: NutritionSource): Promise<void>
  update(id: string, patch: Partial<NutritionSource>): Promise<void>
  delete(id: string): Promise<void>
}

export class DexieNutritionSourceRepository implements NutritionSourceRepository {
  async getById(id: string) {
    return db.nutritionSources.get(id)
  }

  async listAll() {
    return db.nutritionSources.orderBy('name').toArray()
  }

  async add(s: NutritionSource) {
    await db.nutritionSources.add(s)
  }

  async update(id: string, patch: Partial<NutritionSource>) {
    await db.nutritionSources.update(id, { ...patch, updatedAt: new Date().toISOString() })
  }

  async delete(id: string) {
    await db.nutritionSources.delete(id)
  }
}

export const nutritionSourceRepository = new DexieNutritionSourceRepository()
