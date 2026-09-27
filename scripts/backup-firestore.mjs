/**
 * Read-only backup of the whole GTrak Firestore database to a local JSON file.
 *
 * This script ONLY READS. It contains no write, update or delete call of any
 * kind, so it cannot damage anything no matter how often you run it.
 *
 * It backs up both layouts, whichever exist:
 *   - the legacy top-level collections (foods, meals, history, ...)
 *   - every users/{uid}/... subtree
 *
 * Run it before the migration, and again any time you want a snapshot.
 *
 * Usage:
 *   node scripts/backup-firestore.mjs
 *   node scripts/backup-firestore.mjs --out my-backup.json
 */
import { writeFileSync, mkdirSync } from 'node:fs'
import { initializeApp } from 'firebase/app'
import { getFirestore, collection, collectionGroup, getDocs } from 'firebase/firestore'
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

function parseArgs(argv) {
  const args = { out: undefined }
  for (let i = 2; i < argv.length; i++) {
    if (argv[i] === '--out') args.out = argv[++i]
  }
  return args
}

async function main() {
  const { out } = parseArgs(process.argv)

  const app = initializeApp(firebaseConfig)
  const db = getFirestore(app)
  await signInAnonymously(getAuth(app))

  console.log('\nGTrak backup — read only, nothing will be modified.\n')

  const legacy = {}
  let legacyTotal = 0

  for (const name of COLLECTIONS) {
    try {
      const snap = await getDocs(collection(db, name))
      // _docId is the real Firestore document id and is authoritative. Document
      // data may also carry its own `id` field, which is NOT always the same —
      // so it is kept as-is rather than being allowed to shadow the real id.
      legacy[name] = snap.docs.map((d) => ({ _docId: d.id, ...d.data() }))
      legacyTotal += snap.size
      console.log(`legacy/${name}`.padEnd(30) + String(snap.size).padStart(6) + ' doc(s)')
    } catch (error) {
      console.log(`legacy/${name}`.padEnd(30) + `skipped — ${error?.code ?? error?.message ?? error}`)
    }
  }

  // Per-user subtrees, if the migration has already run.
  const perUser = {}
  let perUserTotal = 0

  for (const name of COLLECTIONS) {
    try {
      const snap = await getDocs(collectionGroup(db, name))
      for (const d of snap.docs) {
        // users/{uid}/{name}/{docId}
        const segments = d.ref.path.split('/')
        if (segments[0] !== 'users' || segments.length < 4) continue
        const uid = segments[1]
        perUser[uid] ??= {}
        perUser[uid][name] ??= []
        perUser[uid][name].push({ _docId: d.id, ...d.data() })
        perUserTotal++
      }
    } catch {
      // A collection group with no documents, or blocked by rules — skip quietly.
    }
  }

  for (const [uid, collections] of Object.entries(perUser)) {
    const count = Object.values(collections).reduce((sum, docs) => sum + docs.length, 0)
    console.log(`users/${uid}`.padEnd(30) + String(count).padStart(6) + ' doc(s)')
  }

  const stamp = new Date().toISOString().replace(/[:.]/g, '-')
  mkdirSync(BACKUP_DIR, { recursive: true })
  const path = out ?? `${BACKUP_DIR}/gtrak-backup-${stamp}.json`
  writeFileSync(
    path,
    JSON.stringify(
      { backedUpAt: new Date().toISOString(), projectId: firebaseConfig.projectId, legacy, perUser },
      null,
      2,
    ),
  )

  console.log(`\nLegacy documents:   ${legacyTotal}`)
  console.log(`Per-user documents: ${perUserTotal}`)
  console.log(`\nSaved to: ${path}`)
  console.log('Keep a copy somewhere outside this folder too.\n')
  process.exit(0)
}

main().catch((error) => {
  console.error('\nBackup failed:', error)
  process.exit(1)
})
