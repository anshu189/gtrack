import { create } from 'zustand'
import type { HistoryEntry } from '@/types'
import { historyRepository } from '@/lib/repositories'

type HistoryState = {
  items: HistoryEntry[]
  loading: boolean
  error?: string | null
  loadAll: () => Promise<void>
  listByType: (type: string) => Promise<void>
  add: (entry: HistoryEntry) => Promise<void>
  remove: (id: string) => Promise<void>
}

export const useHistoryStore = create<HistoryState>((set) => ({ 
  items: [],
  loading: false,
  error: null,

  loadAll: async () => {
    set({ loading: true, error: null })
    try {
      const items = await historyRepository.listAll()
      set({ items, loading: false })
    } catch (e: any) {
      set({ loading: false, error: e?.message ?? String(e) })
    }
  },

  listByType: async (type: string) => {
    set({ loading: true, error: null })
    try {
      const items = await historyRepository.listByType(type)
      set({ items, loading: false })
    } catch (e: any) {
      set({ loading: false, error: e?.message ?? String(e) })
    }
  },

  add: async (entry: HistoryEntry) => {
    await historyRepository.add(entry)
    set((s) => ({ items: [entry, ...s.items] }))
  },

  remove: async (id: string) => {
    await historyRepository.delete(id)
    set((s) => ({ items: s.items.filter((i) => i.id !== id) }))
  },
}))
