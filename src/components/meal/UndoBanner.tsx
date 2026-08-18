import { useState, useEffect } from 'react'
import type { DeletedMealEntry } from '@/types'

function getTimeUntilMidnight(): string {
  const now = new Date()
  const midnight = new Date()
  midnight.setHours(24, 0, 0, 0)
  const diffMs = midnight.getTime() - now.getTime()
  const hours = Math.floor(diffMs / 3600000)
  const minutes = Math.floor((diffMs % 3600000) / 60000)
  if (hours > 0) return `${hours}h ${minutes}m`
  return `${minutes}m`
}

interface UndoBannerProps {
  entries: DeletedMealEntry[]
  dismissedIds: Set<string>
  onDismiss: (id: string) => void
  onUndo: (id: string) => void
}

const UndoBanner = ({ entries, dismissedIds, onDismiss, onUndo }: UndoBannerProps) => {
  const [timeLeft, setTimeLeft] = useState(getTimeUntilMidnight)

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(getTimeUntilMidnight())
    }, 60000)
    return () => clearInterval(timer)
  }, [])

  const visible = entries.filter((e) => !dismissedIds.has(e.id))
  if (visible.length === 0) return null

  return (
    <div className="space-y-2">
      {visible.map((entry) => (
        <div
          key={entry.id}
          className="flex items-center justify-between rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3"
        >
          <div className="flex-1">
            <p className="text-sm text-[var(--color-text)]">
              "{entry.meal.name ?? 'Untitled'}" deleted.
            </p>
            <p className="text-xs text-[var(--color-muted)]">Undo available until midnight ({timeLeft} left)</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onUndo(entry.id)}
              className="border border-[var(--color-text)] px-3 py-1 text-xs font-medium text-[var(--color-text)] hover:bg-[var(--color-text)] hover:text-[var(--color-bg)] transition-colors"
            >
              Undo
            </button>
            <button
              type="button"
              onClick={() => onDismiss(entry.id)}
              className="text-xs text-[var(--color-muted)] hover:text-[var(--color-text)] transition-colors"
            >
              ✕
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}

export default UndoBanner
