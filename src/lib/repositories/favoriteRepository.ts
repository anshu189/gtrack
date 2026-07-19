import {
  collection, doc, getDoc, getDocs, setDoc, deleteDoc,
  query, orderBy,
} from 'firebase/firestore'
import { firestore } from '@/lib/firebase'
import { cleanForFirestore } from '@/lib/utils/firestore'
import type { Favorite } from '@/types'

const COLLECTION = 'favorites'
function coll() { return collection(firestore, COLLECTION) }
function dRef(id: string) { return doc(firestore, COLLECTION, id) }
function snapTo<T>(d: any): T { return { id: d.id, ...d.data() } as T }

export interface FavoriteRepository {
  listAll(): Promise<Favorite[]>
  add(foodId: string): Promise<Favorite>
  removeByFoodId(foodId: string): Promise<void>
  isFavorite(foodId: string): Promise<boolean>
}

export class FirestoreFavoriteRepository implements FavoriteRepository {
  async listAll() {
    const q = query(coll(), orderBy('createdAt', 'desc'))
    const snap = await getDocs(q)
    return snap.docs.map((d) => snapTo<Favorite>(d))
  }

  async add(foodId: string) {
    const id = `fav:${foodId}`
    const now = new Date().toISOString()
    const fav = { id, foodId, createdAt: now }
    await setDoc(dRef(id), cleanForFirestore(fav))
    return fav
  }

  async removeByFoodId(foodId: string) {
    await deleteDoc(dRef(`fav:${foodId}`))
  }

  async isFavorite(foodId: string) {
    const snap = await getDoc(dRef(`fav:${foodId}`))
    return snap.exists()
  }
}

export const favoriteRepository = new FirestoreFavoriteRepository()