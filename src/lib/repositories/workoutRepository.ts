import {
  collection, doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc,
  query, orderBy, where, limit,
} from 'firebase/firestore'
import { firestore } from '@/lib/firebase'
import type { Workout } from '@/types'

const COLLECTION = 'workouts'
function coll() { return collection(firestore, COLLECTION) }
function dRef(id: string) { return doc(firestore, COLLECTION, id) }
function snapTo<T>(d: any): T { return { id: d.id, ...d.data() } as T }

export class WorkoutRepository {
  async getById(id: string) {
    const snap = await getDoc(dRef(id))
    return snap.exists() ? snapTo<Workout>(snap) : undefined
  }

  async getByDate(dateIso: string) {
    const q = query(coll(), where('date', '==', dateIso), limit(1))
    const snap = await getDocs(q)
    return snap.empty ? undefined : snapTo<Workout>(snap.docs[0])
  }

  async listByDate(dateIso: string) {
    const q = query(coll(), where('date', '==', dateIso))
    const snap = await getDocs(q)
    return snap.docs.map((d) => snapTo<Workout>(d))
  }

  async listRecent(max = 7) {
    const q = query(coll(), orderBy('date', 'desc'), limit(max))
    const snap = await getDocs(q)
    return snap.docs.map((d) => snapTo<Workout>(d))
  }

  async listAll() {
    const q = query(coll(), orderBy('date', 'desc'))
    const snap = await getDocs(q)
    return snap.docs.map((d) => snapTo<Workout>(d))
  }

  async add(workout: Workout) {
    await setDoc(dRef(workout.id), workout)
  }

  async update(id: string, patch: Partial<Workout>) {
    await updateDoc(dRef(id), { ...patch, updatedAt: new Date().toISOString() })
  }

  async delete(id: string) {
    await deleteDoc(dRef(id))
  }

  async upsert(workout: Workout): Promise<Workout> {
    const existing = await this.getByDate(workout.date)
    if (existing) {
      await this.update(existing.id, { type: workout.type })
      return { ...existing, type: workout.type, updatedAt: new Date().toISOString() }
    }
    await this.add(workout)
    return workout
  }
}

export const workoutRepository = new WorkoutRepository()