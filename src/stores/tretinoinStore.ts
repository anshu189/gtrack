import { create } from 'zustand'
import type { TretinoinLog } from '@/types'
import { tretinoinRepository } from '@/lib/repositories/tretinoinRepository'

type TretinoinState = {
  logs: TretinoinLog[]
  todayLog: TretinoinLog | null
  loading: boolean
  error?: string | null
  loadByDate: (dateIso: string) => Promise<void>
  loadAll: () => Promise<void>
  setApplied: (dateIso: string, applied: boolean) => Promise<void>
}

export const useTretinoinStore = create<TretinoinState>((set) => ({
  logs: [],
  todayLog: null,
  loading: false,
  error: null,

  loadByDate: async (dateIso: string) => {
    set({ loading: true, error: null })
    try {
      const items = await tretinoinRepository.listByDate(dateIso)
      const todayLog = items.length > 0 ? items[0] : null
      set({ logs: items, todayLog, loading: false })
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : String(e)
      set({ loading: false, error: message })
    }
  },

  loadAll: async () => {
    set({ loading: true, error: null })
    try {
      const items = await tretinoinRepository.listAll()
      set({ logs: items, loading: false })
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : String(e)
      set({ loading: false, error: message })
    }
  },

  setApplied: async (dateIso: string, applied: boolean) => {
    const now = new Date().toISOString()
    const id = `tret:${dateIso}`
    const log: TretinoinLog = {
      id,
      date: dateIso,
      applied,
      timestamp: now,
      createdAt: now,
      updatedAt: now,
    }
    await tretinoinRepository.add(log)
    set({ todayLog: log, logs: [log] })
  },
}))
