export type AuthProvider = 'password' | 'google.com'

export interface UserProfile {
  /** Firebase Auth uid — also the document id at users/{uid}. */
  id?: string
  email?: string
  displayName?: string
  photoURL?: string
  provider?: AuthProvider
  /** Bumped when the per-user data shape changes, so migrations can detect it. */
  schemaVersion?: number
  /** Set once the user's reference data (foods, categories, presets) is seeded. */
  provisionedAt?: string
  /**
   * Set once the default supplements have been seeded. Seeding checks this
   * rather than an empty collection, so a user who deletes both defaults does
   * not get them back on the next sign-in.
   */
  supplementsSeededAt?: string
  lastLoginAt?: string
  createdAt?: string
  updatedAt?: string
}

/** The single meta/seats document that caps how many accounts can exist. */
export interface SeatCounter {
  /** Accounts created so far. Only ever incremented, one per new profile. */
  count: number
  /** Maximum number of accounts allowed. */
  limit: number
  updatedAt?: string
}
