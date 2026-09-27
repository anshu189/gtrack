import { useState } from 'react'
import { TextInput, Button } from '@astryxdesign/core'
import { GoogleSignInButton } from '@/components/auth'
import { useAuthStore } from '@/stores/authStore'

type Mode = 'signin' | 'signup' | 'reset'

const MIN_PASSWORD_LENGTH = 8

const COPY: Record<Mode, { heading: string; sub: string; submit: string }> = {
  signin: { heading: 'Welcome back', sub: 'Sign in to continue tracking.', submit: 'Sign in' },
  signup: { heading: 'Create your account', sub: 'Your log stays private to you.', submit: 'Create account' },
  reset: { heading: 'Reset your password', sub: 'We will email you a reset link.', submit: 'Send reset link' },
}

const Login = () => {
  const { loading, error, notice, signIn, signUp, signInWithGoogle, resetPassword, clearFeedback } = useAuthStore()

  const [mode, setMode] = useState<Mode>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [localError, setLocalError] = useState<string | null>(null)

  const copy = COPY[mode]
  const feedbackError = localError ?? error

  const switchMode = (next: Mode) => {
    setMode(next)
    setLocalError(null)
    setPassword('')
    setConfirmPassword('')
    clearFeedback()
  }

  const update = (setter: (v: string) => void) => (value: string) => {
    setter(value)
    if (localError) setLocalError(null)
    clearFeedback()
  }

  const validate = (): string | null => {
    if (!email.trim()) return 'Enter your email address.'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return 'That email address is not valid.'
    if (mode === 'reset') return null
    if (!password) return 'Enter your password.'
    if (mode === 'signup') {
      if (password.length < MIN_PASSWORD_LENGTH) return `Use at least ${MIN_PASSWORD_LENGTH} characters for your password.`
      if (password !== confirmPassword) return 'Passwords do not match.'
    }
    return null
  }

  const handleSubmit = async () => {
    const problem = validate()
    if (problem) {
      setLocalError(problem)
      return
    }
    setLocalError(null)
    if (mode === 'signin') await signIn(email, password)
    else if (mode === 'signup') await signUp(email, password, displayName)
    else await resetPassword(email)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--color-bg)] px-4 py-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center gap-[6px] rounded-lg bg-[#0c0c0c]">
            <div className="h-[5px] w-[5px] rounded-full bg-white" />
            <div className="h-[5px] w-[5px] rounded-full bg-white" />
            <div className="h-[5px] w-[5px] rounded-full bg-white" />
          </div>
          <div>
            <p className="text-xl font-bold tracking-tight text-[var(--color-text)]">Gtrak</p>
            <p className="text-[12px] text-[var(--color-muted)]">Growth Tracker for G's</p>
          </div>
        </div>

        <div className="flex flex-col gap-5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
          <div className="flex flex-col gap-1">
            <h1 className="text-base font-semibold text-[var(--color-text)]">{copy.heading}</h1>
            <p className="text-sm text-[var(--color-muted)]">{copy.sub}</p>
          </div>

          <div className="flex flex-col gap-3">
            {mode === 'signup' && (
              <TextInput
                label="Name"
                value={displayName}
                onChange={update(setDisplayName)}
                placeholder="What should we call you?"
                isOptional
                size="lg"
                width="100%"
                className="rounded-lg"
              />
            )}

            <TextInput
              label="Email"
              type="email"
              value={email}
              onChange={update(setEmail)}
              placeholder="you@example.com"
              size="lg"
              width="100%"
              className="rounded-lg"
            />

            {mode !== 'reset' && (
              <TextInput
                label="Password"
                type="password"
                value={password}
                onChange={update(setPassword)}
                placeholder={mode === 'signup' ? `At least ${MIN_PASSWORD_LENGTH} characters` : 'Your password'}
                description={mode === 'signup' ? 'Use at least 8 characters.' : undefined}
                size="lg"
                width="100%"
                className="rounded-lg"
              />
            )}

            {mode === 'signup' && (
              <TextInput
                label="Confirm password"
                type="password"
                value={confirmPassword}
                onChange={update(setConfirmPassword)}
                placeholder="Repeat your password"
                size="lg"
                width="100%"
                className="rounded-lg"
              />
            )}
          </div>

          {feedbackError && (
            <p className="rounded-lg border border-[var(--color-error)] bg-[var(--color-error-muted)] px-3 py-2 text-sm text-[var(--color-text)]">
              {feedbackError}
            </p>
          )}
          {notice && (
            <p className="rounded-lg border border-[var(--color-success)] bg-[var(--color-success-muted)] px-3 py-2 text-sm text-[var(--color-text)]">
              {notice}
            </p>
          )}

          <div className="flex flex-col gap-3">
            <Button
              label={copy.submit}
              variant="primary"
              size="lg"
              width="100%"
              onClick={handleSubmit}
              isLoading={loading}
              className="rounded-lg"
            />

            {mode !== 'reset' && (
              <>
                <div className="flex items-center gap-3">
                  <span className="h-px flex-1 bg-[var(--color-border)]" />
                  <span className="text-xs text-[var(--color-muted)]">or</span>
                  <span className="h-px flex-1 bg-[var(--color-border)]" />
                </div>
                <GoogleSignInButton onClick={signInWithGoogle} isDisabled={loading} />
              </>
            )}
          </div>

          <div className="flex flex-col gap-2 text-sm">
            {mode === 'signin' && (
              <>
                <button type="button" className="text-left text-[var(--color-accent)]" onClick={() => switchMode('reset')}>
                  Forgot your password?
                </button>
                <p className="text-[var(--color-muted)]">
                  New here?{' '}
                  <button type="button" className="text-[var(--color-accent)]" onClick={() => switchMode('signup')}>
                    Create an account
                  </button>
                </p>
              </>
            )}
            {mode === 'signup' && (
              <p className="text-[var(--color-muted)]">
                Already have an account?{' '}
                <button type="button" className="text-[var(--color-accent)]" onClick={() => switchMode('signin')}>
                  Sign in
                </button>
              </p>
            )}
            {mode === 'reset' && (
              <button type="button" className="text-left text-[var(--color-accent)]" onClick={() => switchMode('signin')}>
                Back to sign in
              </button>
            )}
          </div>
        </div>

        <p className="text-center text-xs text-[var(--color-muted)]">
          Limited to 50 accounts.
        </p>
      </div>
    </div>
  )
}

export default Login
