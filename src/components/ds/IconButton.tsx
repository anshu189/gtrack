import * as React from 'react'
import { cn } from '@/lib/utils/cn'
import { FOCUS, PRESS } from './primitives'

/**
 * Gtrak DS IconButton — components/docs/IconButton.md.
 *
 * Round icon-only button. `light` is the onboarding back button: 40px,
 * surface-2 fill, black arrow. `glass` is only for use over photos.
 * `label` is required and becomes the accessible name.
 */
export type IconButtonVariant = 'light' | 'surface' | 'ghost' | 'glass'

const VARIANTS: Record<IconButtonVariant, string> = {
  light: 'bg-surface-2 text-black hover:bg-fill-strong',
  surface: 'bg-surface text-black shadow-card hover:bg-fill-subtle',
  ghost: 'bg-transparent text-ink-2 hover:bg-fill-subtle hover:text-black',
  glass: 'bg-glass text-on-ink backdrop-blur-[20px]',
}

type IconButtonProps = Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'children'> & {
  icon: React.ReactNode
  /** Required — becomes aria-label. */
  label: string
  variant?: IconButtonVariant
  size?: number
}

export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ icon, label, variant = 'light', size = 40, className, type = 'button', ...props }, ref) => (
    <button
      ref={ref}
      type={type}
      aria-label={label}
      style={{ width: size, height: size }}
      className={cn(
        'grid shrink-0 cursor-pointer place-items-center rounded-pill',
        'disabled:cursor-not-allowed disabled:text-disabled',
        VARIANTS[variant],
        PRESS,
        FOCUS,
        className,
      )}
      {...props}
    >
      {icon}
    </button>
  ),
)

IconButton.displayName = 'IconButton'
