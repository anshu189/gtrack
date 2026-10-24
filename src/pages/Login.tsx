import { useEffect, useState } from 'react'
import { Button, Checkbox, Icon, PasswordField, TextField, TextLink } from '@/components/ds'
import { GoogleSignInButton } from '@/components/auth'
import { useAuthStore } from '@/stores/authStore'

type Mode = 'signin' | 'signup' | 'reset'

const MIN_PASSWORD_LENGTH = 8

/** Gtrak DS voice: friendly coach, second person. Title Case for short titles. */
const COPY: Record<Mode, { heading: string; sub: string; submit: string }> = {
  signin: {
    heading: 'Welcome Back',
    sub: 'Sign in to your account and keep growing.',
    submit: 'Sign In',
  },
  signup: {
    heading: 'Create Your Account',
    sub: 'Your log stays private to you.',
    submit: 'Create Account',
  },
  reset: {
    heading: 'Reset Your Password',
    sub: 'We will email you a reset link.',
    submit: 'Send Reset Link',
  },
}

const Login = () => {
  const {
    loading,
    error,
    notice,
    seats,
    loadSeats,
    signIn,
    signUp,
    signInWithGoogle,
    resetPassword,
    clearFeedback,
  } = useAuthStore()

  const [mode, setMode] = useState<Mode>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [remember, setRemember] = useState(true)
  const [localError, setLocalError] = useState<string | null>(null)

  const copy = COPY[mode]
  const feedbackError = localError ?? error

  useEffect(() => {
    loadSeats()
  }, [loadSeats])

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
    if (mode === 'signin') await signIn(email, password, remember)
    else if (mode === 'signup') await signUp(email, password, displayName)
    else await resetPassword(email)
  }

  /**
   * How many accounts can still be created — `limit - count`, the same figure
   * the sign-up gate enforces. Showing anything looser would promise a seat
   * that the transaction then refuses. Falls back to the static line when the
   * counter cannot be read.
   */
  const seatsLeft = seats ? Math.max(0, (seats.limit ?? 0) - (seats.count ?? 0)) : null
  const seatLine =
    seatsLeft === null
      ? `Limited to ${seats?.limit ?? 50} accounts.`
      : seatsLeft === 0
        ? 'All seats are full.'
        // Always plural: the noun belongs to the limit, not to what is left.
        : `${seatsLeft} of ${seats?.limit} seats remaining.`

  return (
    <div className="flex min-h-screen justify-center bg-canvas px-5 py-8">
      {/* Narrower and flatter than the tab screens: the DS keeps cards for Home
          and goes flat for onboarding, and this is an onboarding screen. */}
      {/* my-auto rather than items-center: it centres the same way but a form
          taller than the viewport still scrolls from its top instead of having
          it clipped. */}
      <div className="my-auto flex w-full max-w-[360px] flex-col gap-6">
        <div className="flex items-center gap-2.5">
          <div className="flex size-10 items-center justify-center gap-[5px] rounded-md bg-black">
            <span className="size-1 rounded-pill bg-on-ink" />
            <span className="size-1 rounded-pill bg-on-ink" />
            <span className="size-1 rounded-pill bg-on-ink" />
          </div>
          <div>
            <p className="headline text-black">Gtrak</p>
            <p className="caption text-ink-3">Growth Tracker for G's</p>
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <h1 className="title-1 text-black">
            {copy.heading}
            {mode === 'signin' && (
              <span aria-hidden="true" className="ml-1.5">
                👋
              </span>
            )}
          </h1>
          <p className="subhead text-ink-2">{copy.sub}</p>
        </div>

        <form className="flex flex-col gap-4" onSubmit={handleSubmit} noValidate>
          <div className="flex flex-col gap-2.5">
            {mode === 'signup' && (
              <TextField
              fieldSize="md"
                label="Name"
                isLabelHidden
                icon={<Icon name="user" size={17} />}
                value={displayName}
                onChange={update(setDisplayName)}
                placeholder="What should we call you?"
                autoComplete="name"
              />
            )}

            <TextField
              fieldSize="md"
              label="Email"
              isLabelHidden
              type="email"
              icon={<Icon name="mail" size={17} />}
              value={email}
              onChange={update(setEmail)}
              placeholder="Enter your email"
              autoComplete="email"
            />

            {mode !== 'reset' && (
              <PasswordField
              fieldSize="md"
                label="Password"
                isLabelHidden
                icon={<Icon name="lock" size={17} />}
                value={password}
                onChange={update(setPassword)}
                placeholder={mode === 'signup' ? `At least ${MIN_PASSWORD_LENGTH} characters` : 'Enter password'}
                autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
              />
            )}

            {mode === 'signup' && (
              <PasswordField
              fieldSize="md"
                label="Confirm password"
                isLabelHidden
                icon={<Icon name="lock" size={17} />}
                value={confirmPassword}
                onChange={update(setConfirmPassword)}
                placeholder="Repeat your password"
                autoComplete="new-password"
              />
            )}
          </div>

          {/* Remember me belongs to signing in only — there is no session to
              keep when you are creating an account or asking for a reset. */}
          {mode === 'signin' && (
            <div className="flex items-center justify-between gap-3">
              <Checkbox checked={remember} onChange={setRemember} label="Remember me" />
              <TextLink className="footnote" onClick={() => switchMode('reset')}>
                Forgot password?
              </TextLink>
            </div>
          )}

          {feedbackError && (
            <p className="flex items-start gap-2 footnote text-black">
              <span aria-hidden="true" className="mt-1 size-2 shrink-0 rounded-pill bg-protein" />
              {feedbackError}
            </p>
          )}
          {notice && (
            <p className="rounded-md bg-success-soft px-3.5 py-2.5 footnote text-success-text">{notice}</p>
          )}

          {/* Gtrak DS: one primary action per screen. */}
          <Button type="submit" variant="primary" size="md" block isLoading={loading}>
            {copy.submit}
          </Button>

          {mode !== 'reset' && (
            <>
              <div className="flex items-center gap-3">
                <span className="h-px flex-1 bg-line" />
                <span className="caption text-ink-3">or continue with</span>
                <span className="h-px flex-1 bg-line" />
              </div>
              <GoogleSignInButton
                size="md"
                label="Sign in with Google"
                onClick={() => signInWithGoogle(remember)}
                disabled={loading}
              />
            </>
          )}
        </form>

        {/* Only the link text is interactive — never the sentence around it. */}
        <div className="flex flex-col items-center gap-2 subhead text-ink-2">
          {mode === 'signin' && (
            <p>
              Don't have an account? <TextLink onClick={() => switchMode('signup')}>Sign up</TextLink>
            </p>
          )}
          {mode === 'signup' && (
            <p>
              Already have an account? <TextLink onClick={() => switchMode('signin')}>Sign in</TextLink>
            </p>
          )}
          {mode === 'reset' && <TextLink onClick={() => switchMode('signin')}>Back to sign in</TextLink>}
        </div>

        <p className="text-center caption text-ink-3">{seatLine}</p>
      </div>
    </div>
  )
}

export default Login
