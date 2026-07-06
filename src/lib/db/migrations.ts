import type { Dexie } from 'dexie'

export type Migration = {
  version: number
  up: (db: Dexie) => Promise<void>
}

// Example migration list — keep as a scaffold for future schema changes.
export const migrations: Migration[] = [
  {
    version: 1,
    up: async (_db) => {
      // v1 initial schema created in src/lib/db/index.ts
    },
  },
]
