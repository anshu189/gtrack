import {
  collection, doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc,
  query, orderBy, where, limit,
} from 'firebase/firestore'
import { firestore } from '@/lib/firebase'
import { cleanForFirestore } from '@/lib/utils/firestore'
import type { WeightEntry } from '@/types'

const COLLECTION = 'weights'
function coll() { return collection(firestore, COLLECTION) }
function dRef(id: string) { return doc(firestore, COLLECTION, id) }
function snapTo<T>(d: any): T { return { id: d.id, ...d.data() } as T }

export class WeightRepository {
  async getById(id: string) {
    const snap = await getDoc(dRef(id))
    return snap.exists() ? snapTo<WeightEntry>(snap) : undefined
  }

  async getByDate(dateIso: string) {
    const q = query(coll(), where('date', '==', dateIso), limit(1))
    const snap = await getDocs(q)
    return snap.empty ? undefined : snapTo<WeightEntry>(snap.docs[0])
  }

  async getLatestEntry() {
    const q = query(coll(), orderBy('date', 'desc'), limit(1))
    const snap = await getDocs(q)
    return snap.empty ? undefined : snapTo<WeightEntry>(snap.docs[0])
  }

  async listRecent(max = 7) {
    const q = query(coll(), orderBy('date', 'desc'), limit(max))
    const snap = await getDocs(q)
    return snap.docs.map((d) => snapTo<WeightEntry>(d))
  }

  async listAll() {
    const q = query(coll(), orderBy('date', 'desc'))
    const snap = await getDocs(q)
    return snap.docs.map((d) => snapTo<WeightEntry>(d))
  }

  async add(entry: WeightEntry) {
    await setDoc(dRef(entry.id), cleanForFirestore(entry))
  }

  async update(id: string, patch: Partial<WeightEntry>) {
    await updateDoc(dRef(id), { ...patch, updatedAt: new Date().toISOString() })
  }

  async delete(id: string) {
    await deleteDoc(dRef(id))
  }

  async upsert(entry: WeightEntry): Promise<WeightEntry> {
    const existing = await this.getByDate(entry.date)
    if (existing) {
      await this.update(existing.id, { weight: entry.weight, unit: entry.unit, notes: entry.notes })
      return { ...existing, weight: entry.weight, unit: entry.unit, notes: entry.notes, updatedAt: new Date().toISOString() }
    }
    await this.add(entry)
    return entry
  }
}

export const weightRepository = new WeightRepository()