import {
  collection, doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc,
  query, orderBy, where,
} from 'firebase/firestore'
import { firestore } from '@/lib/firebase'
import { cleanForFirestore } from '@/lib/utils/firestore'
import type { QuantityPreset } from '@/types'

const COLLECTION = 'quantityPresets'
function coll() { return collection(firestore, COLLECTION) }
function dRef(id: string) { return doc(firestore, COLLECTION, id) }
function snapTo<T>(d: any): T { return { id: d.id, ...d.data() } as T }

export interface QuantityPresetRepository {
  getById(id: string): Promise<QuantityPreset | undefined>
  listAll(): Promise<QuantityPreset[]>
  listByUnit(unit: string): Promise<QuantityPreset[]>
  add(p: QuantityPreset): Promise<void>
  update(id: string, patch: Partial<QuantityPreset>): Promise<void>
  delete(id: string): Promise<void>
}

export class FirestoreQuantityPresetRepository implements QuantityPresetRepository {
  async getById(id: string) {
    const snap = await getDoc(dRef(id))
    return snap.exists() ? snapTo<QuantityPreset>(snap) : undefined
  }

  async listAll() {
    const q = query(coll(), orderBy('label'))
    const snap = await getDocs(q)
    return snap.docs.map((d) => snapTo<QuantityPreset>(d))
  }

  async listByUnit(unit: string) {
    const q = query(coll(), where('unit', '==', unit))
    const snap = await getDocs(q)
    return snap.docs.map((d) => snapTo<QuantityPreset>(d))
  }

  async add(p: QuantityPreset) {
    await setDoc(dRef(p.id), cleanForFirestore(p))
  }

  async update(id: string, patch: Partial<QuantityPreset>) {
    await updateDoc(dRef(id), { ...patch, updatedAt: new Date().toISOString() })
  }

  async delete(id: string) {
    await deleteDoc(dRef(id))
  }
}

export const quantityPresetRepository = new FirestoreQuantityPresetRepository()