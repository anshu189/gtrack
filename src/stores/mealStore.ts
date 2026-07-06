import { create } from 'zustand'
import type { Meal } from '@/types'
import { mealRepository } from '@/lib/repositories'

type MealState = {
  meals: Meal[]
  loading: boolean
  error?: string | null
  loadAll: () => Promise<void>
  loadByDateRange: (fromIso: string, toIso: string) => Promise<void>
  getById: (id: string) => Promise<Meal | undefined>
  add: (meal: Meal) => Promise<void>
  create: (input: Partial<Meal>) => Promise<Meal>
  update: (id: string, patch: Partial<Meal>) => Promise<void>
  remove: (id: string) => Promise<void>
}

export const useMealStore = create<MealState>((set, get) => ({
  meals: [],
  loading: false,
  error: null,

  loadAll: async () => {
    set({ loading: true, error: null })
    try {
      const items = await mealRepository.listAll()
      set({ meals: items, loading: false })
    } catch (e: any) {
      set({ loading: false, error: e?.message ?? String(e) })
    }
  },

  loadByDateRange: async (fromIso: string, toIso: string) => {
    set({ loading: true, error: null })
    try {
      const items = await mealRepository.listByDateRange(fromIso, toIso)
      set({ meals: items, loading: false })
    } catch (e: any) {
      set({ loading: false, error: e?.message ?? String(e) })
    }
  },

  getById: async (id: string) => {
    const cached = get().meals.find((m) => m.id === id)
    if (cached) return cached
    const found = await mealRepository.getById(id)
    if (found) set((s) => ({ meals: [...s.meals.filter((m) => m.id !== id), found] }))
    return found
  },

  add: async (meal: Meal) => {
    await mealRepository.add(meal)
    set((s) => ({ meals: [...s.meals, meal] }))
  },

  create: async (input: Partial<Meal>) => {
    const created = await mealRepository.create(input)
    set((s) => ({ meals: [...s.meals, created] }))
    return created
  },

  update: async (id: string, patch: Partial<Meal>) => {
    await mealRepository.update(id, patch)
    set((s) => ({ meals: s.meals.map((m) => (m.id === id ? { ...m, ...patch } : m)) }))
  },

  remove: async (id: string) => {
    await mealRepository.delete(id)
    set((s) => ({ meals: s.meals.filter((m) => m.id !== id) }))
  },
}))
