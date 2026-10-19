import { cn } from '@/lib/utils/cn'
import { FOCUS } from './primitives'

/**
 * Gtrak DS WeekStrip, `letters` variant — components/docs/WeekStrip.md.
 *
 * Seven cells: the weekday letter inside a dashed 32px circle, with an
 * optional figure below. Muted cells are `ink-3`, as the DS marks future days.
 *
 * Two intentional adaptations to Gtrak DS:
 *  - `multi` turns the strip into an on/off chooser rather than a cursor. The
 *    DS strip answers "which day am I looking at"; Gtrak also needs "which days
 *    is this on", which is a different question and takes the DS's own
 *    selection language for a choice — the solid black fill of `OptionCard` —
 *    rather than the strip's border treatment.
 *  - `label` under the circle is optional. The DS always prints a date there;
 *    a weekday chooser has no date to print.
 */
export interface WeekStripDay {
  /** Single weekday letter: S M T W T F S. */
  letter: string
  /** What this cell stands for — a weekday number here, a date in the DS. */
  value: number
  /** Printed under the circle. Omitted for a weekday chooser. */
  label?: string | number
  /** Dimmed, as the DS dims future days. */
  muted?: boolean
  /** Spoken name, since one letter on its own tells a screen reader nothing. */
  name: string
}

interface WeekStripProps {
  days: WeekStripDay[]
  /** Every selected value. A single-select caller passes one. */
  selected: number[]
  onSelect: (value: number) => void
  /** Accessible name for the strip. */
  label: string
  /** On/off chooser rather than a cursor. */
  multi?: boolean
  className?: string
}

export const WeekStrip = ({
  days,
  selected,
  onSelect,
  label,
  multi = false,
  className,
}: WeekStripProps) => (
  <div
    role={multi ? 'group' : 'tablist'}
    aria-label={label}
    className={cn('grid grid-cols-7 gap-1', className)}
  >
    {days.map((day, i) => {
      const on = selected.includes(day.value)
      return (
        <button
          key={`${day.value}-${i}`}
          type="button"
          role={multi ? undefined : 'tab'}
          aria-pressed={multi ? on : undefined}
          aria-selected={multi ? undefined : on}
          aria-label={day.name}
          onClick={() => onSelect(day.value)}
          className={cn('flex cursor-pointer flex-col items-center gap-2 rounded-sm py-1', FOCUS)}
        >
          <span
            className={cn(
              'grid size-8 place-items-center rounded-pill caption font-semibold transition-colors',
              day.muted && !on && 'border-[1.5px] border-dashed border-ink-4 text-ink-3',
              !day.muted && !on && 'border-[1.5px] border-dashed border-ink-3 text-black',
              on && (multi ? 'bg-black text-on-ink' : 'border-[1.5px] border-dashed border-black bg-surface text-black'),
            )}
          >
            {day.letter}
          </span>
          {day.label !== undefined && (
            <span
              className={cn(
                'headline tabular-nums',
                day.muted ? 'text-ink-3' : 'text-black',
                on ? 'font-semibold' : 'font-medium',
              )}
            >
              {day.label}
            </span>
          )}
        </button>
      )
    })}
  </div>
)
