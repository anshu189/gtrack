import type { WeightEntry } from '@/types'
import {
  Table,
  TableHeader,
  TableHeaderCell,
  TableBody,
  TableRow,
  TableCell,
} from '@astryxdesign/core/Table'

interface WeightHistoryProps {
  entries: WeightEntry[]
  excludeDate?: string
}

function formatDate(dateIso: string) {
  return new Date(`${dateIso}T12:00:00`).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })
}

function getTrend(current: WeightEntry, previous?: WeightEntry) {
  if (!previous) return null
  const delta = current.weight - previous.weight
  if (delta === 0) return { label: 'No change', tone: 'neutral' as const }
  if (delta > 0) return { label: `+${delta.toFixed(1)} ${current.unit}`, tone: 'error' as const }
  return { label: `${delta.toFixed(1)} ${current.unit}`, tone: 'success' as const }
}

function toneClass(tone: 'success' | 'error' | 'neutral') {
  if (tone === 'success') return 'text-[var(--color-success)]'
  if (tone === 'error') return 'text-[var(--color-error)]'
  return 'text-[var(--color-muted)]'
}

export const WeightHistory = ({ entries, excludeDate }: WeightHistoryProps) => {
  const items = entries.filter((e) => e.date !== excludeDate)

  if (items.length === 0) {
    return <p className="text-sm text-[var(--color-muted)]">Log today&apos;s weight to begin tracking.</p>
  }

  return (
    <Table density="compact" dividers="rows">
      <TableHeader>
        <TableRow isHeaderRow>
          <TableHeaderCell>
            <span className="text-sm font-semibold text-[var(--color-muted)]">Date</span>
          </TableHeaderCell>
          <TableHeaderCell>
            <span className="text-sm font-semibold text-[var(--color-muted)]">Weight</span>
          </TableHeaderCell>
          <TableHeaderCell>
            <span className="text-sm font-semibold text-[var(--color-muted)]">Change</span>
          </TableHeaderCell>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((entry, index) => {
          const previous = items[index + 1]
          const trend = getTrend(entry, previous)
          return (
            <TableRow key={entry.id}>
              <TableCell>
                <span className="text-sm text-[var(--color-muted)]">{formatDate(entry.date)}</span>
              </TableCell>
              <TableCell>
                <span className="text-sm font-medium text-[var(--color-text)]">
                  {entry.weight} {entry.unit}
                </span>
              </TableCell>
              <TableCell>
                {trend && (
                  <span className={`text-sm ${toneClass(trend.tone)}`}>{trend.label}</span>
                )}
              </TableCell>
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}

export default WeightHistory