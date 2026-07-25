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
