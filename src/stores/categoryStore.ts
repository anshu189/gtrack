import { create } from 'zustand'
import type { Category } from '@/types'
import { categoryRepository } from '@/lib/repositories'

type CategoryState = {
  categories: Category[]
  loading: boolean
  error?: string | null
  loadAll: () => Promise<void>
  add: (c: Category) => Promise<void>
  update: (id: string, patch: Partial<Category>) => Promise<void>
  remove: (id: string) => Promise<void>
}

export const useCategoryStore = create<CategoryState>((set) => ({ 
  categories: [],
  loading: false,
  error: null,

  loadAll: async () => {
    set({ loading: true, error: null })
    try {
      const items = await categoryRepository.listAll()
      set({ categories: items, loading: false })
    } catch (e: any) {
      set({ loading: false, error: e?.message ?? String(e) })
    }
  },

  add: async (c: Category) => {
    await categoryRepository.add(c)
    set((s) => ({ categories: [...s.categories, c] }))
  },

  update: async (id: string, patch: Partial<Category>) => {
    await categoryRepository.update(id, patch)
    set((s) => ({ categories: s.categories.map((cat) => (cat.id === id ? { ...cat, ...patch } : cat)) }))
  },

  remove: async (id: string) => {
    await categoryRepository.delete(id)
    set((s) => ({ categories: s.categories.filter((cat) => cat.id !== id) }))
  },
}))
