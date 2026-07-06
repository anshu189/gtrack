import db from '@/lib/db'
import type { UserSettings } from '@/types'

export interface SettingsRepository {
  get(): Promise<UserSettings | undefined>
  save(s: UserSettings): Promise<void>
  clear(): Promise<void>
}

export class DexieSettingsRepository implements SettingsRepository {
  async get() {
    const all = await db.settings.toArray()
    return all.length ? all[0] : undefined
  }

  async save(s: UserSettings) {
    const now = new Date().toISOString()
    const payload = { ...s, updatedAt: now, createdAt: s.createdAt ?? now }
    if (s.id) {
      await db.settings.put(payload)
    } else {
      // generate simple id if missing
      await db.settings.add({ ...payload, id: `settings:default` })
    }
  }

  async clear() {
    await db.settings.clear()
  }
}

export const settingsRepository = new DexieSettingsRepository()
