import type { WeightEntry } from '@/types'
import { Table, proportional } from '@astryxdesign/core/Table'
import type { TableColumn } from '@astryxdesign/core/Table'

interface WeightHistoryProps {
  entries: WeightEntry[]
  excludeDate?: string
}

interface WeightRow extends Record<string, unknown> {
  id: string
  date: string
  weight: string
  trend: { label: string; tone: 'success' | 'error' | 'neutral' } | null
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

export const WeightHistory = ({ entries, excludeDate }: WeightHistoryProps) => {
  const items = entries.filter((e) => e.date !== excludeDate)

  if (items.length === 0) {
    return <p className="text-sm text-[var(--color-muted)]">Log today&apos;s weight to begin tracking.</p>
  }

  const rows: WeightRow[] = items.map((entry, index) => ({
    id: entry.id,
    date: formatDate(entry.date),
    weight: `${entry.weight} ${entry.unit}`,
    trend: getTrend(entry, items[index + 1]),
  }))

  const columns: TableColumn<WeightRow>[] = [
    { key: 'date', header: 'Date', width: proportional(2) },
    { key: 'weight', header: 'Weight', width: proportional(1) },
    {
      key: 'trend',
      header: 'Change',
      width: proportional(1),
      renderCell: (row) => {
        if (!row.trend) return null
        const toneClass =
          row.trend.tone === 'success'
            ? 'text-[var(--color-success)]'
            : row.trend.tone === 'error'
              ? 'text-[var(--color-error)]'
              : 'text-[var(--color-muted)]'
        return <span className={`text-sm ${toneClass}`}>{row.trend.label}</span>
      },
    },
  ]

  return <Table data={rows} columns={columns} idKey="id" density="compact" dividers="rows" />
}

export default WeightHistory