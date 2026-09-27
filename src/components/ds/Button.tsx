import * as React from 'react'
import { cn } from '@/lib/utils/cn'
import { FOCUS, PRESS } from './primitives'

/**
 * Gtrak DS Button — DESIGN.md §7.
 *
 * primary   ink fill (Continue, Yes/No, the one action on a screen)
 * black     pure black (Get Started, paywall, Sign in with Apple)
 * outline   white with a 2px black border (Sign in with Google)
 * secondary light outline, for in-sheet actions
 * ghost     text only, ink-2
 *
 * Rule: one full-width primary per screen. Never colour a button with a macro
 * or status colour — the DS reserves colour for data.
 */
export type ButtonVariant = 'primary' | 'black' | 'outline' | 'secondary' | 'ghost'
export type ButtonSize = 'lg' | 'md' | 'sm'

const VARIANTS: Record<ButtonVariant, string> = {
  primary: 'bg-ink text-on-ink hover:bg-ink/85 disabled:bg-disabled disabled:hover:bg-disabled',
  black: 'bg-black text-on-ink hover:bg-black/85 disabled:bg-disabled disabled:hover:bg-disabled',
  outline: 'bg-surface border-2 border-black text-black hover:bg-fill-subtle disabled:border-disabled disabled:text-disabled',
  secondary: 'bg-surface border border-line-strong text-black hover:bg-fill-subtle disabled:text-disabled',
  ghost: 'bg-transparent text-ink-2 hover:bg-fill-subtle disabled:text-disabled',
}

/** Heights are measured values: CTA 58, compact pair 48, inline action 36. */
const SIZES: Record<ButtonSize, string> = {
  lg: 'h-[58px] px-6 btn-label',
  md: 'h-12 px-6 btn-label',
  sm: 'h-9 px-4 btn-label',
}

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant
  size?: ButtonSize
  /** Full width — the pinned CTA form. */
  block?: boolean
  icon?: React.ReactNode
  iconRight?: React.ReactNode
  isLoading?: boolean
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant = 'primary', size = 'lg', block, icon, iconRight, isLoading, disabled, children, type = 'button', ...props },
    ref,
  ) => (
    <button
      ref={ref}
      type={type}
      disabled={disabled || isLoading}
      aria-busy={isLoading || undefined}
      className={cn(
        'inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-pill',
        'disabled:cursor-not-allowed',
        VARIANTS[variant],
        SIZES[size],
        block && 'w-full',
        PRESS,
        FOCUS,
        className,
      )}
      {...props}
    >
      {isLoading ? <Spinner /> : icon}
      {children}
      {iconRight}
    </button>
  ),
)

Button.displayName = 'Button'

const Spinner = () => (
  <span
    aria-hidden="true"
    className="size-4 animate-spin rounded-pill border-2 border-current border-t-transparent"
  />
)
