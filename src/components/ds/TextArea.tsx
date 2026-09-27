import * as React from 'react'
import { cn } from '@/lib/utils/cn'

/**
 * Multi-line text input.
 *
 * Intentional addition to Gtrak DS: the DS has no textarea, but daily notes
 * need one. Built to the TextField recipe — surface-2 fill, 15px radius, 15px
 * text, ink-3 placeholder, white with a black border on focus — with the fixed
 * 63px height traded for a row count.
 */
type TextAreaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string
  isLabelHidden?: boolean
  hint?: string
  error?: string
}

export const TextArea = React.forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ label, isLabelHidden, hint, error, className, id, rows = 4, ...props }, ref) => {
    const autoId = React.useId()
    const fieldId = id ?? autoId
    const describedBy = hint || error ? `${fieldId}-hint` : undefined

    return (
      <div className={cn('flex w-full flex-col gap-1.5', className)}>
        {label && (
          <label htmlFor={fieldId} className={cn('footnote text-ink-2', isLabelHidden && 'sr-only')}>
            {label}
          </label>
        )}

        <textarea
          ref={ref}
          id={fieldId}
          rows={rows}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={cn(
            'w-full resize-none rounded-md border border-transparent bg-surface-2 px-4 py-3',
            'subhead text-black placeholder:text-ink-3',
            'outline-none transition duration-150 hover:border-track',
            'focus:border-black focus:bg-surface',
            error && 'border-protein bg-surface',
          )}
          {...props}
        />

        {(error || hint) && (
          <p
            id={describedBy}
            className={cn('flex items-center gap-1.5 footnote', error ? 'text-black' : 'text-ink-2')}
          >
            {error && <span aria-hidden="true" className="size-2 shrink-0 rounded-pill bg-protein" />}
            {error || hint}
          </p>
        )}
      </div>
    )
  },
)

TextArea.displayName = 'TextArea'
