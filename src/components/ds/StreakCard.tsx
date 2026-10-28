import type { ReactNode } from 'react'
import { cn } from '@/lib/utils/cn'
import { Icon } from './Icon'
import { IconButton } from './IconButton'

/**
 * Gtrak DS StreakCard — components/docs/StreakCard.md.
 *
 * Consecutive-days streak: the big flame with the count, the "Day Streak"
 * label, and a week of check dots. The DS calls this the only place `streak`
 * colour is used at size.
 *
 * Intentional adaptations to Gtrak DS:
 *  - a day is `done`, `missed`, `pending`, `off`, `upcoming` or `none` rather
 *    than a bare boolean. The DS assumes something is expected every day. A
 *    schedule has off nights, a night that is due but not here yet is not a
 *    miss, and a day after today has nothing to say yet. Each state differs in
 *    shape, not just colour, and each is spelled out for a screen reader.
 *  - each cell carries its weekday letter, its date number and its spoken
 *    name. The row runs Sunday to Saturday exactly as the DS draws it.
 *  - `label` and `footer` are optional slots, so the card can say what the
 *    streak counts. The DS hard-codes "Day Streak" and prints nothing else.
 *  - `children` replaces the week row, for the calendar views below.
 */
export type StreakDay = 'done' | 'missed' | 'pending' | 'off' | 'upcoming' | 'none'

export interface StreakDayCell {
  state: StreakDay
  /** Single weekday letter. */
  letter: string
  /** Day of the month. */
  day?: number
  /** Spoken name for the day, e.g. "Tuesday 13 Oct". */
  name: string
}

const STATE_NAMES: Record<StreakDay, string> = {
  done: 'done',
  missed: 'missed',
  pending: 'due, not done yet',
  off: 'not scheduled',
  upcoming: 'upcoming',
  none: 'outside this range',
}

interface StreakCardProps {
  days: number
  /** Seven entries, Sunday first. Ignored when `children` is given. */
  week?: StreakDayCell[]
  label?: string
  footer?: ReactNode
  children?: ReactNode
  className?: string
}

export const StreakCard = ({
  days,
  week = [],
  label = 'Day Streak',
  footer,
  children,
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

    {children ?? (
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
                  cell.state === 'upcoming' && 'border border-line',
                )}
              >
                <span className="sr-only">{described}</span>
                {cell.state === 'done' && <Icon name="check" size={12} />}
              </span>
              {cell.day !== undefined && (
                <span
                  aria-hidden="true"
                  className={cn('caption tabular-nums', cell.state === 'upcoming' ? 'text-ink-3' : 'text-black')}
                >
                  {cell.day}
                </span>
              )}
            </span>
          )
        })}
      </div>
    )}

    {footer && <p className="mt-4 text-center footnote text-ink-2">{footer}</p>}
  </div>
)

/**
 * Calendar for the 30- and 90-day adherence views: Sunday-first rows of
 * dated cells, an optional month pager, and a key — with this many cells the
 * four shapes need naming once rather than per cell.
 *
 * Intentional addition to Gtrak DS: the DS StreakCard only draws a week. The
 * cells reuse its states; the date sits inside them as on the DS WeekStrip.
 * A done day is `streak` with a black number, which reads at 9:1 where white
 * on `streak` would not.
 */
interface StreakCalendarProps {
  weeks: (StreakDayCell | null)[][]
  title?: string
  onPrev?: () => void
  onNext?: () => void
  prevDisabled?: boolean
  nextDisabled?: boolean
}

const LETTERS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

const LEGEND: { state: StreakDay; label: string }[] = [
  { state: 'done', label: 'Done' },
  { state: 'missed', label: 'Missed' },
  { state: 'pending', label: 'Due' },
  { state: 'off', label: 'Not scheduled' },
]

function cellClass(state: StreakDay) {
  return cn(
    'grid size-8 place-items-center rounded-pill caption tabular-nums',
    state === 'done' && 'bg-streak text-black',
    state === 'missed' && 'bg-track text-ink-2',
    state === 'pending' && 'border-[1.5px] border-dashed border-streak text-black',
    state === 'off' && 'border border-dashed border-line-strong text-ink-2',
    (state === 'upcoming' || state === 'none') && 'text-ink-3',
  )
}

export const StreakCalendar = ({ weeks, title, onPrev, onNext, prevDisabled, nextDisabled }: StreakCalendarProps) => (
  <div className="mt-3 flex w-full flex-col gap-2">
    {(title || onPrev || onNext) && (
      <div className="flex items-center justify-between gap-2">
        {onPrev ? (
          <IconButton
            variant="ghost"
            size={36}
            label="Previous month"
            icon={<Icon name="chevron-left" size={18} />}
            onClick={onPrev}
            disabled={prevDisabled}
            className="disabled:opacity-30"
          />
        ) : <span className="size-9" />}
        {title && <span className="footnote text-black">{title}</span>}
        {onNext ? (
          <IconButton
            variant="ghost"
            size={36}
            label="Next month"
            icon={<Icon name="chevron-right" size={18} />}
            onClick={onNext}
            disabled={nextDisabled}
            className="disabled:opacity-30"
          />
        ) : <span className="size-9" />}
      </div>
    )}

    <div className="grid grid-cols-7 justify-items-center gap-y-1.5">
      {LETTERS.map((l, i) => (
        <span key={i} aria-hidden="true" className="caption text-ink-2">{l}</span>
      ))}
      {weeks.flat().map((cell, i) => {
        if (!cell) return <span key={i} className="size-8" />
        const described = `${cell.name}: ${STATE_NAMES[cell.state]}`
        return (
          <span key={i} title={described} className={cellClass(cell.state)}>
            <span aria-hidden="true">{cell.day}</span>
            <span className="sr-only">{described}</span>
          </span>
        )
      })}
    </div>

    <div className="mt-1 flex flex-wrap justify-center gap-x-3 gap-y-1">
      {LEGEND.map((item) => (
        <span key={item.state} className="inline-flex items-center gap-1.5 caption text-ink-2">
          <span aria-hidden="true" className={cn(cellClass(item.state), 'size-3')} />
          {item.label}
        </span>
      ))}
    </div>
  </div>
)
