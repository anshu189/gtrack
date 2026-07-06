import { create } from 'zustand'
import type { WeightEntry } from '@/types'
import { weightRepository } from '@/lib/repositories/weightRepository'

type WeightState = {
  todayEntry?: WeightEntry
  recentEntries: WeightEntry[]
  loading: boolean
  error?: string | null
  loadToday: (dateIso: string) => Promise<void>
  loadRecent: (limit?: number) => Promise<void>
  upsert: (entry: WeightEntry) => Promise<void>
}

export const useWeightStore = create<WeightState>((set) => ({
  recentEntries: [],
  loading: false,
  error: null,

  loadToday: async (dateIso: string) => {
    set({ loading: true, error: null })
    try {
      const entry = await weightRepository.getByDate(dateIso)
      set({ todayEntry: entry, loading: false })
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : String(e)
      set({ loading: false, error: message })
    }
  },

  loadRecent: async (limit = 7) => {
    try {
      const items = await weightRepository.listRecent(limit)
      set({ recentEntries: items })
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : String(e)
      set({ error: message })
    }
  },

  upsert: async (entry: WeightEntry) => {
    const saved = await weightRepository.upsert(entry)
    set({ todayEntry: saved })
    const items = await weightRepository.listRecent(7)
    set({ recentEntries: items })
  },
}))
