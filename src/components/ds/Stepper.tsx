import { cn } from '@/lib/utils/cn'
import { formatNum } from '@/lib/utils/format'
import { Icon } from './Icon'
import { FOCUS, PRESS } from './primitives'

/**
 * Gtrak DS Stepper — components/docs/Stepper.md.
 * Minus, value, plus inside an outline pill. Buttons disable at the bounds;
 * the value is `headline` with tabular numerals.
 *
 * One adaptation: the value is printed through `formatNum` and every step is
 * rounded to two places, so half-steps read "1.5" and never drift to
 * "1.4999999".
 */
interface StepperProps {
  value: number
  onChange: (value: number) => void
  /** Names the group for a screen reader, e.g. "Whey protein, scoops". */
  label: string
  min?: number
  max?: number
  step?: number
  className?: string
}

const BTN = cn(
  'inline-flex size-9 cursor-pointer items-center justify-center rounded-pill text-black',
  'hover:bg-fill-subtle active:bg-fill disabled:pointer-events-none disabled:opacity-30',
  FOCUS,
  PRESS,
)

const round = (n: number) => Math.round(n * 100) / 100

export const Stepper = ({ value, onChange, label, min = 0, max = 99, step = 1, className }: StepperProps) => (
  <div
    role="group"
    aria-label={label}
    className={cn('inline-flex h-11 shrink-0 items-center gap-1 rounded-pill border border-line-strong bg-surface px-1', className)}
  >
    <button
      type="button"
      className={BTN}
      aria-label={`Decrease ${label}`}
      disabled={value <= min}
      onClick={() => onChange(round(Math.max(min, value - step)))}
    >
      <Icon name="minus" size={18} />
    </button>
    <span className="min-w-8 text-center headline text-black tabular-nums" aria-live="polite">
      {formatNum(value)}
    </span>
    <button
      type="button"
      className={BTN}
      aria-label={`Increase ${label}`}
      disabled={value >= max}
      onClick={() => onChange(round(Math.min(max, value + step)))}
    >
      <Icon name="plus" size={18} />
    </button>
  </div>
)
