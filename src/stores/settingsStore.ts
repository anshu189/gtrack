import { create } from 'zustand'
import type { PersonalProfile, UserSettings } from '@/types'
import { settingsRepository } from '@/lib/repositories'

type SettingsState = {
  settings?: UserSettings
  loading: boolean
  error?: string | null
  load: () => Promise<void>
  save: (s: UserSettings) => Promise<void>
  saveProfile: (patch: Partial<PersonalProfile>) => Promise<void>
  clear: () => Promise<void>
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
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

  /**
   * Merges into settings.profile and leaves everything else untouched. The
   * repository writes the whole document, so the current settings are read
   * first — saving a profile must never drop the nutrition targets.
   */
  saveProfile: async (patch: Partial<PersonalProfile>) => {
    set({ loading: true, error: null })
    try {
      const current = get().settings ?? (await settingsRepository.get())
      const next: UserSettings = {
        ...current,
        unitSystem: current?.unitSystem ?? 'metric',
        profile: { ...current?.profile, ...patch },
      }
      await settingsRepository.save(next)
      set({ settings: next, loading: false })
    } catch (e: any) {
      set({ loading: false, error: e?.message ?? String(e) })
      throw e
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
