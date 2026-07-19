import {
  collection, doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc,
  query, orderBy,
} from 'firebase/firestore'
import { firestore } from '@/lib/firebase'
import type { NutritionSource } from '@/types'

const COLLECTION = 'nutritionSources'
function coll() { return collection(firestore, COLLECTION) }
function dRef(id: string) { return doc(firestore, COLLECTION, id) }
function snapTo<T>(d: any): T { return { id: d.id, ...d.data() } as T }

export interface NutritionSourceRepository {
  getById(id: string): Promise<NutritionSource | undefined>
  listAll(): Promise<NutritionSource[]>
  add(s: NutritionSource): Promise<void>
  update(id: string, patch: Partial<NutritionSource>): Promise<void>
  delete(id: string): Promise<void>
}

export class FirestoreNutritionSourceRepository implements NutritionSourceRepository {
  async getById(id: string) {
    const snap = await getDoc(dRef(id))
    return snap.exists() ? snapTo<NutritionSource>(snap) : undefined
  }

  async listAll() {
    const q = query(coll(), orderBy('name'))
    const snap = await getDocs(q)
    return snap.docs.map((d) => snapTo<NutritionSource>(d))
  }

  async add(s: NutritionSource) {
    await setDoc(dRef(s.id), s)
  }

  async update(id: string, patch: Partial<NutritionSource>) {
    await updateDoc(dRef(id), { ...patch, updatedAt: new Date().toISOString() })
  }

  async delete(id: string) {
    await deleteDoc(dRef(id))
  }
}

export const nutritionSourceRepository = new FirestoreNutritionSourceRepository()