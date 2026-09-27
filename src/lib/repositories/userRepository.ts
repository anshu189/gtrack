import { getDoc, runTransaction, updateDoc } from 'firebase/firestore'
import { firestore } from '@/lib/firebase'
import { cleanForFirestore } from '@/lib/utils/firestore'
import { profileDoc, seatsDoc } from '@/lib/paths'
import type { AuthProvider, SeatCounter, UserProfile } from '@/types'

/** Bumped when the per-user document shape changes. v1 was the pre-auth global layout. */
export const USER_SCHEMA_VERSION = 2

/** Fallback only — the real limit lives on the meta/seats document. */
export const DEFAULT_SEAT_LIMIT = 50

export class SeatsFullError extends Error {
  constructor() {
    super('All seats are full')
    this.name = 'SeatsFullError'
  }
}

export class SeatsMissingError extends Error {
  constructor() {
    super('Seat counter is missing')
    this.name = 'SeatsMissingError'
  }
}

function snapTo<T>(d: any): T { return { id: d.id, ...d.data() } as T }

export interface UserRepository {
  getProfile(uid: string): Promise<UserProfile | undefined>
  getSeats(): Promise<SeatCounter | undefined>
  claimSeat(uid: string, patch: Partial<UserProfile>): Promise<void>
  markProvisioned(uid: string): Promise<void>
}

export class FirestoreUserRepository implements UserRepository {
  async getProfile(uid: string) {
    const snap = await getDoc(profileDoc(uid))
    return snap.exists() ? snapTo<UserProfile>(snap) : undefined
  }

  async getSeats() {
    const snap = await getDoc(seatsDoc())
    return snap.exists() ? (snap.data() as SeatCounter) : undefined
  }

  /**
   * Creates the profile for a new user and takes one seat, atomically — so two
   * people signing up at the same moment can never both take the last seat.
   * A returning user already has a profile and consumes no seat.
   *
   * Throws SeatsFullError when the cap is reached.
   */
  async claimSeat(uid: string, patch: Partial<UserProfile>) {
    const now = new Date().toISOString()

    await runTransaction(firestore, async (tx) => {
      const seatsRef = seatsDoc()
      const profileRef = profileDoc(uid)

      // All reads must happen before any write inside a transaction.
      const seatsSnap = await tx.get(seatsRef)
      const profileSnap = await tx.get(profileRef)

      if (profileSnap.exists()) {
        tx.set(
          profileRef,
          cleanForFirestore({ ...patch, updatedAt: now }),
          { merge: true },
        )
        return
      }

      if (!seatsSnap.exists()) throw new SeatsMissingError()
      const seats = seatsSnap.data() as SeatCounter
      const count = seats.count ?? 0
      const limit = seats.limit ?? DEFAULT_SEAT_LIMIT
      if (count >= limit) throw new SeatsFullError()

      tx.set(
        profileRef,
        cleanForFirestore({
          ...patch,
          schemaVersion: patch.schemaVersion ?? USER_SCHEMA_VERSION,
          createdAt: now,
          updatedAt: now,
        }),
      )
      tx.update(seatsRef, { count: count + 1, updatedAt: now })
    })
  }

  async markProvisioned(uid: string) {
    const now = new Date().toISOString()
    await updateDoc(profileDoc(uid), { provisionedAt: now, updatedAt: now })
  }
}

export const userRepository = new FirestoreUserRepository()

export function providerFromId(providerId?: string | null): AuthProvider | undefined {
  if (providerId === 'password') return 'password'
  if (providerId === 'google.com') return 'google.com'
  return undefined
}
