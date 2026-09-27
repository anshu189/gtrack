/**
 * Maps Firebase Auth error codes to sentence-case messages we can show in the UI.
 * Deliberately vague on wrong-email vs wrong-password so the form does not
 * confirm whether an account exists.
 */
const MESSAGES: Record<string, string> = {
  'auth/invalid-email': 'That email address is not valid.',
  'auth/missing-email': 'Enter your email address.',
  'auth/missing-password': 'Enter your password.',
  'auth/weak-password': 'Password is too weak — use at least 8 characters.',
  'auth/email-already-in-use': 'An account already exists for that email. Try signing in instead.',
  'auth/invalid-credential': 'Email or password is incorrect.',
  'auth/wrong-password': 'Email or password is incorrect.',
  'auth/user-not-found': 'Email or password is incorrect.',
  'auth/user-disabled': 'That account has been disabled.',
  'auth/too-many-requests': 'Too many attempts. Wait a moment and try again.',
  'auth/network-request-failed': 'Network error — check your connection and try again.',
  'auth/popup-closed-by-user': 'Sign-in was cancelled.',
  'auth/cancelled-popup-request': 'Sign-in was cancelled.',
  'auth/account-exists-with-different-credential':
    'That email is already registered with a different sign-in method.',
  'auth/operation-not-allowed':
    'That sign-in method is not enabled for this project yet.',
  'auth/requires-recent-login': 'Please sign in again to continue.',
  'permission-denied': 'Your account does not have access to this data.',
}

export function authErrorMessage(error: unknown): string {
  const code = (error as { code?: string })?.code
  if (code && MESSAGES[code]) return MESSAGES[code]
  const message = (error as { message?: string })?.message
  if (message) return message.replace(/^Firebase:\s*/, '').replace(/\s*\(auth\/[^)]+\)\.?$/, '')
  return 'Something went wrong. Please try again.'
}
