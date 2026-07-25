import { create } from 'zustand'
import type { RespectLog } from '@/types'
import { respectRepository } from '@/lib/repositories/respectRepository'

type RespectState = {
  todayLog: RespectLog | null
  loading: boolean
  error?: string | null
  loadByDate: (dateIso: string) => Promise<void>
  upsert: (patch: Partial<RespectLog>) => Promise<void>
}

export const useRespectStore = create<RespectState>((set) => ({
  todayLog: null,
  loading: false,
  error: null,

  loadByDate: async (dateIso: string) => {
    set({ loading: true, error: null })
    try {
      const log = await respectRepository.getByDate(dateIso)
      set({ todayLog: log ?? null, loading: false })
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : String(e)
      set({ loading: false, error: message })
    }
  },

  upsert: async (patch: Partial<RespectLog>) => {
    const saved = await respectRepository.upsert(patch)
    set({ todayLog: saved })
  },
}))
