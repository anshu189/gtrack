import db from '@/lib/db'
import type { DailyNote } from '@/types'

export class DailyNoteRepository {
  async getById(id: string) {
    return db.dailyNotes.get(id)
  }

  async getByDate(dateIso: string) {
    return db.dailyNotes.where('date').equals(dateIso).first()
  }

  async listAll() {
    return db.dailyNotes.orderBy('date').reverse().toArray()
  }

  async add(note: DailyNote) {
    await db.dailyNotes.add(note)
  }

  async update(id: string, patch: Partial<DailyNote>) {
    await db.dailyNotes.update(id, { ...patch, updatedAt: new Date().toISOString() })
  }

  async delete(id: string) {
    await db.dailyNotes.delete(id)
  }

  async upsert(note: DailyNote) {
    const existing = await this.getByDate(note.date)
    if (existing) {
      await this.update(existing.id, note)
    } else {
      await this.add(note)
    }
  }
}

export const dailyNoteRepository = new DailyNoteRepository()
