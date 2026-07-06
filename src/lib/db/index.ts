import Dexie from 'dexie'
import type { Table } from 'dexie'
import type { Food, Meal, HistoryEntry, UserSettings, Category, QuantityPreset, NutritionSource, Favorite, Workout, WaterLog, WeightEntry, DailyNote } from '@/types'
import builtInFoods from '@/data/builtInFoods'
import builtInCategories from '@/data/categories'
import foodsSeed from '@/data/foodsSeed'
import quantityPresetsSeed from '@/data/quantityPresets'
import nutritionSourcesSeed from '@/data/nutritionSources'

class GTrakDB extends Dexie {
  // typed table properties
  foods!: Table<Food, string>
  meals!: Table<Meal, string>
  history!: Table<HistoryEntry, string>
  settings!: Table<UserSettings, string>
  categories!: Table<Category, string>
  quantityPresets!: Table<QuantityPreset, string>
  nutritionSources!: Table<NutritionSource, string>
  favorites!: Table<Favorite, string>
  workouts!: Table<Workout, string>
  waterLogs!: Table<WaterLog, string>
  weights!: Table<WeightEntry, string>
  dailyNotes!: Table<DailyNote, string>

  constructor() {
    super('gtrak')

    // Schema for version 1
    this.version(1).stores({
      foods: 'id, name, category, tags, source',
      meals: 'id, loggedAt',
      history: 'id, loggedAt, type',
      settings: 'id',
    }).upgrade(async (_tx) => {
      // migration scaffold for v1 (no-op)
    })

    // Schema for version 2: add categories
    this.version(2).stores({
      foods: 'id, name, category, tags, source',
      meals: 'id, loggedAt',
      history: 'id, loggedAt, type',
      settings: 'id',
      categories: 'id, name, parentId',
    }).upgrade(async (_tx) => {
      // v2 migration: ensure categories table exists; no additional transform required here
    })

    // Schema for version 3: add quantity presets
    this.version(3).stores({
      foods: 'id, name, category, tags, source',
      meals: 'id, loggedAt',
      history: 'id, loggedAt, type',
      settings: 'id',
      categories: 'id, name, parentId',
      quantityPresets: 'id, unit, label',
    }).upgrade(async (_tx) => {
      // v3 migration scaffold for quantity presets
    })

    // Schema for version 4: add nutrition sources
    this.version(4).stores({
      foods: 'id, name, category, tags, source',
      meals: 'id, loggedAt',
      history: 'id, loggedAt, type',
      settings: 'id',
      categories: 'id, name, parentId',
      quantityPresets: 'id, unit, label',
      nutritionSources: 'id, name',
    }).upgrade(async (_tx) => {
      // v4 migration scaffold for nutrition sources
    })

    // Schema for version 5: add favorites table
    this.version(5).stores({
      foods: 'id, name, category, tags, source',
      meals: 'id, loggedAt',
      history: 'id, loggedAt, type',
      settings: 'id',
      categories: 'id, name, parentId',
      quantityPresets: 'id, unit, label',
      nutritionSources: 'id, name',
      favorites: 'id, foodId, createdAt',
    }).upgrade(async (_tx) => {
      // v5 migration scaffold for favorites
    })

    // Schema for version 6: add tracking tables (workouts, water, weight, notes)
    this.version(6).stores({
      foods: 'id, name, category, tags, source',
      meals: 'id, loggedAt',
      history: 'id, loggedAt, type',
      settings: 'id',
      categories: 'id, name, parentId',
      quantityPresets: 'id, unit, label',
      nutritionSources: 'id, name',
      favorites: 'id, foodId, createdAt',
      workouts: 'id, date, type',
      waterLogs: 'id, date, timestamp',
      weights: 'id, date',
      dailyNotes: 'id, date',
    }).upgrade(async (_tx) => {
      // v6 migration scaffold for tracking tables
    })
  }

  async seedBuiltIns(foods: Food[]) {
    try {
      const count = await this.foods.count()
      if (count === 0 && foods.length > 0) {
        const now = new Date().toISOString()
        const toInsert = foods.map((f) => ({ ...f, createdAt: f.createdAt ?? now, updatedAt: f.updatedAt ?? now }))
        await this.foods.bulkAdd(toInsert)
      }
    } catch (e) {
      // do not crash app on seeding errors; log for diagnostics
      // eslint-disable-next-line no-console
      console.error('gtrak: failed to seed built-in foods', e)
    }
  }

  async seedCategories(categories: Category[]) {
    try {
      const count = await this.categories.count()
      if (count === 0 && categories.length > 0) {
        const now = new Date().toISOString()
        const toInsert = categories.map((c) => ({ ...c, createdAt: c.createdAt ?? now, updatedAt: c.updatedAt ?? now }))
        await this.categories.bulkAdd(toInsert)
      }
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('gtrak: failed to seed categories', e)
    }
  }

  async seedQuantityPresets(presets: QuantityPreset[]) {
    try {
      const count = await this.quantityPresets.count()
      if (count === 0 && presets.length > 0) {
        const now = new Date().toISOString()
        const toInsert = presets.map((p) => ({ ...p, createdAt: p.createdAt ?? now, updatedAt: p.updatedAt ?? now }))
        await this.quantityPresets.bulkAdd(toInsert)
      }
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('gtrak: failed to seed quantity presets', e)
    }
  }

  async seedNutritionSources(sources: NutritionSource[]) {
    try {
      const count = await this.nutritionSources.count()
      if (count === 0 && sources.length > 0) {
        const now = new Date().toISOString()
        const toInsert = sources.map((s) => ({ ...s, createdAt: s.createdAt ?? now, updatedAt: s.updatedAt ?? now }))
        await this.nutritionSources.bulkAdd(toInsert)
      }
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('gtrak: failed to seed nutrition sources', e)
    }
  }
}

export const db = new GTrakDB()

export async function initDB() {
  await db.open()
  // Seed categories first (if empty)
  await db.seedCategories(builtInCategories)

  // Seed foods: prefer the expanded foodsSeed (larger dataset); include the small builtInFoods too
  const combined = [...builtInFoods, ...foodsSeed]
  await db.seedBuiltIns(combined)

  // Seed quantity presets
  await db.seedQuantityPresets(quantityPresetsSeed)

  // Seed nutrition sources
  await db.seedNutritionSources(nutritionSourcesSeed)
}

export default db
