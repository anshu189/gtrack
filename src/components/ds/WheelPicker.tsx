import { useCallback, useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils/cn'
import { FOCUS } from './primitives'

/**
 * Gtrak DS WheelPicker — components/docs/WheelPicker.md.
 *
 * 30px rows, a centre"lens" pill on `fill-subtle`, top and bottom fading out.
 *
 * Driven by transform rather than native scrolling. Native scroll cannot give
 * controlled sensitivity (one notch was moving 2–4 rows) and cannot loop, so
 * the wheel owns its position: one row per wheel notch, two or three only when
 * notches arrive fast, and `infinite` wraps the list endlessly.
 */
const ROW_HEIGHT = 30
const VISIBLE_ROWS = 5
const BUFFER = 3

interface WheelPickerProps {
  options: number[]
  value: number
  onChange: (value: number) => void
  label: string
  /** Wraps around endlessly, for cyclic values. */
  infinite?: boolean
  /** How each value is printed. Defaults to one decimal place. */
  format?: (value: number) => string
  className?: string
}

export const WheelPicker = ({
  options,
  value,
  onChange,
  label,
  infinite = false,
  format,
  className,
}: WheelPickerProps) => {
  const count = options.length
  const wrap = useCallback(
    (i: number) => (infinite ? ((i % count) + count) % count : Math.max(0, Math.min(count - 1, i))),
    [infinite, count],
  )

  const valueIndex = Math.max(0, options.indexOf(value))
  /** Continuous row position; a whole number sits that row in the lens. */
  const [pos, setPos] = useState(valueIndex)
  const posRef = useRef(pos)
  posRef.current = pos

  const [dragging, setDragging] = useState(false)
  /**
   * The wheel only takes over the mouse wheel once it has been clicked or
   * tabbed into. Without this, scrolling the page with the cursor anywhere
   * over the wheel silently changes the value — and saves it.
   */
  const [engaged, setEngaged] = useState(false)
  const lastNotch = useRef(0)
  const rootRef = useRef<HTMLDivElement>(null)

  // Follow the value when it changes elsewhere (typing, a preset, a unit swap).
  useEffect(() => {
    if (dragging) return
    let target = valueIndex
    if (infinite) {
      // Move to the nearest equivalent row so the wheel never spins the long way.
      const current = Math.round(posRef.current)
      const diff = (((valueIndex - wrap(current)) % count) + count + count / 2) % count - count / 2
      target = current + diff
    }
    if (Math.abs(target - posRef.current) < 0.001) return
    setPos(target)
  }, [valueIndex, count, infinite, dragging, wrap])

  const commit = useCallback(
    (nextPos: number) => {
      const snapped = Math.round(nextPos)
      setPos(infinite ? snapped : Math.max(0, Math.min(count - 1, snapped)))
      const next = options[wrap(snapped)]
      if (next !== undefined && next !== value) onChange(next)
    },
    [options, onChange, value, wrap, infinite, count],
  )

  // Wheel, registered non-passive so the page does not scroll with it.
  useEffect(() => {
    const el = rootRef.current
    if (!el) return

    const onWheel = (e: WheelEvent) => {
      if (!engaged) return // let the page scroll
      e.preventDefault()
      const now = performance.now()
      const gap = now - lastNotch.current
      lastNotch.current = now

      // One row per notch. Only a genuinely fast flick moves more.
      const magnitude = Math.abs(e.deltaY)
      const rows = gap < 60 && magnitude > 80 ? 3 : gap < 100 && magnitude > 40 ? 2 : 1
      commit(posRef.current + Math.sign(e.deltaY) * rows)
    }

    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [commit, engaged])

  const dragStart = useRef({ y: 0, pos: 0 })

  const onPointerDown = (e: React.PointerEvent) => {
    ;(e.currentTarget as Element).setPointerCapture?.(e.pointerId)
    dragStart.current = { y: e.clientY, pos: posRef.current }
    setEngaged(true)
    setDragging(true)
  }

  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging) return
    const delta = (dragStart.current.y - e.clientY) / ROW_HEIGHT
    let next = dragStart.current.pos + delta
    // Finite lists resist past either end, per the DS overscroll rule.
    if (!infinite) next = Math.max(-0.3, Math.min(count - 1 + 0.3, next))
    setPos(next)
  }

  const onPointerUp = () => {
    if (!dragging) return
    setDragging(false)
    commit(posRef.current)
  }

  const centre = Math.round(pos)
  const rows: { key: number; index: number; offset: number }[] = []
  for (let i = centre - (VISIBLE_ROWS + BUFFER); i <= centre + (VISIBLE_ROWS + BUFFER); i++) {
    if (!infinite && (i < 0 || i > count - 1)) continue
    rows.push({ key: i, index: wrap(i), offset: i - pos })
  }

  const height = VISIBLE_ROWS * ROW_HEIGHT
  const lensTop = (height - ROW_HEIGHT) / 2

  return (
    <div
      ref={rootRef}
      role="listbox"
      aria-label={label}
      tabIndex={0}
      onFocus={() => setEngaged(true)}
      onBlur={() => setEngaged(false)}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onKeyDown={(e) => {
        if (e.key === 'ArrowUp') {
          e.preventDefault()
          commit(posRef.current - 1)
        }
        if (e.key === 'ArrowDown') {
          e.preventDefault()
          commit(posRef.current + 1)
        }
      }}
      className={cn(
        'relative touch-none select-none overflow-hidden rounded-xs',
        dragging ? 'cursor-grabbing' : 'cursor-grab',
        FOCUS,
        className,
      )}
      style={{
        height,
        maskImage: 'linear-gradient(transparent, #000 22%, #000 78%, transparent)',
        WebkitMaskImage: 'linear-gradient(transparent, #000 22%, #000 78%, transparent)',
      }}
    >
      {/* Lens sits behind the rows so the centre value reads through it. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 z-0 rounded-xs bg-fill-subtle"
        style={{ height: ROW_HEIGHT, top: lensTop }}
      />

      {rows.map((row) => {
        const distance = Math.abs(row.offset)
        const active = distance < 0.5
        return (
          <div
            key={row.key}
            role="option"
            aria-selected={active}
            className={cn(
              'pointer-events-none absolute inset-x-0 z-10 flex items-center justify-center',
              active ? 'headline text-black' : 'footnote text-ink-4',
            )}
            style={{
              height: ROW_HEIGHT,
              top: lensTop,
              transform: `translateY(${row.offset * ROW_HEIGHT}px)`,
              transition: dragging ? 'none' : 'transform 180ms cubic-bezier(.2,.8,.2,1)',
              opacity: distance > 2.2 ? 0 : 1,
            }}
          >
            {format ? format(options[row.index]) : options[row.index].toFixed(1)}
          </div>
        )
      })}
    </div>
  )
}
