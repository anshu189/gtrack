/**
 * Creates the meta/seats counter that caps how many accounts can exist,
 * and lists any user profiles that already exist.
 *
 * Idempotent: if meta/seats already exists it prints the current values and
 * changes nothing, so it can never reset your seat count by accident.
 *
 * Usage:
 *   node scripts/init-seats.mjs                 # create with limit 50, or report
 *   node scripts/init-seats.mjs --limit 100     # different limit on first create
 */
import { initializeApp } from 'firebase/app'
import { getFirestore, doc, getDoc, setDoc, collection, getDocs } from 'firebase/firestore'
import { getAuth, signInAnonymously } from 'firebase/auth'

const firebaseConfig = {
  apiKey: 'AIzaSyDOGyUkJmTgb6wkr_ALWk9H2Z05GOTCxDQ',
  authDomain: 'gs-gtrak.firebaseapp.com',
  projectId: 'gs-gtrak',
  storageBucket: 'gs-gtrak.firebasestorage.app',
  messagingSenderId: '17387732537',
  appId: '1:17387732537:web:609c77e8b1903ec7bb97e8',
}

function parseArgs(argv) {
  const args = { limit: 50 }
  for (let i = 2; i < argv.length; i++) {
    if (argv[i] === '--limit') args.limit = Number(argv[++i])
  }
  return args
}

async function main() {
  const { limit } = parseArgs(process.argv)
  if (!Number.isInteger(limit) || limit < 1) {
    console.error('--limit must be a positive whole number')
    process.exit(1)
  }

  const app = initializeApp(firebaseConfig)
  const db = getFirestore(app)
  await signInAnonymously(getAuth(app))

  const ref = doc(db, 'meta', 'seats')
  const snap = await getDoc(ref)

  if (snap.exists()) {
    const data = snap.data()
    console.log(`\nmeta/seats already exists — leaving it alone.`)
    console.log(`  count: ${data.count}  (${typeof data.count})`)
    console.log(`  limit: ${data.limit}  (${typeof data.limit})`)
  } else {
    await setDoc(ref, { count: 0, limit, updatedAt: new Date().toISOString() })
    console.log(`\nCreated meta/seats with count: 0, limit: ${limit}.`)
  }

  const users = await getDocs(collection(db, 'users'))
  console.log(`\nExisting user profiles: ${users.size}`)
  for (const d of users.docs) {
    const data = d.data()
    console.log(`  ${d.id}  ${data.email ?? '(no email)'}  provisioned: ${data.provisionedAt ? 'yes' : 'no'}`)
  }
  console.log('')
  process.exit(0)
}

main().catch((error) => {
  console.error('\nFailed:', error)
  process.exit(1)
})
