import { create } from 'zustand'
import {
  completeRedirectSignIn,
  discardCurrentUser,
  observeAuth,
  sendPasswordReset,
  signInWithEmail,
  signInWithGoogle,
  signOut as firebaseSignOut,
  signUpWithEmail,
  type AuthUser,
} from '@/lib/firebase'
import { providerFromId, SeatsFullError, SeatsMissingError, userRepository } from '@/lib/repositories'
import { provisionUser } from '@/lib/seed'
import { authErrorMessage } from '@/lib/utils/authErrors'
import type { UserProfile } from '@/types'

const SEATS_FULL_MESSAGE = 'All seats are full. Please wait for next round.'
const SEATS_MISSING_MESSAGE = 'Sign-ups are not open yet. Please try again later.'

type AuthState = {
  user?: AuthUser
  profile?: UserProfile
  /** False until the first auth state callback has landed — gates the app shell. */
  initialized: boolean
  loading: boolean
  error?: string | null
  notice?: string | null
  init: () => () => void
  signUp: (email: string, password: string, displayName?: string) => Promise<void>
  signIn: (email: string, password: string) => Promise<void>
  signInWithGoogle: () => Promise<void>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
  clearFeedback: () => void
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: undefined,
  profile: undefined,
  initialized: false,
  loading: false,
  error: null,
  notice: null,

  /**
   * Single funnel for sign-in side effects. Sign-up / sign-in / Google all
   * resolve here, so the seat claim and provisioning run exactly once.
   */
  init: () => {
    completeRedirectSignIn().catch((e) => set({ error: authErrorMessage(e) }))

    return observeAuth(async (user) => {
      if (!user) {
        set({ user: undefined, profile: undefined, loading: false, initialized: true })
        return
      }

      set({ loading: true })
      try {
        const existing = await userRepository.getProfile(user.uid)

        // Creates the profile and takes a seat for a new user; a returning
        // user keeps the seat they already hold.
        await userRepository.claimSeat(user.uid, {
          email: user.email ?? undefined,
          displayName: user.displayName ?? undefined,
          photoURL: user.photoURL ?? undefined,
          provider: providerFromId(user.providerData[0]?.providerId),
          lastLoginAt: new Date().toISOString(),
        })

        await provisionUser(user.uid)
        if (!existing?.provisionedAt) await userRepository.markProvisioned(user.uid)

        const profile = await userRepository.getProfile(user.uid)
        set({ user, profile, loading: false, initialized: true, error: null })
      } catch (e) {
        const message =
          e instanceof SeatsFullError ? SEATS_FULL_MESSAGE
          : e instanceof SeatsMissingError ? SEATS_MISSING_MESSAGE
          : authErrorMessage(e)
        await discardCurrentUser()
        set({
          user: undefined,
          profile: undefined,
          loading: false,
          initialized: true,
          error: message,
        })
      }
    })
  },

  signUp: async (email: string, password: string, displayName?: string) => {
    set({ loading: true, error: null, notice: null })
    try {
      await signUpWithEmail(email, password, displayName)
      // init()'s observer takes it from here.
    } catch (e) {
      set({ loading: false, error: authErrorMessage(e) })
    }
  },

  signIn: async (email: string, password: string) => {
    set({ loading: true, error: null, notice: null })
    try {
      await signInWithEmail(email, password)
    } catch (e) {
      set({ loading: false, error: authErrorMessage(e) })
    }
  },

  signInWithGoogle: async () => {
    set({ loading: true, error: null, notice: null })
    try {
      await signInWithGoogle()
    } catch (e) {
      set({ loading: false, error: authErrorMessage(e) })
    }
  },

  signOut: async () => {
    set({ loading: true, error: null, notice: null })
    try {
      await firebaseSignOut()
      // Hard reload so no previous user's data survives in any store.
      window.location.replace('/')
    } catch (e) {
      set({ loading: false, error: authErrorMessage(e) })
    }
  },

  resetPassword: async (email: string) => {
    set({ loading: true, error: null, notice: null })
    try {
      await sendPasswordReset(email)
      set({ loading: false, notice: `Password reset link sent to ${email.trim()}.` })
    } catch (e) {
      set({ loading: false, error: authErrorMessage(e) })
    }
  },

  clearFeedback: () => {
    if (get().error || get().notice) set({ error: null, notice: null })
  },
}))
