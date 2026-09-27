/**
 * One-time migration: copy the legacy global GTrak collections into
 * users/{uid}/<collection>.
 *
 * Safety properties:
 *  - Dry run by default. Nothing is written unless you pass --apply.
 *  - Nothing is ever deleted. The legacy collections are left exactly as they are.
 *  - Before applying, every document it read is written to a local JSON backup,
 *    which is the first full backup of `foods` this project has ever had.
 *
 * Run this BEFORE pasting the new firestore.rules, while the current permissive
 * rules still allow reading the legacy top-level collections. It signs in
 * anonymously, so no password is ever needed or stored.
 *
 * Usage:
 *   node scripts/migrate-to-user.mjs --uid <your-uid>            # dry run
 *   node scripts/migrate-to-user.mjs --uid <your-uid> --apply    # write
 *
 * Find <your-uid> in Firebase console -> Authentication -> Users, after you
 * have signed up in the new app once.
 */
import { writeFileSync, mkdirSync } from 'node:fs'
import { initializeApp } from 'firebase/app'
import { getFirestore, collection, getDocs, doc, writeBatch } from 'firebase/firestore'
import { getAuth, signInAnonymously } from 'firebase/auth'

const firebaseConfig = {
  apiKey: 'AIzaSyDOGyUkJmTgb6wkr_ALWk9H2Z05GOTCxDQ',
  authDomain: 'gs-gtrak.firebaseapp.com',
  projectId: 'gs-gtrak',
  storageBucket: 'gs-gtrak.firebasestorage.app',
  messagingSenderId: '17387732537',
  appId: '1:17387732537:web:609c77e8b1903ec7bb97e8',
}

/** Backups are gitignored — they hold personal data and must never be committed. */
const BACKUP_DIR = 'backups'

const COLLECTIONS = [
  'foods',
  'categories',
  'quantityPresets',
  'nutritionSources',
  'settings',
  'meals',
  'deletedMeals',
  'history',
  'favorites',
  'workouts',
  'waterLogs',
  'weights',
  'dailyNotes',
  'tretinoinLogs',
  'respectLogs',
]

const BATCH_LIMIT = 490

function parseArgs(argv) {
  const args = { uid: undefined, apply: false }
  for (let i = 2; i < argv.length; i++) {
    if (argv[i] === '--uid') args.uid = argv[++i]
    else if (argv[i] === '--apply') args.apply = true
  }
  return args
}

function stripUndefined(value) {
  if (Array.isArray(value)) return value.map(stripUndefined)
  if (value && typeof value === 'object' && !(value instanceof Date)) {
    const out = {}
    for (const [k, v] of Object.entries(value)) {
      if (v === undefined) continue
      out[k] = stripUndefined(v)
    }
    return out
  }
  return value
}

async function main() {
  const { uid, apply } = parseArgs(process.argv)
  if (!uid) {
    console.error('Missing --uid <your-uid>. Find it in Firebase console -> Authentication -> Users.')
    process.exit(1)
  }

  const app = initializeApp(firebaseConfig)
  const db = getFirestore(app)
  await signInAnonymously(getAuth(app))

  console.log(`\nGTrak migration -> users/${uid}`)
  console.log(apply ? 'MODE: APPLY (documents will be written)\n' : 'MODE: DRY RUN (nothing will be written)\n')

  const snapshot = {}
  let total = 0

  for (const name of COLLECTIONS) {
    let docs = []
    try {
      const snap = await getDocs(collection(db, name))
      // _docId is the real Firestore document id. A document's own `id` field
      // is not always identical to it, so it must never shadow the real id —
      // doing so collides documents that share an `id` value.
      docs = snap.docs.map((d) => ({ _docId: d.id, ...d.data() }))
    } catch (error) {
      console.log(`${name.padEnd(18)} unreadable — ${error?.code ?? error?.message ?? error}`)
      continue
    }
    snapshot[name] = docs
    total += docs.length
    console.log(`${name.padEnd(18)} ${String(docs.length).padStart(5)} document(s)`)
  }

  console.log(`\nTotal: ${total} document(s) across ${Object.keys(snapshot).length} collection(s).`)

  const stamp = new Date().toISOString().replace(/[:.]/g, '-')
  mkdirSync(BACKUP_DIR, { recursive: true })
  const backupPath = `${BACKUP_DIR}/gtrak-legacy-backup-${stamp}.json`
  writeFileSync(backupPath, JSON.stringify({ migratedFrom: 'global', uid, snapshot }, null, 2))
  console.log(`Backup of everything read: ${backupPath}`)

  if (!apply) {
    console.log('\nDry run complete. Re-run with --apply to write these into users/<uid>/.')
    process.exit(0)
  }

  console.log('\nWriting...')
  for (const [name, docs] of Object.entries(snapshot)) {
    if (!docs.length) continue
    let batch = writeBatch(db)
    let pending = 0
    let written = 0
    for (const item of docs) {
      const { _docId, ...data } = item
      batch.set(doc(db, 'users', uid, name, _docId), stripUndefined(data))
      pending++
      written++
      if (pending >= BATCH_LIMIT) {
        await batch.commit()
        batch = writeBatch(db)
        pending = 0
      }
    }
    if (pending > 0) await batch.commit()
    console.log(`${name.padEnd(18)} ${String(written).padStart(5)} written`)
  }

  console.log('\nMigration complete. The legacy global collections were not touched.')
  process.exit(0)
}

main().catch((error) => {
  console.error('\nMigration failed:', error)
  process.exit(1)
})
