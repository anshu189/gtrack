import db from '@/lib/db'
import type { Favorite } from '@/types'

export interface FavoriteRepository {
  listAll(): Promise<Favorite[]>
  add(foodId: string): Promise<Favorite>
  removeByFoodId(foodId: string): Promise<void>
  isFavorite(foodId: string): Promise<boolean>
}

export class DexieFavoriteRepository implements FavoriteRepository {
  async listAll() {
    return db.favorites.orderBy('createdAt').reverse().toArray()
  }

  async add(foodId: string) {
    const id = `fav:${foodId}`
    const now = new Date().toISOString()
    const fav = { id, foodId, createdAt: now }
    await db.favorites.put(fav)
    return fav
  }

  async removeByFoodId(foodId: string) {
    const id = `fav:${foodId}`
    await db.favorites.delete(id)
  }

  async isFavorite(foodId: string) {
    const id = `fav:${foodId}`
    const hit = await db.favorites.get(id)
    return !!hit
  }
}

export const favoriteRepository = new DexieFavoriteRepository()
