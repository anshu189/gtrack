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
    if (all.length) return all[0]
    return {
      id: 'settings:default',
      unitSystem: 'metric' as const,
      nutritionTargets: { calories: 3300, protein: 120, carbs: 420, fat: 95, fiber: 35 },
      waterGoalMl: 2000,
    }
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
