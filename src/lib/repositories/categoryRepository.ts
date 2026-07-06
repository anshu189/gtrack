import db from '@/lib/db'
import type { Category } from '@/types'

export interface CategoryRepository {
  getById(id: string): Promise<Category | undefined>
  listAll(): Promise<Category[]>
  add(category: Category): Promise<void>
  update(id: string, patch: Partial<Category>): Promise<void>
  delete(id: string): Promise<void>
}

export class DexieCategoryRepository implements CategoryRepository {
  async getById(id: string) {
    return db.categories.get(id)
  }

  async listAll() {
    return db.categories.orderBy('name').toArray()
  }

  async add(category: Category) {
    await db.categories.add(category)
  }

  async update(id: string, patch: Partial<Category>) {
    await db.categories.update(id, { ...patch, updatedAt: new Date().toISOString() })
  }

  async delete(id: string) {
    await db.categories.delete(id)
  }
}

export const categoryRepository = new DexieCategoryRepository()
