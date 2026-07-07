import * as React from 'react'
import { cn } from '@/lib/utils/cn'

type ButtonVariant = 'default' | 'secondary' | 'outline' | 'ghost' | 'danger'

type ButtonSize = 'sm' | 'md' | 'lg'

const buttonStyles: Record<ButtonVariant, string> = {
  default:
    'bg-black text-white hover:bg-neutral-800',
  secondary:
    'bg-slate-100 text-slate-950 border border-slate-200 hover:bg-slate-200 dark:bg-neutral-900 dark:text-white dark:border-neutral-700 dark:hover:bg-neutral-800',
  outline:
    'bg-white text-slate-950 border border-slate-200 hover:bg-slate-50 dark:bg-neutral-900 dark:text-white dark:border-neutral-700 dark:hover:bg-neutral-800',
  ghost:
    'bg-transparent text-slate-950 hover:bg-slate-100 dark:text-white dark:hover:bg-neutral-900',
  danger:
    'bg-red-600 text-white hover:bg-red-700',
}

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
  lg: 'px-5 py-2.5 text-base',
}

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant
  size?: ButtonSize
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'md', type = 'button', ...props }, ref) => {
    return (
      <button
        ref={ref}
        type={type}
        className={cn(
          'inline-flex items-center justify-center gap-2 font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50',
          buttonStyles[variant],
          sizeStyles[size],
          className,
        )}
        {...props}
      />
    )
  },
)

Button.displayName = 'Button'
