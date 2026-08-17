import * as React from 'react'
import { cn } from '@/lib/utils/cn'

type CardProps = React.HTMLAttributes<HTMLDivElement> & {
  title?: string
  description?: string
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, title, description, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'border border-slate-200 bg-white dark:border-[#24292D] dark:bg-[#1a1d20]',
          title || description ? 'p-5' : 'p-4',
          className,
        )}
        {...props}
      >
        {title || description ? (
          <div className="mb-4 space-y-1">
            {title ? <h3 className="text-base font-semibold text-slate-950 dark:text-[#FDFDFD]">{title}</h3> : null}
            {description ? <p className="text-sm leading-6 text-slate-500 dark:text-[#FDFDFD]/70">{description}</p> : null}
          </div>
        ) : null}
        {children}
      </div>
    )
  },
)

Card.displayName = 'Card'
