import * as React from 'react'
import { cn } from '@/lib/utils/cn'

type TextProps = React.HTMLAttributes<HTMLElement> & {
  className?: string
}

export function Display({ className, children, ...props }: TextProps) {
  return (
    <h1
      className={cn(
        'text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl',
        className,
      )}
      {...props}
    >
      {children}
    </h1>
  )
}

export function Heading({ className, children, ...props }: TextProps) {
  return (
    <h2 className={cn('text-xl font-semibold text-slate-950', className)} {...props}>
      {children}
    </h2>
  )
}

export function Subheading({ className, children, ...props }: TextProps) {
  return (
    <p className={cn('text-sm font-medium uppercase tracking-[0.18em] text-slate-500', className)} {...props}>
      {children}
    </p>
  )
}

export function Body({ className, children, ...props }: TextProps) {
  return (
    <p className={cn('max-w-3xl text-sm leading-7 text-slate-700', className)} {...props}>
      {children}
    </p>
  )
}

export function Caption({ className, children, ...props }: TextProps) {
  return (
    <span className={cn('text-xs text-slate-500', className)} {...props}>
      {children}
    </span>
  )
}
