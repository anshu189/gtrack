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
          'overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm',
          className,
        )}
        {...props}
      >
        {title || description ? (
          <div className="mb-4 space-y-1">
            {title ? <h3 className="text-base font-semibold text-slate-950">{title}</h3> : null}
            {description ? <p className="text-sm leading-6 text-slate-600">{description}</p> : null}
          </div>
        ) : null}
        {children}
      </div>
    )
  },
)

Card.displayName = 'Card'
