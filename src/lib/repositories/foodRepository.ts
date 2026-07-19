import {
  collection, doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc,
  query, orderBy,
} from 'firebase/firestore'
import { firestore } from '@/lib/firebase'
import { cleanForFirestore } from '@/lib/utils/firestore'
import type { Food } from '@/types'
import { foodSearchService } from '@/lib/search/foodSearch'

const COLLECTION = 'foods'
function coll() { return collection(firestore, COLLECTION) }
function dRef(id: string) { return doc(firestore, COLLECTION, id) }
function snapTo<T>(d: any): T { return { id: d.id, ...d.data() } as T }

export type FoodSearchResult = Pick<Food, 'id' | 'name' | 'category' | 'nutrition'>

export interface FoodRepository {
  getById(id: string): Promise<Food | undefined>
  listAll(): Promise<Food[]>
  add(food: Food): Promise<void>
  createCustom(input: Partial<Food>): Promise<Food>
  update(id: string, patch: Partial<Food>): Promise<void>
  delete(id: string): Promise<void>
  searchByName(q: string): Promise<FoodSearchResult[]>
}

function generateId() {
  try {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') return `food:custom:${crypto.randomUUID()}`
  } catch { /* ignore */ }
  return `food:custom:${Date.now()}-${Math.floor(Math.random() * 10000)}`
}

export class FirestoreFoodRepository implements FoodRepository {
  async getById(id: string) {
    const snap = await getDoc(dRef(id))
    return snap.exists() ? snapTo<Food>(snap) : undefined
  }

  async listAll() {
    const q = query(coll(), orderBy('name'))
    const snap = await getDocs(q)
    return snap.docs.map((d) => snapTo<Food>(d))
  }

  async add(food: Food) {
    await setDoc(dRef(food.id), cleanForFirestore(food))
    await foodSearchService.refreshIfStale()
  }

  async createCustom(input: Partial<Food>) {
    const now = new Date().toISOString()
    const id = input.id ?? generateId()
    const food: Food = {
      id,
      name: input.name ?? 'Custom food',
      category: input.category,
      servingSize: input.servingSize ?? input.measures?.[0]?.grams ?? input.measures?.[0]?.quantity ?? 100,
      servingUnit: input.servingUnit ?? input.measures?.[0]?.unit ?? 'g',
      measures: input.measures ?? [],
      isCustom: true,
      source: 'Custom',
      nutrition: input.nutrition ?? { calories: 0, protein: 0, carbs: 0, fat: 0 },
      aliases: input.aliases ?? [],
      notes: input.notes,
      tags: input.tags ?? [],
      createdAt: now,
      updatedAt: now,
    }
    await setDoc(dRef(id), cleanForFirestore(food))
    await foodSearchService.refreshIfStale()
    return food
  }

  async update(id: string, patch: Partial<Food>) {
    await updateDoc(dRef(id), { ...patch, updatedAt: new Date().toISOString() })
    await foodSearchService.refreshIfStale()
  }

  async delete(id: string) {
    await deleteDoc(dRef(id))
    await foodSearchService.refreshIfStale()
  }

  async searchByName(q: string) {
    const term = q.trim().toLowerCase()
    if (!term) return []
    const all = await this.listAll()
    return all
      .filter((f) => f.name.toLowerCase().includes(term) || (f.aliases || []).some((a) => a.toLowerCase().includes(term)))
      .map((f) => ({ id: f.id, name: f.name, category: f.category, nutrition: f.nutrition }))
  }
}

export const foodRepository = new FirestoreFoodRepository()