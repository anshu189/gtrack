import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import {
  getAuth,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  GoogleAuthProvider,
  updateProfile,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  sendEmailVerification as firebaseSendEmailVerification,
  type User,
} from 'firebase/auth'

const firebaseConfig = {
  apiKey: "AIzaSyDOGyUkJmTgb6wkr_ALWk9H2Z05GOTCxDQ",
  authDomain: "gs-gtrak.firebaseapp.com",
  projectId: "gs-gtrak",
  storageBucket: "gs-gtrak.firebasestorage.app",
  messagingSenderId: "17387732537",
  appId: "1:17387732537:web:609c77e8b1903ec7bb97e8"
}

const app = initializeApp(firebaseConfig)
export const firestore = getFirestore(app)
export const auth = getAuth(app)

const googleProvider = new GoogleAuthProvider()
googleProvider.setCustomParameters({ prompt: 'select_account' })

export type AuthUser = User

/** Subscribe to sign-in state. Returns the unsubscribe function. */
export function observeAuth(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback)
}

/** Uid of the signed-in user, or undefined when signed out. */
export function currentUid(): string | undefined {
  return auth.currentUser?.uid ?? undefined
}

export async function signUpWithEmail(email: string, password: string, displayName?: string) {
  const credential = await createUserWithEmailAndPassword(auth, email.trim(), password)
  const name = displayName?.trim()
  if (name) await updateProfile(credential.user, { displayName: name })
  return credential.user
}

export async function signInWithEmail(email: string, password: string) {
  const credential = await signInWithEmailAndPassword(auth, email.trim(), password)
  return credential.user
}

/**
 * Google sign-in via popup, falling back to a full-page redirect when the
 * popup is blocked (common on in-app browsers and some mobile setups).
 * Returns undefined when a redirect was started — the result is picked up by
 * completeRedirectSignIn() on the next load.
 */
export async function signInWithGoogle(): Promise<User | undefined> {
  try {
    const credential = await signInWithPopup(auth, googleProvider)
    return credential.user
  } catch (error: any) {
    const code = error?.code
    if (
      code === 'auth/popup-blocked' ||
      code === 'auth/popup-closed-by-user' ||
      code === 'auth/cancelled-popup-request' ||
      code === 'auth/operation-not-supported-in-environment'
    ) {
      if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') throw error
      await signInWithRedirect(auth, googleProvider)
      return undefined
    }
    throw error
  }
}

/** Resolves a pending redirect sign-in on app load. */
export async function completeRedirectSignIn(): Promise<User | undefined> {
  const result = await getRedirectResult(auth)
  return result?.user ?? undefined
}

export function signOut() {
  return firebaseSignOut(auth)
}

export function sendPasswordReset(email: string) {
  return sendPasswordResetEmail(auth, email.trim())
}

export function sendVerificationEmail() {
  if (!auth.currentUser) throw new Error('Not signed in')
  return firebaseSendEmailVerification(auth.currentUser)
}

/**
 * Ends a session that could not be admitted — no seat left, or provisioning
 * failed. Deliberately only signs out rather than deleting the account: an
 * unadmitted account can read and write nothing, so leaving it costs nothing,
 * and it can claim a seat later if one frees up.
 */
export async function discardCurrentUser() {
  if (!auth.currentUser) return
  await firebaseSignOut(auth)
}
