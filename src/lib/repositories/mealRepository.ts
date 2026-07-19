import {
  collection, doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc,
  query, orderBy, where, writeBatch,
} from 'firebase/firestore'
import { firestore } from '@/lib/firebase'
import { cleanForFirestore } from '@/lib/utils/firestore'
import type { Meal, DeletedMealEntry } from '@/types'

const MEALS = 'meals'
const DELETED = 'deletedMeals'

function coll(name: string) { return collection(firestore, name) }
function dRef(name: string, id: string) { return doc(firestore, name, id) }

export interface MealRepository {
  getById(id: string): Promise<Meal | undefined>
  listAll(): Promise<Meal[]>
  listByDateRange(fromIso: string, toIso: string): Promise<Meal[]>
  add(meal: Meal): Promise<void>
  create(input: Partial<Meal>): Promise<Meal>
  update(id: string, patch: Partial<Meal>): Promise<void>
  delete(id: string): Promise<void>
  deleteSoft(meal: Meal): Promise<void>
  restoreDeleted(deleteId: string): Promise<void>
  listDeleted(): Promise<DeletedMealEntry[]>
  purgeExpiredDeletions(): Promise<void>
}

function generateId() {
  try {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') return `meal:${crypto.randomUUID()}`
  } catch { /* ignore */ }
  return `meal:${Date.now()}-${Math.floor(Math.random() * 10000)}`
}

function snapTo<T>(d: any): T {
  return { id: d.id, ...d.data() } as T
}

export class FirestoreMealRepository implements MealRepository {
  async getById(id: string) {
    const snap = await getDoc(dRef(MEALS, id))
    return snap.exists() ? snapTo<Meal>(snap) : undefined
  }

  async listAll() {
    const q = query(coll(MEALS), orderBy('loggedAt'))
    const snap = await getDocs(q)
    return snap.docs.map((d) => snapTo<Meal>(d))
  }

  async listByDateRange(fromIso: string, toIso: string) {
    const q = query(coll(MEALS), where('loggedAt', '>=', fromIso), where('loggedAt', '<=', toIso), orderBy('loggedAt'))
    const snap = await getDocs(q)
    return snap.docs.map((d) => snapTo<Meal>(d))
  }

  async add(meal: Meal) {
    await setDoc(dRef(MEALS, meal.id), cleanForFirestore(meal))
  }

  async create(input: Partial<Meal>): Promise<Meal> {
    const now = new Date().toISOString()
    const meal: Meal = {
      id: input.id ?? generateId(),
      name: input.name ?? 'Meal',
      loggedAt: input.loggedAt ?? now,
      items: input.items ?? [],
      notes: input.notes,
      createdAt: now,
      updatedAt: now,
    }
    await setDoc(dRef(MEALS, meal.id), cleanForFirestore(meal))
    return meal
  }

  async update(id: string, patch: Partial<Meal>) {
    await updateDoc(dRef(MEALS, id), { ...patch, updatedAt: new Date().toISOString() })
  }

  async delete(id: string) {
    await deleteDoc(dRef(MEALS, id))
  }

  getMidnight(): string {
    const d = new Date()
    d.setHours(0, 0, 0, 0)
    return d.toISOString()
  }

  async deleteSoft(meal: Meal): Promise<void> {
    const now = new Date().toISOString()
    const entry: DeletedMealEntry = {
      id: meal.id,
      meal: { ...meal },
      deletedAt: now,
      originalLoggedAt: meal.loggedAt,
    }
    await setDoc(dRef(DELETED, meal.id), cleanForFirestore(entry))
    await deleteDoc(dRef(MEALS, meal.id))
  }

  async restoreDeleted(deleteId: string): Promise<void> {
    const snap = await getDoc(dRef(DELETED, deleteId))
    if (!snap.exists()) return
    const entry = snapTo<DeletedMealEntry>(snap)
    await setDoc(dRef(MEALS, entry.meal.id), cleanForFirestore(entry.meal))
    await deleteDoc(dRef(DELETED, deleteId))
  }

  async listDeleted(): Promise<DeletedMealEntry[]> {
    await this.purgeExpiredDeletions()
    const q = query(coll(DELETED), orderBy('deletedAt', 'desc'))
    const snap = await getDocs(q)
    return snap.docs.map((d) => snapTo<DeletedMealEntry>(d))
  }

  async purgeExpiredDeletions(): Promise<void> {
    const midnight = this.getMidnight()
    const q = query(coll(DELETED), where('deletedAt', '<', midnight))
    const snap = await getDocs(q)
    if (snap.empty) return
    const batch = writeBatch(firestore)
    snap.docs.forEach((d) => batch.delete(d.ref))
    await batch.commit()
  }
}

export const mealRepository = new FirestoreMealRepository()