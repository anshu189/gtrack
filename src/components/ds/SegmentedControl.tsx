import { cn } from '@/lib/utils/cn'
import { FOCUS } from './primitives'

/**
 * Gtrak DS SegmentedControl — components/docs/SegmentedControl.md.
 *
 * Pill control for 2–5 short options. Track is `fill`; the selected segment
 * lifts to a white pill with `shadow-card`.
 */
interface SegmentedControlProps<T extends string> {
  options: { value: T; label: string }[]
  value?: T
  onChange: (value: T) => void
  /** Accessible name for the group. */
  label: string
  className?: string
}

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  label,
  className,
}: SegmentedControlProps<T>) {
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className={cn('flex gap-1 rounded-pill bg-fill p-1.5', className)}
    >
      {options.map((option) => {
        const selected = option.value === value
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(option.value)}
            className={cn(
              'h-9 flex-1 cursor-pointer rounded-pill footnote transition-colors duration-200',
              selected ? 'bg-surface text-black shadow-card' : 'text-ink-2 hover:text-black',
              FOCUS,
            )}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}
