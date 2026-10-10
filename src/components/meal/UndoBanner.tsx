import { useState, useEffect } from 'react'
import { Button, Icon, IconButton } from '@/components/ds'
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
          className="flex items-center justify-between gap-3 rounded-md bg-surface-2 px-4 py-3"
        >
          <div className="flex-1">
            <p className="footnote text-black">"{entry.meal.name ?? 'Untitled'}" deleted.</p>
            <p className="caption text-ink-2">Undo available until midnight ({timeLeft} left)</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" onClick={() => onUndo(entry.id)}>
              Undo
            </Button>
            <IconButton
              variant="ghost"
              size={32}
              label="Dismiss"
              icon={<Icon name="close" size={16} />}
              onClick={() => onDismiss(entry.id)}
            />
          </div>
        </div>
      ))}
    </div>
  )
}

export default UndoBanner
