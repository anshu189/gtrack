import { create } from 'zustand'
import type { NutritionSource } from '@/types'
import { nutritionSourceRepository } from '@/lib/repositories'

type NutritionSourceState = {
  items: NutritionSource[]
  loading: boolean
  error?: string | null
  loadAll: () => Promise<void>
  add: (s: NutritionSource) => Promise<void>
  update: (id: string, patch: Partial<NutritionSource>) => Promise<void>
  remove: (id: string) => Promise<void>
}

export const useNutritionSourceStore = create<NutritionSourceState>((set) => ({
  items: [],
  loading: false,
  error: null,

  loadAll: async () => {
    set({ loading: true, error: null })
    try {
      const items = await nutritionSourceRepository.listAll()
      set({ items, loading: false })
    } catch (e: any) {
      set({ loading: false, error: e?.message ?? String(e) })
    }
  },

  add: async (s: NutritionSource) => {
    await nutritionSourceRepository.add(s)
    set((st) => ({ items: [...st.items, s] }))
  },

  update: async (id: string, patch: Partial<NutritionSource>) => {
    await nutritionSourceRepository.update(id, patch)
    set((st) => ({ items: st.items.map((it) => (it.id === id ? { ...it, ...patch } : it)) }))
  },

  remove: async (id: string) => {
    await nutritionSourceRepository.delete(id)
    set((st) => ({ items: st.items.filter((it) => it.id !== id) }))
  },
}))
