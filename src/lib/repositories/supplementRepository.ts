import {
  getDocs, setDoc, updateDoc, deleteDoc,
  query, orderBy,
} from 'firebase/firestore'
import { userColl, userDoc } from '@/lib/paths'
import { cleanForFirestore } from '@/lib/utils/firestore'
import type { Supplement } from '@/types'

const COLLECTION = 'supplements'
function coll() { return userColl(COLLECTION) }
function dRef(id: string) { return userDoc(COLLECTION, id) }
function snapTo<T>(d: any): T { return { id: d.id, ...d.data() } as T }

export interface SupplementRepository {
  listAll(): Promise<Supplement[]>
  create(input: Omit<Supplement, 'id' | 'createdAt' | 'updatedAt'>): Promise<Supplement>
  update(id: string, patch: Partial<Supplement>): Promise<void>
  delete(id: string): Promise<void>
}

function generateId() {
  try {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') return `supp:custom:${crypto.randomUUID()}`
  } catch { /* ignore */ }
  return `supp:custom:${Date.now()}-${Math.floor(Math.random() * 10000)}`
}

export class FirestoreSupplementRepository implements SupplementRepository {
  async listAll() {
    const snap = await getDocs(query(coll(), orderBy('order')))
    return snap.docs.map((d) => snapTo<Supplement>(d))
  }

  async create(input: Omit<Supplement, 'id' | 'createdAt' | 'updatedAt'>) {
    const now = new Date().toISOString()
    const supplement: Supplement = { ...input, id: generateId(), createdAt: now, updatedAt: now }
    await setDoc(dRef(supplement.id), cleanForFirestore(supplement))
    return supplement
  }

  async update(id: string, patch: Partial<Supplement>) {
    await updateDoc(dRef(id), cleanForFirestore({ ...patch, updatedAt: new Date().toISOString() }))
  }

  async delete(id: string) {
    await deleteDoc(dRef(id))
  }
}

export const supplementRepository = new FirestoreSupplementRepository()
