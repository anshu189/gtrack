import * as React from 'react'
import { cn } from '@/lib/utils/cn'
import { FOCUS, PRESS } from './primitives'

/**
 * Gtrak DS TextField — DESIGN.md §7, components/docs/TextField.md.
 *
 * surface-2 fill, 15px radius, 15px text, ink-3 placeholder. 56px tall
 * everywhere in the app; `fieldSize="md"` drops it to 48 for the sign-in
 * screen, where a field taller than the primary button inverts the hierarchy.
 * Focus: fill turns white with a 1px black border.
 * Error: protein border plus an ink message with a red dot.
 * The optional inline action is disabled-2 until there is input, then black.
 */
type TextFieldProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> & {
  label?: string
  /** Keeps the label for screen readers but hides it visually. */
  isLabelHidden?: boolean
  hint?: string
  error?: string
  /** Trailing unit, e.g. "kg". */
  suffix?: string
  /** Trailing control inside the field, e.g. a password reveal toggle. */
  trailing?: React.ReactNode
  /** Row height. `lg` (56px) is the app default; `md` is 48. */
  fieldSize?: 'lg' | 'md'
  icon?: React.ReactNode
  action?: { label: string; onClick: () => void; disabled?: boolean }
}

export const TextField = React.forwardRef<HTMLInputElement, TextFieldProps>(
  ({ label, isLabelHidden, hint, error, suffix, trailing, icon, action, fieldSize = 'lg', className, id, ...props }, ref) => {
    const autoId = React.useId()
    const fieldId = id ?? autoId
    const describedBy = hint || error ? `${fieldId}-hint` : undefined

    return (
      <div className={cn('flex w-full min-w-0 flex-col gap-1.5', className)}>
        {label && (
          <label
            htmlFor={fieldId}
            className={cn('footnote text-ink-2', isLabelHidden && 'sr-only')}
          >
            {label}
          </label>
        )}

        <div
          className={cn(
            'group flex items-center gap-2 rounded-md border pl-4 transition duration-150',
            fieldSize === 'md' ? 'h-12' : 'h-[56px]',
            action ? 'pr-2' : 'pr-4',
            'border-track bg-surface-2 hover:border-line-strong',
            'focus-within:border-black focus-within:bg-surface',
            error && 'border-protein bg-surface',
          )}
        >
          {icon && <span className="shrink-0 text-ink-3 group-focus-within:text-black">{icon}</span>}

          <input
            ref={ref}
            id={fieldId}
            aria-invalid={error ? true : undefined}
            aria-describedby={describedBy}
            className="min-w-0 flex-1 bg-transparent subhead text-black outline-none placeholder:text-ink-3"
            {...props}
          />

          {suffix && <span className="shrink-0 subhead text-ink-2">{suffix}</span>}

          {trailing}

          {action && (
            <button
              type="button"
              onClick={action.onClick}
              disabled={action.disabled}
              className={cn(
                'shrink-0 cursor-pointer rounded-pill px-4 btn-label text-on-ink',
                fieldSize === 'md' ? 'h-8' : 'h-9',
                action.disabled ? 'pointer-events-none bg-disabled-2' : 'bg-black hover:bg-black/85',
                PRESS,
                FOCUS,
              )}
            >
              {action.label}
            </button>
          )}
        </div>

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

TextField.displayName = 'TextField'
