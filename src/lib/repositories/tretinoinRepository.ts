import {
  getDoc, getDocs, setDoc, deleteDoc,
  query, orderBy, where,
} from 'firebase/firestore'
import { userColl, userDoc } from '@/lib/paths'
import { cleanForFirestore } from '@/lib/utils/firestore'
import type { TretinoinLog } from '@/types'

const COLLECTION = 'tretinoinLogs'
function coll() { return userColl(COLLECTION) }
function dRef(id: string) { return userDoc(COLLECTION, id) }
function snapTo<T>(d: any): T { return { id: d.id, ...d.data() } as T }

export class TretinoinRepository {
  async getById(id: string) {
    const snap = await getDoc(dRef(id))
    return snap.exists() ? snapTo<TretinoinLog>(snap) : undefined
  }

  async listByDate(dateIso: string) {
    const q = query(coll(), where('date', '==', dateIso))
    const snap = await getDocs(q)
    return snap.docs.map((d) => snapTo<TretinoinLog>(d))
  }

  async listAll() {
    const q = query(coll(), orderBy('timestamp', 'desc'))
    const snap = await getDocs(q)
    return snap.docs.map((d) => snapTo<TretinoinLog>(d))
  }

  async add(log: TretinoinLog) {
    await setDoc(dRef(log.id), cleanForFirestore(log))
  }

  async delete(id: string) {
    await deleteDoc(dRef(id))
  }
}

export const tretinoinRepository = new TretinoinRepository()
