import type { StreakDay, StreakDayCell } from '@/components/ds'
import type { TretinoinSchedule } from '@/types'

/**
 * Every-3rd-night schedule: apply, skip 2 nights, repeat.
 * Returns true when today matches a scheduled night based on the last application.
 */
export function getLastAppliedDate(
  logs: { date: string; applied: boolean }[]
): string | null {
  const applied = logs
    .filter((l) => l.applied)
    .sort((a, b) => b.date.localeCompare(a.date))
  return applied.length > 0 ? applied[0].date : null
}

export function daysBetween(a: string, b: string): number {
  const da = new Date(a + 'T12:00:00')
  const db = new Date(b + 'T12:00:00')
  return Math.round((db.getTime() - da.getTime()) / 86400000)
}

export function isScheduledNight(
  date: string,
  lastAppliedDate: string | null
): boolean {
  if (!lastAppliedDate) return false
  const diff = daysBetween(lastAppliedDate, date)
  return diff >= 0 && diff % 3 === 0
}

export function addDays(date: string, days: number): string {
  const d = new Date(date + 'T12:00:00')
  d.setDate(d.getDate() + days)
  return d.toISOString().split('T')[0]
}

/** Weekday for an ISO date, 0 = Sunday. Noon avoids any timezone rollover. */
export function weekdayOf(date: string): number {
  return new Date(`${date}T12:00:00`).getDay()
}

/** Sunday first, matching the DS WeekStrip and StreakCard. */
export const WEEKDAYS: { value: number; letter: string; name: string }[] = [
  { value: 0, letter: 'S', name: 'Sunday' },
  { value: 1, letter: 'M', name: 'Monday' },
  { value: 2, letter: 'T', name: 'Tuesday' },
  { value: 3, letter: 'W', name: 'Wednesday' },
  { value: 4, letter: 'T', name: 'Thursday' },
  { value: 5, letter: 'F', name: 'Friday' },
  { value: 6, letter: 'S', name: 'Saturday' },
]

export const DEFAULT_TRETINOIN_SCHEDULE: TretinoinSchedule = { mode: 'auto', weekdays: [] }

/**
 * Whether the tretinoin switch belongs on a given day.
 *
 * `auto` reproduces the original behaviour exactly, including the part that is
 * easy to miss: before the first application there is nothing to count from,
 * so the switch stays visible rather than hiding forever.
 */
export function showsTretinoin(
  date: string,
  schedule: TretinoinSchedule | undefined,
  lastAppliedDate: string | null,
): boolean {
  const mode = schedule?.mode ?? 'auto'
  if (mode === 'daily') return true
  if (mode === 'weekdays') return (schedule?.weekdays ?? []).includes(weekdayOf(date))
  if (!lastAppliedDate) return true
  return isScheduledNight(date, lastAppliedDate)
}

/**
 * The longest run of days the schedule ever allows between two applications.
 * It is what decides whether a streak is still alive, so a weekly pattern with
 * a four-day hole is not treated as a lapse.
 */
export function maxGapFor(schedule: TretinoinSchedule | undefined): number {
  const mode = schedule?.mode ?? 'auto'
  if (mode === 'daily') return 1
  if (mode === 'weekdays') {
    const days = [...new Set(schedule?.weekdays ?? [])].sort((a, b) => a - b)
    if (days.length < 2) return 7
    let gap = 0
    for (let i = 0; i < days.length; i++) {
      const next = days[(i + 1) % days.length]
      const diff = ((next - days[i] + 7) % 7) || 7
      if (diff > gap) gap = diff
    }
    return gap
  }
  // auto: apply, skip two nights, apply again.
  return 3
}

/**
 * Consecutive applications, counting back from the most recent one, where no
 * two in a row are further apart than the schedule allows. The run has to
 * reach today to count at all — otherwise the streak has lapsed.
 */
export function tretinoinStreak(
  logs: { date: string; applied: boolean }[],
  schedule: TretinoinSchedule | undefined,
  today: string,
): number {
  const dates = [...new Set(logs.filter((l) => l.applied).map((l) => l.date))].sort().reverse()
  if (dates.length === 0) return 0

  const maxGap = maxGapFor(schedule)
  if (daysBetween(dates[0], today) > maxGap) return 0

  let streak = 1
  for (let i = 1; i < dates.length; i++) {
    if (daysBetween(dates[i], dates[i - 1]) > maxGap) break
    streak++
  }
  return streak
}

/** The Sunday that starts the week holding `date`. */
export function startOfWeek(date: string): string {
  return addDays(date, -weekdayOf(date))
}

type Logs = { date: string; applied: boolean }[]

/**
 * The one rule for what a day looks like, shared by the week row, both
 * calendars and the adherence figure, so they can never tell different
 * stories.
 *
 *  - after today: `upcoming` — nothing to say yet.
 *  - applied: `done`, scheduled or not.
 *  - not a day the schedule asked for: `off`.
 *  - today, not applied: `pending` — the night is not over.
 *  - otherwise: `missed`.
 *
 * `auto` counts from the last application *before* the day, which is exactly
 * what the Dashboard showed on that day.
 */
