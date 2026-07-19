import {
  collection, doc, getDocs, setDoc,
  query, orderBy, limit, writeBatch,
} from 'firebase/firestore'
import { firestore } from '@/lib/firebase'
import { cleanForFirestore } from '@/lib/utils/firestore'
import type { UserSettings } from '@/types'

const COLLECTION = 'settings'
function coll() { return collection(firestore, COLLECTION) }
function dRef(id: string) { return doc(firestore, COLLECTION, id) }
function snapTo<T>(d: any): T { return { id: d.id, ...d.data() } as T }

export interface SettingsRepository {
  get(): Promise<UserSettings | undefined>
  save(s: UserSettings): Promise<void>
  clear(): Promise<void>
}

export class FirestoreSettingsRepository implements SettingsRepository {
  async get() {
    const q = query(coll(), orderBy('__name__'), limit(1))
    const snap = await getDocs(q)
    if (!snap.empty) return snapTo<UserSettings>(snap.docs[0])
    return {
      id: 'settings:default',
      unitSystem: 'metric' as const,
      nutritionTargets: { calories: 3300, protein: 120, carbs: 420, fat: 95, fiber: 35 },
      waterGoalMl: 2000,
    }
  }

  async save(s: UserSettings) {
    const now = new Date().toISOString()
    const payload = { ...s, updatedAt: now, createdAt: s.createdAt ?? now }
    await setDoc(dRef(s.id ?? 'settings:default'), cleanForFirestore(payload))
  }

  async clear() {
    const snap = await getDocs(coll())
    const batch = writeBatch(firestore)
    snap.docs.forEach((d) => batch.delete(d.ref))
    await batch.commit()
  }
}

export const settingsRepository = new FirestoreSettingsRepository()