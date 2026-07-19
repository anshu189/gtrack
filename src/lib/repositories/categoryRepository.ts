import {
  collection, doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc,
  query, orderBy,
} from 'firebase/firestore'
import { firestore } from '@/lib/firebase'
import type { Category } from '@/types'

const COLLECTION = 'categories'
function coll() { return collection(firestore, COLLECTION) }
function dRef(id: string) { return doc(firestore, COLLECTION, id) }
function snapTo<T>(d: any): T { return { id: d.id, ...d.data() } as T }

export interface CategoryRepository {
  getById(id: string): Promise<Category | undefined>
  listAll(): Promise<Category[]>
  add(category: Category): Promise<void>
  update(id: string, patch: Partial<Category>): Promise<void>
  delete(id: string): Promise<void>
}

export class FirestoreCategoryRepository implements CategoryRepository {
  async getById(id: string) {
    const snap = await getDoc(dRef(id))
    return snap.exists() ? snapTo<Category>(snap) : undefined
  }

  async listAll() {
    const q = query(coll(), orderBy('name'))
    const snap = await getDocs(q)
    return snap.docs.map((d) => snapTo<Category>(d))
  }

  async add(category: Category) {
    await setDoc(dRef(category.id), category)
  }

  async update(id: string, patch: Partial<Category>) {
    await updateDoc(dRef(id), { ...patch, updatedAt: new Date().toISOString() })
  }

  async delete(id: string) {
    await deleteDoc(dRef(id))
  }
}

export const categoryRepository = new FirestoreCategoryRepository()