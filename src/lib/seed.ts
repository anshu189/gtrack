import { getDocs, query, limit, writeBatch } from 'firebase/firestore'
import { firestore } from '@/lib/firebase'
import { collFor, docFor } from '@/lib/paths'
import { cleanForFirestore } from '@/lib/utils/firestore'
import builtInFoods from '@/data/builtInFoods'
import builtInCategories from '@/data/categories'
import foodsSeed from '@/data/foodsSeed'
import macroOverrides from '@/data/macroOverrides'
import quantityPresetsSeed from '@/data/quantityPresets'
import nutritionSourcesSeed from '@/data/nutritionSources'
import type { Food, UserSettings } from '@/types'

const BATCH_LIMIT = 490

export const DEFAULT_SETTINGS: UserSettings = {
  id: 'settings:default',
  unitSystem: 'metric',
  theme: 'dark',
  nutritionTargets: { calories: 3300, protein: 120, carbs: 420, fat: 95, fiber: 35 },
  waterGoalMl: 2000,
}

async function isUserCollectionEmpty(uid: string, name: string): Promise<boolean> {
  const snap = await getDocs(query(collFor(uid, name), limit(1)))
  return snap.empty
}

/**
 * Seeds one user's reference data. Each step no-ops when that user's
 * collection already holds documents, so it is safe to run on every sign-in.
 */
export async function provisionUser(uid: string) {
  await seedCategories(uid)
  await seedFoods(uid)
  await seedQuantityPresets(uid)
  await seedNutritionSources(uid)
  await seedSettings(uid)
}

async function seedCategories(uid: string) {
  if (!(await isUserCollectionEmpty(uid, 'categories'))) return
  const batch = writeBatch(firestore)
  const now = new Date().toISOString()
  for (const c of builtInCategories) {
    batch.set(
      docFor(uid, 'categories', c.id),
      cleanForFirestore({ ...c, createdAt: c.createdAt ?? now, updatedAt: c.updatedAt ?? now }),
    )
  }
  await batch.commit()
}

async function seedFoods(uid: string) {
  if (!(await isUserCollectionEmpty(uid, 'foods'))) return
  const combined = [...builtInFoods, ...foodsSeed]
  const now = new Date().toISOString()
  let batch = writeBatch(firestore)
  let count = 0
  for (const f of combined) {
    const override = macroOverrides[f.id]
    const base = { ...f, createdAt: f.createdAt ?? now, updatedAt: now }
    const food: Food = override
      ? { ...base, nutrition: { ...base.nutrition, ...override } }
      : base
    batch.set(docFor(uid, 'foods', food.id), cleanForFirestore(food))
    count++
    if (count >= BATCH_LIMIT) {
      await batch.commit()
      batch = writeBatch(firestore)
      count = 0
    }
  }
  if (count > 0) await batch.commit()
}

async function seedQuantityPresets(uid: string) {
  if (!(await isUserCollectionEmpty(uid, 'quantityPresets'))) return
  const batch = writeBatch(firestore)
  const now = new Date().toISOString()
  for (const p of quantityPresetsSeed) {
    batch.set(
      docFor(uid, 'quantityPresets', p.id),
      cleanForFirestore({ ...p, createdAt: p.createdAt ?? now, updatedAt: p.updatedAt ?? now }),
    )
  }
  await batch.commit()
}

async function seedNutritionSources(uid: string) {
  if (!(await isUserCollectionEmpty(uid, 'nutritionSources'))) return
  const batch = writeBatch(firestore)
  const now = new Date().toISOString()
  for (const s of nutritionSourcesSeed) {
    batch.set(
      docFor(uid, 'nutritionSources', s.id),
      cleanForFirestore({ ...s, createdAt: s.createdAt ?? now, updatedAt: s.updatedAt ?? now }),
    )
  }
  await batch.commit()
}

async function seedSettings(uid: string) {
  if (!(await isUserCollectionEmpty(uid, 'settings'))) return
  const now = new Date().toISOString()
  const batch = writeBatch(firestore)
  batch.set(
    docFor(uid, 'settings', DEFAULT_SETTINGS.id ?? 'settings:default'),
    cleanForFirestore({ ...DEFAULT_SETTINGS, createdAt: now, updatedAt: now }),
  )
  await batch.commit()
}
