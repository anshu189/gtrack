import { create } from 'zustand'
import type { WaterLog } from '@/types'
import { waterRepository } from '@/lib/repositories/waterRepository'

type WaterState = {
  waterLogs: WaterLog[]
  totalToday: number
  loading: boolean
  error?: string | null
  loadByDate: (dateIso: string) => Promise<void>
  getTotalForDate: (dateIso: string) => Promise<number>
  add: (log: WaterLog) => Promise<void>
  remove: (id: string) => Promise<void>
}

export const useWaterStore = create<WaterState>((set) => ({
  waterLogs: [],
  totalToday: 0,
  loading: false,
  error: null,

  loadByDate: async (dateIso: string) => {
    set({ loading: true, error: null })
    try {
      const items = await waterRepository.listByDate(dateIso)
      const total = await waterRepository.getTotalForDate(dateIso)
      set({ waterLogs: items, totalToday: total, loading: false })
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : String(e)
      set({ loading: false, error: message })
    }
  },

  getTotalForDate: async (dateIso: string) => {
    return waterRepository.getTotalForDate(dateIso)
  },

  add: async (log: WaterLog) => {
    await waterRepository.add(log)
    set((s) => ({ waterLogs: [...s.waterLogs, log], totalToday: s.totalToday + log.amount }))
  },

  remove: async (id: string) => {
    const log = await waterRepository.getById(id)
    if (log) {
      await waterRepository.delete(id)
      set((s) => ({
        waterLogs: s.waterLogs.filter((w) => w.id !== id),
        totalToday: s.totalToday - log.amount,
      }))
    }
  },
}))
