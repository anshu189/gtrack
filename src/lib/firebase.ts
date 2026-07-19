import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getAuth, signInAnonymously } from 'firebase/auth'

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

export async function ensureSignedIn() {
  if (!auth.currentUser) {
    await signInAnonymously(auth)
  }
}