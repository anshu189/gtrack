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

/**
 * The seven days ending today, laid out Sunday to Saturday for the DS
 * StreakCard.
 *
 * Two separate decisions, and they are easy to confuse:
 *
 *  - The *layout* is the conventional S M T W T F S, as everywhere else in the
 *    app and in the DS. Never reorder it.
 *  - The *window* is the seven days ending today, not the current calendar
 *    week. A calendar week shows almost nothing on a Monday: an application
 *    made the previous Thursday has no cell to fill, even while the figure
 *    underneath counts it, and the card looks broken.
 *
 * Seven consecutive days hold exactly one of each weekday, so placing each at
 * its own weekday is a reordering with no gaps and no collisions — the
 * conventional row, every cell a real and recent day, and the same seven days
 * the adherence figure covers.
 *
 * Today is `pending`, never `missed` — the night is not over yet. A day the
 * schedule never asked for is `off`, which is a different thing again.
 */
export function tretinoinWeek(
  logs: { date: string; applied: boolean }[],
  schedule: TretinoinSchedule | undefined,
  today: string,
): StreakDayCell[] {
  const applied = new Set(logs.filter((l) => l.applied).map((l) => l.date))
  const lastApplied = getLastAppliedDate(logs)

  const cells = new Array<StreakDayCell>(7)
  for (let i = 0; i < 7; i++) {
    const date = addDays(today, i - 6)
    const weekday = WEEKDAYS[weekdayOf(date)]
    const state: StreakDay = applied.has(date)
      ? 'done'
      : !showsTretinoin(date, schedule, lastApplied)
        ? 'off'
        : date >= today
          ? 'pending'
          : 'missed'
    cells[weekday.value] = {
      state,
      letter: weekday.letter,
      name: `${weekday.name} ${formatDayLabel(date)}`,
    }
  }
  return cells
}

/** "13 Oct" — enough to tell two Tuesdays apart. */
function formatDayLabel(date: string): string {
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
  const applied = new Set(logs.filter((l) => l.applied).map((l) => l.date))
  const sorted = [...applied].sort()

  let scheduled = 0
  let done = 0
  let offSchedule = 0
  for (let date = start; date <= end; date = addDays(date, 1)) {
    const wasApplied = applied.has(date)
    if (date >= today && !wasApplied) continue
    // `auto` counts from the last application before the day in question,
    // which is exactly what the Dashboard does for that same day.
    const lastBefore = sorted.filter((d) => d < date).pop() ?? null
    if (!showsTretinoin(date, schedule, lastBefore)) {
      if (wasApplied) offSchedule++
      continue
    }
    scheduled++
    if (wasApplied) done++
  }
  return { applied: done, scheduled, offSchedule }
}
