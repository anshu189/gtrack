import * as React from 'react'
import { Button as DsButton, type ButtonVariant, type ButtonSize } from '@/components/ds'
import { cn } from '@/lib/utils/cn'

type LegacyVariant = 'default' | 'secondary' | 'outline' | 'ghost' | 'danger'
type LegacySize = 'sm' | 'md' | 'lg'

/**
 * Adapter: maps the old Button API onto the Gtrak DS Button.
 *
 * `danger` has no DS equivalent — the DS forbids colouring a button with a
 * status colour. A destructive action is rendered as a secondary button with
 * protein-red label instead, which signals the danger without the fill.
 */
const VARIANT_MAP: Record<LegacyVariant, ButtonVariant> = {
  default: 'primary',
  secondary: 'secondary',
  outline: 'outline',
  ghost: 'ghost',
  danger: 'secondary',
}

const SIZE_MAP: Record<LegacySize, ButtonSize> = { sm: 'sm', md: 'md', lg: 'lg' }

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: LegacyVariant
  size?: LegacySize
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'default', size = 'md', className, ...props }, ref) => (
    <DsButton
      ref={ref}
      variant={VARIANT_MAP[variant]}
      size={SIZE_MAP[size]}
      className={cn(variant === 'danger' && 'text-protein hover:text-protein', className)}
      {...props}
    />
  ),
)

Button.displayName = 'Button'