function dayState(date: string, applied: Set<string>, sorted: string[], schedule: TretinoinSchedule | undefined, today: string): StreakDay {
  if (date > today) return 'upcoming'
  if (applied.has(date)) return 'done'
  const lastBefore = sorted.filter((d) => d < date).pop() ?? null
  if (!showsTretinoin(date, schedule, lastBefore)) return 'off'
  return date === today ? 'pending' : 'missed'
}

function cellFor(date: string, state: StreakDay): StreakDayCell {
  const weekday = WEEKDAYS[weekdayOf(date)]
  return {
    state,
    letter: weekday.letter,
    day: Number(date.slice(8, 10)),
    name: `${weekday.name} ${formatDayLabel(date)}`,
  }
}

function prepare(logs: Logs) {
  const applied = new Set(logs.filter((l) => l.applied).map((l) => l.date))
  return { applied, sorted: [...applied].sort() }
}

/**
 * The current calendar week, Sunday to Saturday, for the 7-day view. Days
 * after today are `upcoming`, so the row reads as "this week so far" and every
 * column is the date its letter says.
 *
 * (It used to be the seven days ending today, each dropped into its weekday's
 * column. That put last Thursday after this Wednesday, and the dates ran
 * backwards past today.)
 */
export function tretinoinWeek(logs: Logs, schedule: TretinoinSchedule | undefined, today: string): StreakDayCell[] {
  const { applied, sorted } = prepare(logs)
  const sunday = startOfWeek(today)
  return Array.from({ length: 7 }, (_, i) => {
    const date = addDays(sunday, i)
    return cellFor(date, dayState(date, applied, sorted, schedule, today))
  })
}

/** Weeks of a calendar, Sunday first; `null` is a cell outside the range. */
export type CalendarWeeks = (StreakDayCell | null)[][]

/**
 * `start` to `end` as calendar rows, for the 30-day view. The first row is
 * padded back to its Sunday and the last forward to its Saturday; padding
 * before `start` is blank, padding after today is `upcoming`.
 */
export function tretinoinCalendar(logs: Logs, schedule: TretinoinSchedule | undefined, start: string, end: string, today: string): CalendarWeeks {
  const { applied, sorted } = prepare(logs)
  const weeks: CalendarWeeks = []
  for (let sunday = startOfWeek(start); sunday <= end; sunday = addDays(sunday, 7)) {
    weeks.push(
      Array.from({ length: 7 }, (_, i) => {
        const date = addDays(sunday, i)
        if (date < start) return null
        if (date > end && date <= today) return null
        return cellFor(date, dayState(date, applied, sorted, schedule, today))
      }),
    )
  }
  return weeks
}

/**
 * One calendar month, for the 90-day view's month pager. Days before
 * `windowStart` are outside what the range covers and come back `none`.
 */
export function tretinoinMonth(
  logs: Logs,
  schedule: TretinoinSchedule | undefined,
  year: number,
  month: number,
  windowStart: string,
  today: string,
): CalendarWeeks {
  const { applied, sorted } = prepare(logs)
  const first = isoDate(year, month, 1)
  const last = isoDate(year, month + 1, 0)
  const weeks: CalendarWeeks = []
  for (let sunday = startOfWeek(first); sunday <= last; sunday = addDays(sunday, 7)) {
    weeks.push(
      Array.from({ length: 7 }, (_, i) => {
        const date = addDays(sunday, i)
        if (date < first || date > last) return null
        if (date < windowStart) return cellFor(date, 'none')
        return cellFor(date, dayState(date, applied, sorted, schedule, today))
      }),
    )
  }
  return weeks
}

/** ISO date for a local year/month/day; day 0 is the last day of the month before. */
function isoDate(year: number, month: number, day: number): string {
  const d = new Date(year, month, day, 12)
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${mm}-${dd}`
}

/** "13 Oct" — enough to tell two Tuesdays apart. */
export function formatDayLabel(date: string): string {
  return new Date(`${date}T12:00:00`).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
  })
}

/**
 * Of the days the schedule asked for between two dates, how many were applied,
 * and how many applications landed on days it did not ask for.
 *
 * Two days never count against you: one the schedule never asked for, and
 * today before it has been applied — same rule as `tretinoinWeek`, kept here
 * so the card's dots and its figure can never tell different stories.
 *
 * `offSchedule` exists because they otherwise did. An application on an
 * unscheduled day draws a filled dot but is not part of `scheduled`, so the
 * card could show two filled dots above the words "applied on 1" with no way
 * to tell why.
 */
export function tretinoinAdherence(
  logs: { date: string; applied: boolean }[],
  schedule: TretinoinSchedule | undefined,
  start: string,
  end: string,
  today: string,
): { applied: number; scheduled: number; offSchedule: number } {
  const { applied, sorted } = prepare(logs)

  let scheduled = 0
  let done = 0
  let offSchedule = 0
  for (let date = start; date <= end && date <= today; date = addDays(date, 1)) {
    const state = dayState(date, applied, sorted, schedule, today)
    if (state === 'pending') continue
    if (state === 'done') {
      // Applied on a day the schedule did not ask for: a filled dot that is
      // not part of `scheduled`, named in the sentence instead.
      const lastBefore = sorted.filter((d) => d < date).pop() ?? null
      if (!showsTretinoin(date, schedule, lastBefore)) {
        offSchedule++
        continue
      }
      done++
    }
    if (state === 'off') continue
    scheduled++
  }
  return { applied: done, scheduled, offSchedule }
}
