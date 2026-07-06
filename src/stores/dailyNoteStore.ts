import { create } from 'zustand'
import type { DailyNote } from '@/types'
import { dailyNoteRepository } from '@/lib/repositories/dailyNoteRepository'

type DailyNoteState = {
  note?: DailyNote
  loading: boolean
  error?: string | null
  loadByDate: (dateIso: string) => Promise<void>
  save: (note: DailyNote) => Promise<void>
  delete: (id: string) => Promise<void>
}

export const useDailyNoteStore = create<DailyNoteState>((set) => ({
  loading: false,
  error: null,

  loadByDate: async (dateIso: string) => {
    set({ loading: true, error: null })
    try {
      const note = await dailyNoteRepository.getByDate(dateIso)
      set({ note, loading: false })
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : String(e)
      set({ loading: false, error: message })
    }
  },

  save: async (note: DailyNote) => {
    await dailyNoteRepository.upsert(note)
    set({ note })
  },

  delete: async (id: string) => {
    await dailyNoteRepository.delete(id)
    set({ note: undefined })
  },
}))
