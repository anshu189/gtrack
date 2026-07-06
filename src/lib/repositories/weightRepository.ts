import db from '@/lib/db'
import type { WeightEntry } from '@/types'

export class WeightRepository {
  async getById(id: string) {
    return db.weights.get(id)
  }

  async getByDate(dateIso: string) {
    return db.weights.where('date').equals(dateIso).first()
  }

  async getLatestEntry() {
    return db.weights.orderBy('date').last()
  }

  async listRecent(limit = 7) {
    return db.weights.orderBy('date').reverse().limit(limit).toArray()
  }

  async listAll() {
    return db.weights.orderBy('date').reverse().toArray()
  }

  async add(entry: WeightEntry) {
    await db.weights.add(entry)
  }

  async update(id: string, patch: Partial<WeightEntry>) {
    await db.weights.update(id, { ...patch, updatedAt: new Date().toISOString() })
  }

  async delete(id: string) {
    await db.weights.delete(id)
  }

  async upsert(entry: WeightEntry): Promise<WeightEntry> {
    const existing = await this.getByDate(entry.date)
    if (existing) {
      await this.update(existing.id, {
        weight: entry.weight,
        unit: entry.unit,
        notes: entry.notes,
      })
      return {
        ...existing,
        weight: entry.weight,
        unit: entry.unit,
        notes: entry.notes,
        updatedAt: new Date().toISOString(),
      }
    }
    await this.add(entry)
    return entry
  }
}

export const weightRepository = new WeightRepository()
