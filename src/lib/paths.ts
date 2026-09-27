import { collection, doc } from 'firebase/firestore'
import { auth, firestore } from '@/lib/firebase'

/**
 * Every per-user document lives under users/{uid}/<collection>.
 * Repositories build their paths exclusively through the helpers here, so
 * user isolation is enforced in one place instead of in 14 repositories.
 */
export const USERS = 'users'
export const META = 'meta'
export const SEATS = 'seats'

export class NotAuthenticatedError extends Error {
  constructor() {
    super('Not authenticated')
    this.name = 'NotAuthenticatedError'
  }
}

export function requireUid(): string {
  const uid = auth.currentUser?.uid
  if (!uid) throw new NotAuthenticatedError()
  return uid
}

/** Collection under the signed-in user, e.g. userColl('meals'). */
export function userColl(name: string) {
  return collection(firestore, USERS, requireUid(), name)
}

/** Document under the signed-in user, e.g. userDoc('meals', id). */
export function userDoc(name: string, id: string) {
  return doc(firestore, USERS, requireUid(), name, id)
}

/** The user's own profile document at users/{uid}. */
export function profileDoc(uid?: string) {
  return doc(firestore, USERS, uid ?? requireUid())
}

/** The single seat-counter document at meta/seats. */
export function seatsDoc() {
  return doc(firestore, META, SEATS)
}

/**
 * Explicit-uid variants, for provisioning and migration where the target user
 * is known but may not be the value of auth.currentUser yet.
 */
export function collFor(uid: string, name: string) {
  return collection(firestore, USERS, uid, name)
}

export function docFor(uid: string, name: string, id: string) {
  return doc(firestore, USERS, uid, name, id)
}
