import db from '@/lib/db'
import type { Food } from '@/types'
import { foodSearchService } from '@/lib/search/foodSearch'

export type FoodSearchResult = Pick<Food, 'id' | 'name' | 'category' | 'nutrition'>

export interface FoodRepository {
  getById(id: string): Promise<Food | undefined>
  listAll(): Promise<Food[]>
  add(food: Food): Promise<void>
  createCustom(input: Partial<Food>): Promise<Food>
  update(id: string, patch: Partial<Food>): Promise<void>
  delete(id: string): Promise<void>
  searchByName(q: string): Promise<FoodSearchResult[]>
}

function generateId() {
  try {
    // browser crypto
    // @ts-ignore
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') return `food:custom:${crypto.randomUUID()}`
  } catch (e) {
    // ignore
  }
  return `food:custom:${Date.now()}-${Math.floor(Math.random() * 10000)}`
}

export class DexieFoodRepository implements FoodRepository {
  async getById(id: string) {
    return db.foods.get(id)
  }

  async listAll() {
    return db.foods.orderBy('name').toArray()
  }

  async add(food: Food) {
    await db.foods.add(food)
    // refresh search index
    await foodSearchService.refreshIfStale()
  }

  async createCustom(input: Partial<Food>) {
    const now = new Date().toISOString()
    const id = input.id ?? generateId()
    const food: Food = {
      id,
      name: input.name ?? 'Custom food',
      category: input.category,
      servingSize: input.servingSize ?? input.measures?.[0]?.grams ?? input.measures?.[0]?.quantity ?? 100,
      servingUnit: input.servingUnit ?? input.measures?.[0]?.unit ?? 'g',
      measures: input.measures ?? [],
      isCustom: true,
      source: 'Custom',
      nutrition: input.nutrition ?? { calories: 0, protein: 0, carbs: 0, fat: 0 },
      aliases: input.aliases ?? [],
      notes: input.notes,
      tags: input.tags ?? [],
      createdAt: now,
      updatedAt: now,
    }
    await db.foods.put(food)
    await foodSearchService.refreshIfStale()
    return food
  }

  async update(id: string, patch: Partial<Food>) {
    await db.foods.update(id, { ...patch, updatedAt: new Date().toISOString() })
    await foodSearchService.refreshIfStale()
    // persist override to localStorage
    if (patch.nutrition) {
      try {
        const stored = localStorage.getItem('gtrak:macroOverrides')
        const overrides: Record<string, import('@/types').Nutrition> = stored ? JSON.parse(stored) : {}
        overrides[id] = { ...(overrides[id] ?? {}), ...patch.nutrition }
        localStorage.setItem('gtrak:macroOverrides', JSON.stringify(overrides))
      } catch (e) {
        // ignore storage errors
      }
    }
  }

  async delete(id: string) {
    await db.foods.delete(id)
    await foodSearchService.refreshIfStale()
  }

  async searchByName(q: string) {
    const term = q.trim().toLowerCase()
    if (!term) return []
    // Simple in-memory filter for now — can be optimized with an index or full-text later
    const all = await db.foods.toArray()
    return all
      .filter((f) => f.name.toLowerCase().includes(term) || (f.aliases || []).some((a) => a.toLowerCase().includes(term)))
      .map((f) => ({ id: f.id, name: f.name, category: f.category, nutrition: f.nutrition }))
  }
}

export const foodRepository = new DexieFoodRepository()
