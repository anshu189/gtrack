import * as React from 'react'
import { cn } from '@/lib/utils/cn'
import { Icon } from './Icon'

/**
 * Select with the DS TextField's chrome.
 *
 * Intentional addition to Gtrak DS: the DS has `SegmentedControl` for a short
 * set and `OptionGroup` for a tall one, but nothing for a dropdown — and the
 * app's category pickers were each re-declaring TextField's border, fill,
 * height and focus classes by hand, which is how they drifted apart.
 *
 * The native `select` is kept: it gives the platform picker on a phone, which
 * no custom listbox matches for one-handed use.
 */
type SelectFieldProps = Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'> & {
  label?: string
  /** Keeps the label for screen readers but hides it visually. */
  isLabelHidden?: boolean
  hint?: string
  error?: string
}

export const SelectField = React.forwardRef<HTMLSelectElement, SelectFieldProps>(
  ({ label, isLabelHidden, hint, error, className, id, children, ...props }, ref) => {
    const autoId = React.useId()
    const fieldId = id ?? autoId
    const describedBy = hint || error ? `${fieldId}-hint` : undefined

    return (
      <div className={cn('flex w-full min-w-0 flex-col gap-1.5', className)}>
        {label && (
          <label htmlFor={fieldId} className={cn('footnote text-ink-2', isLabelHidden && 'sr-only')}>
            {label}
          </label>
        )}

        <div
          className={cn(
            'relative flex h-[56px] items-center rounded-md border transition duration-150',
            'border-track bg-surface-2 hover:border-line-strong',
            'focus-within:border-black focus-within:bg-surface',
            error && 'border-protein bg-surface',
          )}
        >
          <select
            ref={ref}
            id={fieldId}
            aria-invalid={error ? true : undefined}
            aria-describedby={describedBy}
            className="h-full w-full min-w-0 cursor-pointer appearance-none bg-transparent pl-4 pr-10 subhead text-black outline-none"
            {...props}
          >
            {children}
          </select>
          <Icon
            name="chevron-down"
            size={18}
            className="pointer-events-none absolute right-4 text-ink-3"
          />
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

SelectField.displayName = 'SelectField'
