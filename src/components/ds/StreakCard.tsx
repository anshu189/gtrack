import type { ReactNode } from 'react'
import { cn } from '@/lib/utils/cn'
import { Icon } from './Icon'

/**
 * Gtrak DS StreakCard — components/docs/StreakCard.md.
 *
 * Consecutive-days streak: the big flame with the count, the "Day Streak"
 * label, and a week of check dots. The DS calls this the only place `streak`
 * colour is used at size.
 *
 * Three intentional adaptations to Gtrak DS:
 *  - a day is `done`, `missed`, `pending` or `off` rather than a bare boolean.
 *    The DS assumes something is expected every day. A schedule has off nights,
 *    and a night that is due but not here yet is not a miss either — showing
 *    today as missed before the night is over is a lie about your own record.
 *    Off is a grey dashed outline, pending a dashed ring in `streak`.
 *  - each cell carries its own letter and spoken name. The row still runs
 *    Sunday to Saturday exactly as the DS draws it; the name carries the date
 *    as well, so two Tuesdays are told apart on hover and by a screen reader.
 *  - `label` and `footer` are optional slots, so the card can say what the
 *    streak counts. The DS hard-codes "Day Streak" and prints nothing else.
 */
export type StreakDay = 'done' | 'missed' | 'pending' | 'off'

export interface StreakDayCell {
  state: StreakDay
  /** Single weekday letter. */
  letter: string
  /** Spoken name for the day, e.g. "Tuesday 13 Oct". */
  name: string
}

const STATE_NAMES: Record<StreakDay, string> = {
  done: 'done',
  missed: 'missed',
  pending: 'due, not done yet',
  off: 'not scheduled',
}

interface StreakCardProps {
  days: number
  /** Seven entries, Sunday first. */
  week: StreakDayCell[]
  label?: string
  footer?: ReactNode
  className?: string
}

export const StreakCard = ({
  days,
  week,
  label = 'Day Streak',
  footer,
  className,
}: StreakCardProps) => (
  <div
    className={cn(
      'flex flex-col items-center rounded-lg bg-surface px-4 pt-4 pb-5 shadow-card',
      className,
    )}
  >
    <span className="relative grid h-[84px] w-20 place-items-start justify-center">
      <Icon name="flame" size={68} className="text-streak" />
      {/* The DS leaves the count at its static position, which lands it left
          of the flame once the number is two digits. Anchored to both edges it
          stays centred at any width. */}
      <span className="absolute inset-x-0 bottom-0 text-center stat-lg tabular-nums text-streak [-webkit-text-stroke:4px_var(--surface)] [paint-order:stroke_fill]">
        {days}
      </span>
    </span>
    <span className="mt-0.5 headline text-streak">{label}</span>

    <div className="mt-2 grid grid-cols-7 gap-1.5">
      {week.map((cell, i) => {
        const described = `${cell.name}: ${STATE_NAMES[cell.state]}`
        return (
          <span key={i} className="flex flex-col items-center gap-1">
            <span aria-hidden="true" className="caption text-ink-2">
              {cell.letter}
            </span>
            {/* The state is spelled out, so the fill colour is never the only
                thing carrying it. */}
            <span
              title={described}
              className={cn(
                'grid size-5 place-items-center rounded-pill',
                cell.state === 'done' && 'bg-streak text-on-ink',
                cell.state === 'missed' && 'bg-track',
                cell.state === 'pending' && 'border-[1.5px] border-dashed border-streak',
                cell.state === 'off' && 'border border-dashed border-line-strong',
              )}
            >
              <span className="sr-only">{described}</span>
              {cell.state === 'done' && <Icon name="check" size={12} />}
            </span>
          </span>
        )
      })}
    </div>

    {footer && <p className="mt-4 text-center footnote text-ink-2">{footer}</p>}
  </div>
)
