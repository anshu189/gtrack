import { useEffect, useMemo, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { FOCUS, PRESS } from './primitives'

/**
 * Calendar date picker.
 *
 * Intentional addition to Gtrak DS: the DS has `WeekStrip` (seven days) and
 * `WheelPicker` (birthday), but nothing for browsing to an arbitrary date —
 * which Dashboard, Meals and History all need.
 *
 * Built from DS parts rather than a library. The popover is a
 * plain absolutely-positioned panel with its own click-outside handling; there
 * is deliberately no `pointer-events-none` anywhere in it, which is the trap
 * documented in MEMORY.md §4.
 */
const WEEKDAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S']

function toIso(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function parseIso(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, (m ?? 1) - 1, d ?? 1)
}

/** Monday-first offset for the 1st of the month. */
function leadingBlanks(year: number, month: number): number {
  const day = new Date(year, month, 1).getDay()
  return (day + 6) % 7
}

interface DatePickerProps {
  value: string
  onChange: (value: string) => void
  label: string
  /** ISO date; days after this are not selectable. */
  max?: string
  /** Stretches the trigger to fill its container. */
  fullWidth?: boolean
  className?: string
}

export const DatePicker = ({ value, onChange, label, max, fullWidth, className }: DatePickerProps) => {
  const [open, setOpen] = useState(false)
  const selected = useMemo(() => parseIso(value), [value])
  const [viewYear, setViewYear] = useState(selected.getFullYear())
  const [viewMonth, setViewMonth] = useState(selected.getMonth())
  const rootRef = useRef<HTMLDivElement>(null)

  // Re-centre the calendar on the selected day each time it opens.
  useEffect(() => {
    if (!open) return
    setViewYear(selected.getFullYear())
    setViewMonth(selected.getMonth())
  }, [open, selected])

  useEffect(() => {
    if (!open) return
    const onPointerDown = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()
  const blanks = leadingBlanks(viewYear, viewMonth)
  const monthLabel = new Date(viewYear, viewMonth, 1).toLocaleDateString(undefined, {
    month: 'long',
    year: 'numeric',
  })

  const step = (delta: number) => {
    const next = new Date(viewYear, viewMonth + delta, 1)
    setViewYear(next.getFullYear())
    setViewMonth(next.getMonth())
  }

  return (
    <div ref={rootRef} className={cn('relative', className)}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={label}
        className={cn(
          'flex h-10 cursor-pointer items-center gap-2 rounded-pill bg-surface-2 px-4 chip-text text-black',
          fullWidth && 'w-full justify-center',
          'transition-colors hover:bg-fill-strong',
          PRESS,
          FOCUS,
        )}
      >
        <Calendar size={16} aria-hidden="true" />
        {selected.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
      </button>

      {open && (
        <div
          role="dialog"
          aria-label={label}
          className="absolute right-0 z-50 mt-2 w-[300px] rounded-lg bg-surface p-4 shadow-float"
        >
          <div className="mb-3 flex items-center justify-between">
            <button
              type="button"
              onClick={() => step(-1)}
              aria-label="Previous month"
              className={cn('grid size-8 cursor-pointer place-items-center rounded-pill text-black hover:bg-surface-2', FOCUS)}
            >
              <ChevronLeft size={18} />
            </button>
            <span className="footnote text-black">{monthLabel}</span>
            <button
              type="button"
              onClick={() => step(1)}
              aria-label="Next month"
              className={cn('grid size-8 cursor-pointer place-items-center rounded-pill text-black hover:bg-surface-2', FOCUS)}
            >
              <ChevronRight size={18} />
            </button>
          </div>

          <div className="mb-1 grid grid-cols-7 gap-1">
            {WEEKDAYS.map((d, i) => (
              <span key={`${d}-${i}`} className="grid h-7 place-items-center caption text-ink-3">
                {d}
              </span>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: blanks }).map((_, i) => (
              <span key={`blank-${i}`} />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1
              const iso = toIso(new Date(viewYear, viewMonth, day))
              const isSelected = iso === value
              const disabled = max ? iso > max : false
              return (
                <button
                  key={iso}
                  type="button"
                  disabled={disabled}
                  aria-current={isSelected ? 'date' : undefined}
                  onClick={() => {
                    onChange(iso)
                    setOpen(false)
                  }}
                  className={cn(
                    'grid h-9 cursor-pointer place-items-center rounded-pill footnote transition-colors',
                    isSelected ? 'bg-black text-on-ink' : 'text-black hover:bg-surface-2',
                    disabled && 'cursor-not-allowed text-ink-4 hover:bg-transparent',
                    FOCUS,
                  )}
                >
                  {day}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
