import type { WeightEntry } from '@/types'

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
  if (delta === 0) return { label: 'No change', className: 'text-slate-500' }
  if (delta > 0) return { label: `+${delta.toFixed(1)} ${current.unit}`, className: 'text-red-600' }
  return { label: `${delta.toFixed(1)} ${current.unit}`, className: 'text-green-600' }
}

export const WeightHistory = ({ entries, excludeDate }: WeightHistoryProps) => {
  const items = entries.filter((e) => e.date !== excludeDate)

  if (items.length === 0) {
    return <p className="text-sm text-slate-500">Log today&apos;s weight to begin tracking.</p>
  }

  return (
    <ul className="divide-y divide-slate-100 border border-slate-200">
      {items.map((entry, index) => {
        const previous = items[index + 1]
        const trend = getTrend(entry, previous)
        return (
          <li key={entry.id} className="flex items-center justify-between px-3 py-2 text-sm">
            <span className="text-slate-500">{formatDate(entry.date)}</span>
            <div className="flex items-center gap-3">
              <span className="font-medium text-slate-950">
                {entry.weight} {entry.unit}
              </span>
              {trend && <span className={`text-xs ${trend.className}`}>{trend.label}</span>}
            </div>
          </li>
        )
      })}
    </ul>
  )
}

export default WeightHistory
