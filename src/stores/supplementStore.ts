import { create } from 'zustand'
import type { Supplement } from '@/types'
import { supplementRepository } from '@/lib/repositories'

type SupplementState = {
  supplements: Supplement[]
  /** True once the first load has landed, so screens can tell empty from not-yet-loaded. */
  loaded: boolean
  loading: boolean
  error?: string | null
  load: () => Promise<void>
  create: (input: Omit<Supplement, 'id' | 'order' | 'createdAt' | 'updatedAt'>) => Promise<Supplement>
  update: (id: string, patch: Partial<Supplement>) => Promise<void>
  remove: (id: string) => Promise<void>
}

export const useSupplementStore = create<SupplementState>((set, get) => ({
  supplements: [],
  loaded: false,
  loading: false,
  error: null,

  load: async () => {
    set({ loading: true, error: null })
    try {
      const items = await supplementRepository.listAll()
      set({ supplements: items, loaded: true, loading: false })
    } catch (e: any) {
      set({ loading: false, error: e?.message ?? String(e) })
    }
  },

  /** New supplements go to the end of the row. */
  create: async (input) => {
    const order = get().supplements.reduce((max, s) => Math.max(max, s.order + 1), 0)
    const created = await supplementRepository.create({ ...input, order })
    set((s) => ({ supplements: [...s.supplements, created] }))
    return created
  },

  update: async (id, patch) => {
    await supplementRepository.update(id, patch)
    set((s) => ({ supplements: s.supplements.map((x) => (x.id === id ? { ...x, ...patch } : x)) }))
  },

  remove: async (id) => {
    await supplementRepository.delete(id)
    set((s) => ({ supplements: s.supplements.filter((x) => x.id !== id) }))
  },
}))
