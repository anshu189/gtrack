import { collection, getDocs, writeBatch, doc } from 'firebase/firestore'
import { firestore } from '@/lib/firebase'
import builtInFoods from '@/data/builtInFoods'
import builtInCategories from '@/data/categories'
import foodsSeed from '@/data/foodsSeed'
import macroOverrides from '@/data/macroOverrides'
import quantityPresetsSeed from '@/data/quantityPresets'
import nutritionSourcesSeed from '@/data/nutritionSources'
import type { Food } from '@/types'

async function isCollectionEmpty(name: string): Promise<boolean> {
  const snap = await getDocs(collection(firestore, name))
  return snap.empty
}

export async function seedIfEmpty() {
  await seedCategories()
  await seedFoods()
  await seedQuantityPresets()
  await seedNutritionSources()
}

async function seedCategories() {
  if (!(await isCollectionEmpty('categories'))) return
  const batch = writeBatch(firestore)
  const now = new Date().toISOString()
  for (const c of builtInCategories) {
    const ref = doc(firestore, 'categories', c.id)
    batch.set(ref, { ...c, createdAt: c.createdAt ?? now, updatedAt: c.updatedAt ?? now })
  }
  await batch.commit()
}

async function seedFoods() {
  if (!(await isCollectionEmpty('foods'))) return
  const combined = [...builtInFoods, ...foodsSeed]
  const now = new Date().toISOString()
  const batch = writeBatch(firestore)
  let count = 0
  for (const f of combined) {
    const override = macroOverrides[f.id]
    const base = { ...f, createdAt: f.createdAt ?? now, updatedAt: now }
    const food: Food = override
      ? { ...base, nutrition: { ...base.nutrition, ...override } }
      : base
    const ref = doc(firestore, 'foods', food.id)
    batch.set(ref, food)
    count++
    if (count >= 490) {
      await batch.commit()
      count = 0
    }
  }
  if (count > 0) await batch.commit()
}

async function seedQuantityPresets() {
  if (!(await isCollectionEmpty('quantityPresets'))) return
  const batch = writeBatch(firestore)
  const now = new Date().toISOString()
  for (const p of quantityPresetsSeed) {
    const ref = doc(firestore, 'quantityPresets', p.id)
    batch.set(ref, { ...p, createdAt: p.createdAt ?? now, updatedAt: p.updatedAt ?? now })
  }
  await batch.commit()
}

async function seedNutritionSources() {
  if (!(await isCollectionEmpty('nutritionSources'))) return
  const batch = writeBatch(firestore)
  const now = new Date().toISOString()
  for (const s of nutritionSourcesSeed) {
    const ref = doc(firestore, 'nutritionSources', s.id)
    batch.set(ref, { ...s, createdAt: s.createdAt ?? now, updatedAt: s.updatedAt ?? now })
  }
  await batch.commit()
}