/**
 * Sets a sensible default serving size on specific foods.
 *
 * The app opens the quantity picker at a food's servingSize/servingUnit
 * (AddItem.handleSelect), so this makes "Milk" default to 300 ml instead of
 * 100 g. It changes ONLY servingSize and servingUnit — nutrition, which is
 * stored per 100 g, is never touched.
 *
 * Dry run by default; pass --apply to write.
 *
 *   node scripts/set-serving-defaults.mjs
 *   node scripts/set-serving-defaults.mjs --apply
 *
 * It asks for your email and password on the terminal (the rules require a
 * signed-in user). The password is not echoed and never reaches your shell
 * history. GTRAK_EMAIL / GTRAK_PASSWORD are used instead when they are set.
 */
import { initializeApp } from 'firebase/app'
import { getFirestore, collection, getDocs, doc, writeBatch } from 'firebase/firestore'
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth'

const firebaseConfig = {
  apiKey: 'AIzaSyDOGyUkJmTgb6wkr_ALWk9H2Z05GOTCxDQ',
  authDomain: 'gs-gtrak.firebaseapp.com',
  projectId: 'gs-gtrak',
  storageBucket: 'gs-gtrak.firebasestorage.app',
  messagingSenderId: '17387732537',
  appId: '1:17387732537:web:609c77e8b1903ec7bb97e8',
}

/** name pattern -> default serving. First match wins. */
const RULES = [
  { match: /^milk\b|buttermilk|chaas/i, size: 300, unit: 'ml' },
  { match: /curd|yogurt|dahi/i, size: 200, unit: 'g' },
  { match: /chicken, skinless/i, size: 200, unit: 'g' },
  { match: /^rice\b/i, size: 300, unit: 'g' },
  { match: /khichdi/i, size: 300, unit: 'g' },
  { match: /roti|chapati|paratha|naan/i, size: 4, unit: 'piece' },
  { match: /^(banana|apple|orange|mango|guava|pear|egg|kiwi|peach|plum)\b/i, size: 1, unit: 'piece' },
  { match: /custard apple/i, size: 1, unit: 'piece' },
]

const apply = process.argv.includes('--apply')

function ask(query) {
  return new Promise((resolve) => {
    process.stdout.write(query)
    const stdin = process.stdin
    stdin.resume()
    stdin.setEncoding('utf8')
    const onData = (chunk) => {
      stdin.pause()
      stdin.removeListener('data', onData)
      resolve(String(chunk).trim())
    }
    stdin.on('data', onData)
  })
}

function askHidden(query) {
  return new Promise((resolve) => {
    process.stdout.write(query)
    const stdin = process.stdin
    if (stdin.setRawMode) stdin.setRawMode(true)
    stdin.resume()
    stdin.setEncoding('utf8')
    let value = ''
    const onData = (ch) => {
      if (ch === '\r' || ch === '\n' || ch === '\u0004') {
        if (stdin.setRawMode) stdin.setRawMode(false)
        stdin.pause()
        stdin.removeListener('data', onData)
        process.stdout.write('\n')
        resolve(value)
      } else if (ch === '\u0003') {
        process.stdout.write('\n')
        process.exit(1)
      } else if (ch === '\u007f' || ch === '\b') {
        value = value.slice(0, -1)
      } else {
        value += ch
      }
    }
    stdin.on('data', onData)
  })
}

async function main() {
  const email = process.env.GTRAK_EMAIL || (await ask('Email: '))
  const password = process.env.GTRAK_PASSWORD || (await askHidden('Password: '))
  if (!email || !password) {
    console.error('Email and password are both required.')
    process.exit(1)
  }

  const app = initializeApp(firebaseConfig)
  const db = getFirestore(app)
  const cred = await signInWithEmailAndPassword(getAuth(app), email, password)
  const uid = cred.user.uid

  const snap = await getDocs(collection(db, 'users', uid, 'foods'))
  console.log(`\n${snap.size} foods. ${apply ? 'MODE: APPLY' : 'MODE: DRY RUN'}\n`)

  const changes = []
  for (const d of snap.docs) {
    const food = d.data()
    const rule = RULES.find((r) => r.match.test(food.name ?? ''))
    if (!rule) continue
    if (food.servingSize === rule.size && food.servingUnit === rule.unit) continue
    changes.push({
      id: d.id,
      name: food.name,
      from: `${food.servingSize ?? '-'} ${food.servingUnit ?? '-'}`,
      to: `${rule.size} ${rule.unit}`,
      size: rule.size,
      unit: rule.unit,
    })
  }

  if (!changes.length) {
    console.log('Nothing to change.')
    process.exit(0)
  }

  for (const c of changes) {
    console.log(`  ${String(c.name).padEnd(34)} ${c.from.padStart(10)}  ->  ${c.to}`)
  }
  console.log(`\n${changes.length} food(s) would change.`)

  if (!apply) {
    console.log('\nDry run. Re-run with --apply to write.')
    process.exit(0)
  }

  const now = new Date().toISOString()
  let batch = writeBatch(db)
  let pending = 0
  for (const c of changes) {
    batch.update(doc(db, 'users', uid, 'foods', c.id), {
      servingSize: c.size,
      servingUnit: c.unit,
      updatedAt: now,
    })
    if (++pending >= 400) {
      await batch.commit()
      batch = writeBatch(db)
      pending = 0
    }
  }
  if (pending) await batch.commit()
  console.log('\nDone. Nutrition values were not touched.')
  process.exit(0)
}

main().catch((e) => {
  console.error('\nFailed:', e?.code ?? e?.message ?? e)
  process.exit(1)
})
