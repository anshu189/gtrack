import { create } from 'zustand'
import type { UserSettings } from '@/types'
import { settingsRepository } from '@/lib/repositories'

type SettingsState = {
  settings?: UserSettings
  loading: boolean
  error?: string | null
  load: () => Promise<void>
  save: (s: UserSettings) => Promise<void>
  clear: () => Promise<void>
}

export const useSettingsStore = create<SettingsState>((set) => ({ 
  settings: undefined,
  loading: false,
  error: null,

  load: async () => {
    set({ loading: true, error: null })
    try {
      const s = await settingsRepository.get()
      set({ settings: s, loading: false })
    } catch (e: any) {
      set({ loading: false, error: e?.message ?? String(e) })
    }
  },

  save: async (s: UserSettings) => {
    set({ loading: true, error: null })
    try {
      await settingsRepository.save(s)
      set({ settings: s, loading: false })
    } catch (e: any) {
      set({ loading: false, error: e?.message ?? String(e) })
    }
  },

  clear: async () => {
    set({ loading: true, error: null })
    try {
      await settingsRepository.clear()
      set({ settings: undefined, loading: false })
    } catch (e: any) {
      set({ loading: false, error: e?.message ?? String(e) })
    }
  },
}))
