import { create } from 'zustand'
import type { Food } from '@/types'
import { foodRepository } from '@/lib/repositories'

type FoodState = {
  foods: Food[]
  loading: boolean
  error?: string | null
  loadAll: () => Promise<void>
  getById: (id: string) => Promise<Food | undefined>
  add: (food: Food) => Promise<void>
  update: (id: string, patch: Partial<Food>) => Promise<void>
  remove: (id: string) => Promise<void>
  search: (q: string) => Promise<Pick<Food, 'id' | 'name' | 'category' | 'nutrition'>[]>
}

export const useFoodStore = create<FoodState>((set, get) => ({
  foods: [],
  loading: false,
  error: null,

  loadAll: async () => {
    set({ loading: true, error: null })
    try {
      const items = await foodRepository.listAll()
      set({ foods: items, loading: false })
    } catch (e: any) {
      set({ loading: false, error: e?.message ?? String(e) })
    }
  },

  getById: async (id: string) => {
    const cached = get().foods.find((f) => f.id === id)
    if (cached) return cached
    const found = await foodRepository.getById(id)
    if (found) set((s) => ({ foods: [...s.foods.filter((f) => f.id !== id), found] }))
    return found
  },

  add: async (food: Food) => {
    await foodRepository.add(food)
    set((s) => ({ foods: [...s.foods, food] }))
  },

  create: async (input: Partial<Food>) => {
    const created = await foodRepository.createCustom(input)
    set((s) => ({ foods: [...s.foods, created] }))
    return created
  },

  update: async (id: string, patch: Partial<Food>) => {
    await foodRepository.update(id, patch)
    set((s) => ({ foods: s.foods.map((f) => (f.id === id ? { ...f, ...patch } : f)) }))
  },

  remove: async (id: string) => {
    await foodRepository.delete(id)
    set((s) => ({ foods: s.foods.filter((f) => f.id !== id) }))
  },

  search: async (q: string) => {
    return foodRepository.searchByName(q)
  },
}))
