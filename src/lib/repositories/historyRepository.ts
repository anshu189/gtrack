import {
  collection, doc, getDoc, getDocs, setDoc, deleteDoc,
  query, orderBy, where,
} from 'firebase/firestore'
import { firestore } from '@/lib/firebase'
import { cleanForFirestore } from '@/lib/utils/firestore'
import type { HistoryEntry } from '@/types'
import { foodRepository } from './foodRepository'

const COLLECTION = 'history'
function coll() { return collection(firestore, COLLECTION) }
function dRef(id: string) { return doc(firestore, COLLECTION, id) }
function snapTo<T>(d: any): T { return { id: d.id, ...d.data() } as T }

export interface HistoryRepository {
  getById(id: string): Promise<HistoryEntry | undefined>
  listAll(): Promise<HistoryEntry[]>
  listByType(type: string): Promise<HistoryEntry[]>
  add(entry: HistoryEntry): Promise<void>
  delete(id: string): Promise<void>
  listRecentFoodIds(limit?: number): Promise<string[]>
  listRecentFoods(limit?: number): Promise<any[]>
}

export class FirestoreHistoryRepository implements HistoryRepository {
  async getById(id: string) {
    const snap = await getDoc(dRef(id))
    return snap.exists() ? snapTo<HistoryEntry>(snap) : undefined
  }

  async listAll() {
    const q = query(coll(), orderBy('loggedAt', 'desc'))
    const snap = await getDocs(q)
    return snap.docs.map((d) => snapTo<HistoryEntry>(d))
  }

  async listByType(type: string) {
    const q = query(coll(), where('type', '==', type))
    const snap = await getDocs(q)
    return snap.docs.map((d) => snapTo<HistoryEntry>(d))
  }

  async add(entry: HistoryEntry) {
    await setDoc(dRef(entry.id), cleanForFirestore(entry))
  }

  async delete(id: string) {
    await deleteDoc(dRef(id))
  }

  async listRecentFoodIds(limit = 20): Promise<string[]> {
    const q = query(coll(), where('type', '==', 'meal'), orderBy('loggedAt', 'desc'))
    const snap = await getDocs(q)
    const seen = new Set<string>()
    const result: string[] = []
    for (const d of snap.docs) {
      const entry = snapTo<any>(d)
      const meal = entry.mealSnapshot
      if (!meal || !Array.isArray(meal.items)) continue
      for (const item of meal.items) {
        if (!item || !item.foodId) continue
        if (!seen.has(item.foodId)) {
          seen.add(item.foodId)
          result.push(item.foodId)
          if (result.length >= limit) return result
        }
      }
    }
    return result
  }

  async listRecentFoods(limit = 20) {
    const ids = await this.listRecentFoodIds(limit)
    const foods: any[] = []
    for (const id of ids) {
      const f = await foodRepository.getById(id)
      if (f) foods.push(f)
    }
    return foods
  }
}

export const historyRepository = new FirestoreHistoryRepository()