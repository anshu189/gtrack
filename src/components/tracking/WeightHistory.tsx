import type { WeightEntry } from '@/types'
import { cn } from '@/lib/utils/cn'

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
  if (delta > 0) return { label: `+${delta.toFixed(1)} ${current.unit}`, tone: 'up' as const }
  return { label: `${delta.toFixed(1)} ${current.unit}`, tone: 'down' as const }
}

/** Colour follows the DS data rule — and the sign is always in the text too. */
function toneClass(tone: 'up' | 'down' | 'neutral') {
  if (tone === 'down') return 'text-success'
  if (tone === 'up') return 'text-protein'
  return 'text-ink-2'
}

/**
 * Rows rather than a table. Gtrak DS has no table component, and three short
 * columns read better as list rows at phone width — which is the only width
 * the DS is measured at.
 */
export const WeightHistory = ({ entries, excludeDate }: WeightHistoryProps) => {
  const items = entries.filter((e) => e.date !== excludeDate)

  if (items.length === 0) {
    return <p className="body-text text-ink-2">Log today&apos;s weight to begin tracking.</p>
  }

  return (
    <div className="overflow-hidden rounded-md">
      {items.map((entry, index) => {
        const previous = items[index + 1]
        const trend = getTrend(entry, previous)
        return (
          <div
            key={entry.id}
            className={cn(
              'flex items-center justify-between gap-3 px-4 py-3',
              index % 2 === 0 ? 'bg-surface' : 'bg-surface-2',
              index > 0 && 'border-t border-line',
            )}
          >
            <span className="footnote text-ink-2">{formatDate(entry.date)}</span>
            <div className="flex items-baseline gap-3">
              <span className="footnote text-ink-2">
                {entry.weight.toFixed(1)} {entry.unit}
              </span>
              {trend && <span className={cn('label-text', toneClass(trend.tone))}>{trend.label}</span>}
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default WeightHistory
