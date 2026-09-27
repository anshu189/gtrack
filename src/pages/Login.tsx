import { useState } from 'react'
import { Button, Card, PasswordField, TextField, TextLink } from '@/components/ds'
import { GoogleSignInButton } from '@/components/auth'
import { useAuthStore } from '@/stores/authStore'

type Mode = 'signin' | 'signup' | 'reset'

const MIN_PASSWORD_LENGTH = 8

/** Gtrak DS voice: friendly coach, second person. Title Case for short titles. */
const COPY: Record<Mode, { heading: string; sub: string; submit: string }> = {
  signin: { heading: 'Welcome back', sub: 'Pick up where you left off.', submit: 'Sign In' },
  signup: { heading: 'Create Your Account', sub: 'Your log stays private to you.', submit: 'Create Account' },
  reset: { heading: 'Reset Your Password', sub: 'We will email you a reset link.', submit: 'Send Reset Link' },
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

  const update = (setter: (v: string) => void) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setter(e.target.value)
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
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
    <div className="flex min-h-screen justify-center bg-canvas px-4 py-10">
      <div className="flex w-full max-w-[420px] flex-col gap-8">
        <div className="flex items-center gap-3 pt-6">
          <div className="flex h-12 w-12 items-center justify-center gap-[6px] rounded-lg bg-black">
            <span className="h-[5px] w-[5px] rounded-pill bg-on-ink" />
            <span className="h-[5px] w-[5px] rounded-pill bg-on-ink" />
            <span className="h-[5px] w-[5px] rounded-pill bg-on-ink" />
          </div>
          <div>
            <p className="title-2 text-black">Gtrak</p>
            <p className="caption text-ink-2">Growth Tracker for G's</p>
          </div>
        </div>

        <Card className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <h1 className="title-2 text-black">{copy.heading}</h1>
            <p className="body-text text-ink-2">{copy.sub}</p>
          </div>

          <form className="flex flex-col gap-6" onSubmit={handleSubmit} noValidate>
            <div className="flex flex-col gap-3">
              {mode === 'signup' && (
                <TextField
                  label="Name"
                  value={displayName}
                  onChange={update(setDisplayName)}
                  placeholder="What should we call you?"
                  autoComplete="name"
                />
              )}

              <TextField
                label="Email"
                type="email"
                value={email}
                onChange={update(setEmail)}
                placeholder="you@example.com"
                autoComplete="email"
              />

              {mode !== 'reset' && (
                <PasswordField
                  label="Password"
                  value={password}
                  onChange={update(setPassword)}
                  placeholder={mode === 'signup' ? `At least ${MIN_PASSWORD_LENGTH} characters` : 'Your password'}
                  autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                />
              )}

              {mode === 'signup' && (
                <PasswordField
                  label="Confirm password"
                  value={confirmPassword}
                  onChange={update(setConfirmPassword)}
                  placeholder="Repeat your password"
                  autoComplete="new-password"
                />
              )}
            </div>

            {feedbackError && (
              <p className="flex items-start gap-2 footnote text-black">
                <span aria-hidden="true" className="mt-1 size-2 shrink-0 rounded-pill bg-protein" />
                {feedbackError}
              </p>
            )}
            {notice && (
              <p className="rounded-md bg-success-soft px-4 py-3 footnote text-success-text">{notice}</p>
            )}

            {/* Gtrak DS: one primary action per screen. */}
            <div className="flex flex-col gap-3">
              <Button type="submit" variant="primary" size="lg" block isLoading={loading}>
                {copy.submit}
              </Button>

              {mode !== 'reset' && (
                <>
                  <div className="flex items-center gap-3">
                    <span className="h-px flex-1 bg-line" />
                    <span className="caption text-ink-3">or</span>
                    <span className="h-px flex-1 bg-line" />
                  </div>
                  <GoogleSignInButton onClick={signInWithGoogle} disabled={loading} />
                </>
              )}
            </div>
          </form>

          {/* Only the link text is interactive — never the sentence around it. */}
          <div className="flex flex-col items-start gap-2 body-text text-ink-2">
            {mode === 'signin' && (
              <>
                <TextLink onClick={() => switchMode('reset')}>Forgot your password?</TextLink>
                <p className="body-text text-ink-2">
                  New here? <TextLink onClick={() => switchMode('signup')}>Create an account</TextLink>
                </p>
              </>
            )}
            {mode === 'signup' && (
              <p className="body-text text-ink-2">
                Already have an account? <TextLink onClick={() => switchMode('signin')}>Sign in</TextLink>
              </p>
            )}
            {mode === 'reset' && (
              <TextLink onClick={() => switchMode('signin')}>Back to sign in</TextLink>
            )}
          </div>
        </Card>

        <p className="text-center caption text-ink-3">Limited to 50 accounts.</p>
      </div>
    </div>
  )
}

export default Login
