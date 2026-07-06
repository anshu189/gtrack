import { create } from 'zustand'
import type { QuantityPreset } from '@/types'
import { quantityPresetRepository } from '@/lib/repositories'

type QuantityPresetState = {
  presets: QuantityPreset[]
  loading: boolean
  error?: string | null
  loadAll: () => Promise<void>
  listByUnit: (unit: string) => Promise<void>
  add: (p: QuantityPreset) => Promise<void>
  update: (id: string, patch: Partial<QuantityPreset>) => Promise<void>
  remove: (id: string) => Promise<void>
}

export const useQuantityPresetStore = create<QuantityPresetState>((set) => ({
  presets: [],
  loading: false,
  error: null,

  loadAll: async () => {
    set({ loading: true, error: null })
    try {
      const items = await quantityPresetRepository.listAll()
      set({ presets: items, loading: false })
    } catch (e: any) {
      set({ loading: false, error: e?.message ?? String(e) })
    }
  },

  listByUnit: async (unit: string) => {
    set({ loading: true, error: null })
    try {
      const items = await quantityPresetRepository.listByUnit(unit)
      set({ presets: items, loading: false })
    } catch (e: any) {
      set({ loading: false, error: e?.message ?? String(e) })
    }
  },

  add: async (p: QuantityPreset) => {
    await quantityPresetRepository.add(p)
    set((s) => ({ presets: [...s.presets, p] }))
  },

  update: async (id: string, patch: Partial<QuantityPreset>) => {
    await quantityPresetRepository.update(id, patch)
    set((s) => ({ presets: s.presets.map((it) => (it.id === id ? { ...it, ...patch } : it)) }))
  },

  remove: async (id: string) => {
    await quantityPresetRepository.delete(id)
    set((s) => ({ presets: s.presets.filter((it) => it.id !== id) }))
  },
}))
