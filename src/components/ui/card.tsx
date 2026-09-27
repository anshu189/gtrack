import * as React from 'react'
import { Card as DsCard } from '@/components/ds'

type CardProps = React.HTMLAttributes<HTMLDivElement> & {
  title?: string
  description?: string
}

/**
 * Adapter: keeps the old Card API so History, Analytics and Settings do not
 * need editing, while rendering the Gtrak DS card (radius-lg, shadow-card, no
 * border). Delete once those pages import from '@/components/ds' directly.
 */
export const Card = React.forwardRef<HTMLDivElement, CardProps>((props, ref) => (
  <DsCard ref={ref} {...props} />
))

Card.displayName = 'Card'
