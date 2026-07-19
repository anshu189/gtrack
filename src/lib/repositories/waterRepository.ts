import {
  collection, doc, getDoc, getDocs, setDoc, deleteDoc,
  query, orderBy, where,
} from 'firebase/firestore'
import { firestore } from '@/lib/firebase'
import type { WaterLog } from '@/types'

const COLLECTION = 'waterLogs'
function coll() { return collection(firestore, COLLECTION) }
function dRef(id: string) { return doc(firestore, COLLECTION, id) }
function snapTo<T>(d: any): T { return { id: d.id, ...d.data() } as T }

export class WaterRepository {
  async getById(id: string) {
    const snap = await getDoc(dRef(id))
    return snap.exists() ? snapTo<WaterLog>(snap) : undefined
  }

  async listByDate(dateIso: string) {
    const q = query(coll(), where('date', '==', dateIso))
    const snap = await getDocs(q)
    return snap.docs.map((d) => snapTo<WaterLog>(d))
  }

  async getTotalForDate(dateIso: string): Promise<number> {
    const logs = await this.listByDate(dateIso)
    return logs.reduce((sum, log) => sum + log.amount, 0)
  }

  async listAll() {
    const q = query(coll(), orderBy('timestamp', 'desc'))
    const snap = await getDocs(q)
    return snap.docs.map((d) => snapTo<WaterLog>(d))
  }

  async add(log: WaterLog) {
    await setDoc(dRef(log.id), log)
  }

  async delete(id: string) {
    await deleteDoc(dRef(id))
  }
}

export const waterRepository = new WaterRepository()