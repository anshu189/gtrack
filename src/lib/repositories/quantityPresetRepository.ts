import db from '@/lib/db'
import type { QuantityPreset } from '@/types'

export interface QuantityPresetRepository {
  getById(id: string): Promise<QuantityPreset | undefined>
  listAll(): Promise<QuantityPreset[]>
  listByUnit(unit: string): Promise<QuantityPreset[]>
  add(p: QuantityPreset): Promise<void>
  update(id: string, patch: Partial<QuantityPreset>): Promise<void>
  delete(id: string): Promise<void>
}

export class DexieQuantityPresetRepository implements QuantityPresetRepository {
  async getById(id: string) {
    return db.quantityPresets.get(id)
  }

  async listAll() {
    return db.quantityPresets.orderBy('label').toArray()
  }

  async listByUnit(unit: string) {
    return db.quantityPresets.where('unit').equals(unit).toArray()
  }

  async add(p: QuantityPreset) {
    await db.quantityPresets.add(p)
  }

  async update(id: string, patch: Partial<QuantityPreset>) {
    await db.quantityPresets.update(id, { ...patch, updatedAt: new Date().toISOString() })
  }

  async delete(id: string) {
    await db.quantityPresets.delete(id)
  }
}

export const quantityPresetRepository = new DexieQuantityPresetRepository()
