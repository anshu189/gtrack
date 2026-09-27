import * as React from 'react'
import { cn } from '@/lib/utils/cn'
import { FOCUS } from './primitives'

/**
 * Inline text link.
 *
 * Gtrak DS has no link component — its `ghost` Button is a padded control with
 * a fill on hover, which is wrong inline in a sentence. This keeps the DS rules
 * (ink-2 secondary text, black for anything that matters, no colour on chrome)
 * and adds the one affordance a link needs: it darkens to black and underlines
 * on hover. Only the link text is interactive, never the sentence around it.
 *
 * Intentional addition to Gtrak DS — propose as `TextLink`.
 */
type TextLinkProps = React.ButtonHTMLAttributes<HTMLButtonElement>

export const TextLink = React.forwardRef<HTMLButtonElement, TextLinkProps>(
  ({ className, type = 'button', children, ...props }, ref) => (
    <button
      ref={ref}
      type={type}
      className={cn(
        'inline cursor-pointer rounded-xs bg-transparent p-0 text-ink-2 underline-offset-4',
        'transition-colors duration-150 hover:text-black hover:underline',
        'disabled:cursor-not-allowed disabled:text-disabled disabled:no-underline',
        FOCUS,
        className,
      )}
      {...props}
    >
      {children}
    </button>
  ),
)

TextLink.displayName = 'TextLink'
