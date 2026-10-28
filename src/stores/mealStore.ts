import { create } from 'zustand'
import type { Meal, DeletedMealEntry, Supplement } from '@/types'
import { mealRepository } from '@/lib/repositories'
import { buildSupplementItems, quantitiesFrom, supplementLogId } from '@/lib/utils/supplements'

type MealState = {
  meals: Meal[]
  deletedMeals: DeletedMealEntry[]
  loading: boolean
  error?: string | null
  loadAll: () => Promise<void>
  loadByDateRange: (fromIso: string, toIso: string) => Promise<void>
  loadDeleted: () => Promise<void>
  getById: (id: string) => Promise<Meal | undefined>
  add: (meal: Meal) => Promise<void>
  create: (input: Partial<Meal>) => Promise<Meal>
  update: (id: string, patch: Partial<Meal>) => Promise<void>
  remove: (id: string) => Promise<void>
  removeWithUndo: (id: string) => Promise<void>
  restoreDeleted: (deleteId: string) => Promise<void>
  dismissUndo: (deleteId: string) => void
  setSupplementQuantity: (date: string, supplements: Supplement[], supplementId: string, quantity: number) => Promise<void>
}

export const useMealStore = create<MealState>((set, get) => ({
  meals: [],
  deletedMeals: [],
  loading: false,
  error: null,

  loadAll: async () => {
    set({ loading: true, error: null })
    try {
      const items = await mealRepository.listAll()
      set({ meals: items, loading: false })
    } catch (e: any) {
      set({ loading: false, error: e?.message ?? String(e) })
    }
  },

  loadByDateRange: async (fromIso: string, toIso: string) => {
    set({ loading: true, error: null })
    try {
      const items = await mealRepository.listByDateRange(fromIso, toIso)
      set({ meals: items, loading: false })
    } catch (e: any) {
      set({ loading: false, error: e?.message ?? String(e) })
    }
  },

  loadDeleted: async () => {
    try {
      const items = await mealRepository.listDeleted()
      set({ deletedMeals: items })
    } catch (e: any) {
      // silent
    }
  },

  getById: async (id: string) => {
    const cached = get().meals.find((m) => m.id === id)
    if (cached) return cached
    const found = await mealRepository.getById(id)
    if (found) set((s) => ({ meals: [...s.meals.filter((m) => m.id !== id), found] }))
    return found
  },

  add: async (meal: Meal) => {
    await mealRepository.add(meal)
    set((s) => ({ meals: [...s.meals, meal] }))
  },

  create: async (input: Partial<Meal>) => {
    const created = await mealRepository.create(input)
    set((s) => ({ meals: [...s.meals, created] }))
    return created
  },

  update: async (id: string, patch: Partial<Meal>) => {
    await mealRepository.update(id, patch)
    set((s) => ({ meals: s.meals.map((m) => (m.id === id ? { ...m, ...patch } : m)) }))
  },

  remove: async (id: string) => {
    await mealRepository.delete(id)
    set((s) => ({ meals: s.meals.filter((m) => m.id !== id) }))
  },

  removeWithUndo: async (id: string) => {
    const meal = get().meals.find((m) => m.id === id)
    if (!meal) return
    await mealRepository.deleteSoft(meal)
    set((s) => ({
      meals: s.meals.filter((m) => m.id !== id),
      deletedMeals: [...s.deletedMeals.filter((d) => d.id !== id), {
        id: meal.id,
        meal,
        deletedAt: new Date().toISOString(),
        originalLoggedAt: meal.loggedAt,
      }],
    }))
  },

  restoreDeleted: async (deleteId: string) => {
    const entry = get().deletedMeals.find((d) => d.id === deleteId)
    if (!entry) return
    await mealRepository.restoreDeleted(deleteId)
    set((s) => ({
      meals: [...s.meals, entry.meal],
      deletedMeals: s.deletedMeals.filter((d) => d.id !== deleteId),
    }))
  },

  dismissUndo: (deleteId: string) => {
    set((s) => ({ deletedMeals: s.deletedMeals.filter((d) => d.id !== deleteId) }))
  },

  /**
   * One tap on the Supplements row. The day's supplements document is rebuilt
   * from the new quantity and written whole; when nothing is left it is
   * deleted, so a day you took nothing has no document at all.
   *
   * State changes before the write, so a run of quick taps each builds on the
   * last one. Firestore applies a client's writes in the order they were
   * issued, so the last tap is the one that lands.
   */
  setSupplementQuantity: async (date, supplements, supplementId, quantity) => {
    const id = supplementLogId(date)
    const existing = get().meals.find((m) => m.id === id)
    const quantities = { ...quantitiesFrom(existing), [supplementId]: Math.max(0, quantity) }
    const items = buildSupplementItems(supplements, quantities, existing?.items)
    const now = new Date().toISOString()

    if (items.length === 0) {
      set((s) => ({ meals: s.meals.filter((m) => m.id !== id) }))
      if (existing) await mealRepository.delete(id)
      return
    }

    const meal: Meal = {
      id,
      kind: 'supplements',
      name: 'Supplements',
      loggedAt: `${date}T12:00:00Z`,
      items,
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
    }
    set((s) => ({ meals: existing ? s.meals.map((m) => (m.id === id ? meal : m)) : [...s.meals, meal] }))
    await mealRepository.add(meal)
  },
}))
