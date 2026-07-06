import Fuse from 'fuse.js'
import { foodRepository } from '@/lib/repositories'
import type { Food } from '@/types'

type SearchResult = { item: Food; score?: number }

class FoodSearchService {
  private fuse: Fuse<Food> | null = null
  private items: Food[] = []
  loading = false

  async rebuildIndex() {
    this.loading = true
    try {
      this.items = await foodRepository.listAll()
      const options: any = {
        keys: [
          { name: 'name', weight: 0.7 },
          { name: 'aliases', weight: 0.6 },
          { name: 'tags', weight: 0.5 },
          { name: 'category', weight: 0.3 },
        ],
        threshold: 0.35,
        includeScore: true,
        ignoreLocation: true,
      }
      this.fuse = new Fuse(this.items, options)
    } finally {
      this.loading = false
    }
  }

  async search(query: string, limit = 25): Promise<SearchResult[]> {
    if (!query || query.trim().length === 0) {
      return this.items.slice(0, limit).map((f) => ({ item: f, score: 0 }))
    }

    if (!this.fuse) {
      await this.rebuildIndex()
    }
    if (!this.fuse) return []

    const res = this.fuse.search(query, { limit })
    return res.map((r) => ({ item: r.item, score: r.score }))
  }

  async refreshIfStale() {
    // Simple refresh hook: always rebuild. Caller can decide throttling.
    await this.rebuildIndex()
  }

  getAll() {
    return this.items
  }
}

export const foodSearchService = new FoodSearchService()
export default foodSearchService
