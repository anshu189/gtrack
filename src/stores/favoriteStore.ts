import { create } from 'zustand'
import { favoriteRepository } from '@/lib/repositories'
import type { Favorite } from '@/types'

type FavoriteState = {
  favorites: Favorite[]
  loading: boolean
  error?: string | null
  loadAll: () => Promise<void>
  isFavorite: (foodId: string) => Promise<boolean>
  add: (foodId: string) => Promise<void>
  remove: (foodId: string) => Promise<void>
}

export const useFavoriteStore = create<FavoriteState>((set) => ({
  favorites: [],
  loading: false,
  error: null,

  loadAll: async () => {
    set({ loading: true, error: null })
    try {
      const items = await favoriteRepository.listAll()
      set({ favorites: items, loading: false })
    } catch (e: any) {
      set({ loading: false, error: e?.message ?? String(e) })
    }
  },

  isFavorite: async (foodId: string) => {
    return favoriteRepository.isFavorite(foodId)
  },

  add: async (foodId: string) => {
    const fav = await favoriteRepository.add(foodId)
    set((s) => ({ favorites: [fav, ...s.favorites] }))
  },

  remove: async (foodId: string) => {
    await favoriteRepository.removeByFoodId(foodId)
    set((s) => ({ favorites: s.favorites.filter((f) => f.foodId !== foodId) }))
  },
}))
