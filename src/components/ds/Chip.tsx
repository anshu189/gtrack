import type { ReactNode } from 'react'
import { cn } from '@/lib/utils/cn'
import { FOCUS, PRESS } from './primitives'

/**
 * Gtrak DS Chip — DESIGN.md §7, components/docs/Chip.md.
 *
 * lang    language pill — surface-2, 10px radius, caption
 * muted   rollover chip — track fill, pill, chip text
 * soft    large lavender pill — surface-2, 44px, option text
 * neutral quiet time/label pill
 *
 * Highlight a number inside a chip with a data colour (e.g. text-fat).
 * When a chip is interactive it renders as a button and gains press + focus.
 */
export type ChipVariant = 'lang' | 'muted' | 'soft' | 'action' | 'neutral' | 'water'

const VARIANTS: Record<ChipVariant, string> = {
  lang: 'h-7 px-3 rounded-[10px] bg-surface-2 caption text-black',
  muted: 'h-7 px-3 rounded-pill bg-track chip-text text-black',
  soft: 'h-11 px-5 rounded-pill bg-surface-2 option text-black',
  // Quick-add button: the lavender surface of `soft` at chip type. Height stays
  // 40px so the tap target does not drop below the minimum.
  action: 'h-10 px-4 rounded-pill bg-surface-2 chip-text text-black hover:bg-fill-strong',
  neutral: 'h-7 px-3 rounded-pill bg-surface-2 caption text-ink-2',
  // Water has no token of its own in the DS, so it borrows the `fat` blue.
  // White text on it is 3.02:1, under the 4.5:1 bar — chosen deliberately for
  // the look. The amount is always paired with the"ml" unit and repeated in
  // the total above, so colour never carries the meaning on its own.
  water: 'h-7 px-3 rounded-pill bg-fat chip-text text-on-ink',
}

interface ChipProps {
  children: ReactNode
  variant?: ChipVariant
  icon?: ReactNode
  className?: string
  onClick?: () => void
  disabled?: boolean
  /** Renders a selected (pressed) state — 1.5px ink outline on white. */
  selected?: boolean
}

export const Chip = ({
  children,
  variant = 'muted',
  icon,
  className,
  onClick,
  disabled,
  selected,
}: ChipProps) => {
  const classes = cn(
    'inline-flex shrink-0 items-center justify-center gap-1.5',
    VARIANTS[variant],
    selected && 'bg-surface outline outline-[1.5px] outline-ink',
    onClick && 'cursor-pointer',
    onClick && PRESS,
    onClick && FOCUS,
    disabled && 'cursor-not-allowed text-disabled',
    className,
  )

  if (!onClick) {
    return (
      <span className={classes}>
        {icon}
        {children}
      </span>
    )
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={selected}
      className={classes}
    >
      {icon}
      {children}
    </button>
  )
}
