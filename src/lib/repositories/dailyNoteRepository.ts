import {
  collection, doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc,
  query, orderBy, where, limit,
} from 'firebase/firestore'
import { firestore } from '@/lib/firebase'
import { cleanForFirestore } from '@/lib/utils/firestore'
import type { DailyNote } from '@/types'

const COLLECTION = 'dailyNotes'
function coll() { return collection(firestore, COLLECTION) }
function dRef(id: string) { return doc(firestore, COLLECTION, id) }
function snapTo<T>(d: any): T { return { id: d.id, ...d.data() } as T }

export class DailyNoteRepository {
  async getById(id: string) {
    const snap = await getDoc(dRef(id))
    return snap.exists() ? snapTo<DailyNote>(snap) : undefined
  }

  async getByDate(dateIso: string) {
    const q = query(coll(), where('date', '==', dateIso), limit(1))
    const snap = await getDocs(q)
    return snap.empty ? undefined : snapTo<DailyNote>(snap.docs[0])
  }

  async listAll() {
    const q = query(coll(), orderBy('date', 'desc'))
    const snap = await getDocs(q)
    return snap.docs.map((d) => snapTo<DailyNote>(d))
  }

  async add(note: DailyNote) {
    await setDoc(dRef(note.id), cleanForFirestore(note))
  }

  async update(id: string, patch: Partial<DailyNote>) {
    await updateDoc(dRef(id), { ...patch, updatedAt: new Date().toISOString() })
  }

  async delete(id: string) {
    await deleteDoc(dRef(id))
  }

  async upsert(note: DailyNote) {
    const existing = await this.getByDate(note.date)
    if (existing) {
      await this.update(existing.id, note)
    } else {
      await this.add(note)
    }
  }
}

export const dailyNoteRepository = new DailyNoteRepository()