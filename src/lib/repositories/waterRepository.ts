import db from '@/lib/db'
import type { WaterLog } from '@/types'

export class WaterRepository {
  async getById(id: string) {
    return db.waterLogs.get(id)
  }

  async listByDate(dateIso: string) {
    return db.waterLogs.where('date').equals(dateIso).toArray()
  }

  async getTotalForDate(dateIso: string): Promise<number> {
    const logs = await this.listByDate(dateIso)
    return logs.reduce((sum, log) => sum + log.amount, 0)
  }

  async listAll() {
    return db.waterLogs.orderBy('timestamp').reverse().toArray()
  }

  async add(log: WaterLog) {
    await db.waterLogs.add(log)
  }

  async delete(id: string) {
    await db.waterLogs.delete(id)
  }
}

export const waterRepository = new WaterRepository()
