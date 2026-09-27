import * as React from 'react'
import { cn } from '@/lib/utils/cn'

/**
 * Gtrak DS surfaces — DESIGN.md §6, §7.
 *
 * Card  — the Home card: white surface, radius-lg (20), shadow-card, no border.
 *         "Flat in onboarding, soft on Home."
 * Panel — a quiet container: surface-2 lavender-white, radius-md (15), flat.
 *         Used for list rows, inputs, review cards and the plan container.
 */
type CardProps = React.HTMLAttributes<HTMLDivElement> & {
  title?: string
  description?: string
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, title, description, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('rounded-lg bg-surface p-5 shadow-card', className)}
      {...props}
    >
      {(title || description) && (
        <div className="mb-4 flex flex-col gap-1">
          {title && <h3 className="title-2 text-black">{title}</h3>}
          {description && <p className="footnote text-ink-2">{description}</p>}
        </div>
      )}
      {children}
    </div>
  ),
)

Card.displayName = 'Card'

export const Panel = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, title, description, children, ...props }, ref) => (
    <div ref={ref} className={cn('rounded-md bg-surface-2 p-5', className)} {...props}>
      {(title || description) && (
        <div className="mb-4 flex flex-col gap-1">
          {title && <h3 className="title-2 text-black">{title}</h3>}
          {description && <p className="footnote text-ink-2">{description}</p>}
        </div>
      )}
      {children}
    </div>
  ),
)

Panel.displayName = 'Panel'
