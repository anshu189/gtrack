import {
  collection, doc, getDocs, setDoc,
  query, orderBy, where,
} from 'firebase/firestore'
import { firestore } from '@/lib/firebase'
import { cleanForFirestore } from '@/lib/utils/firestore'
import type { RespectLog } from '@/types'

const COLLECTION = 'respectLogs'
function coll() { return collection(firestore, COLLECTION) }
function dRef(id: string) { return doc(firestore, COLLECTION, id) }
function snapTo<T>(d: any): T { return { id: d.id, ...d.data() } as T }

export class RespectRepository {
  async getByDate(dateIso: string) {
    const q = query(coll(), where('date', '==', dateIso))
    const snap = await getDocs(q)
    const docs = snap.docs.map((d) => snapTo<RespectLog>(d))
    return docs.length > 0 ? docs[0] : undefined
  }

  async upsert(input: Partial<RespectLog>): Promise<RespectLog> {
    const now = new Date().toISOString()
    const id = input.id ?? `respect:${input.date}`
    const total = (input.didWhatSaid ?? 0) + (input.excuse ?? 0) + (input.flake ?? 0)
    const log: RespectLog = {
      id,
      date: input.date ?? now.split('T')[0],
      didWhatSaid: input.didWhatSaid ?? 0,
      excuse: input.excuse ?? 0,
      flake: input.flake ?? 0,
      total,
      updatedAt: now,
    }
    await setDoc(dRef(id), cleanForFirestore(log))
    return log
  }

  async listAll() {
    const q = query(coll(), orderBy('date', 'desc'))
    const snap = await getDocs(q)
    return snap.docs.map((d) => snapTo<RespectLog>(d))
  }
}

export const respectRepository = new RespectRepository()
