import { useRef } from 'react'
import { cn } from '@/lib/utils/cn'
import { FOCUS } from './primitives'

/**
 * Gtrak DS RulerPicker — components/docs/RulerPicker.md.
 *
 * Horizontal ruler: label, the value in `stat-lg`, and a draggable rule with a
 * fixed black centre line and a grey fill on the left. Drag it, or focus it
 * and use the arrow keys.
 *
 * Ported from the DS source with two changes, both deliberate:
 *  - `decimals` lets a whole-number measure (height in cm) print without the
 *    ".0" the DS hard-codes for weight.
 *  - the pointer handlers ignore a drag that did not start on the rule, so a
 *    page scroll that passes over it cannot change the value. The WheelPicker
 *    had exactly this bug and it silently overwrote saved weights.
 */
interface RulerPickerProps {
  label: string
  value: number
  onChange: (value: number) => void
  min: number
  max: number
  step?: number
  unit: string
  /** Decimal places for the printed value. Defaults to one. */
  decimals?: number
  /**
   * Every nth tick is drawn tall. The DS rule is a major on every whole unit,
   * which is this default at the DS's 0.1 step; a 1cm step wants one every
   * 10, or every tick would be a major and the rule would lose its rhythm.
   */
  majorEvery?: number
  className?: string
}

/** Pixels per step. The DS measures the ruler at 8.5px between ticks. */
const PX_PER_STEP = 8.5
/** Ticks drawn either side of centre — enough to fill a 393pt column. */
const TICK_SPAN = 27

export const RulerPicker = ({
  label,
  value,
  onChange,
  min,
  max,
  step = 0.1,
  unit,
  decimals = 1,
  majorEvery = 10,
  className,
}: RulerPickerProps) => {
  const drag = useRef<{ x: number; v: number } | null>(null)

  const clamp = (x: number) => {
    const snapped = Math.round(Math.max(min, Math.min(max, x)) / step) * step
    return Number(snapped.toFixed(decimals))
  }

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    drag.current = { x: e.clientX, v: value }
    e.currentTarget.setPointerCapture(e.pointerId)
  }

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!drag.current) return
    onChange(clamp(drag.current.v - ((e.clientX - drag.current.x) / PX_PER_STEP) * step))
  }

  const endDrag = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!drag.current) return
    drag.current = null
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId)
    }
  }

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
      e.preventDefault()
      onChange(clamp(value - step))
    }
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
      e.preventDefault()
      onChange(clamp(value + step))
    }
  }

  const printed = value.toFixed(decimals)

  const ticks = []
  const first = Math.round((value - TICK_SPAN * step) / step)
  for (let i = first; i < first + TICK_SPAN * 2; i++) {
    const tickValue = i * step
    if (tickValue < min - 1e-9 || tickValue > max + 1e-9) continue
    const major = i % majorEvery === 0
    ticks.push(
      <span
        key={i}
        className="absolute bottom-0 w-px bg-black/70"
        style={{
          left: `calc(50% + ${((tickValue - value) / step) * PX_PER_STEP}px)`,
          height: major ? 44 : 30,
        }}
      />,
    )
  }

  return (
    <div className={cn('flex flex-col items-center', className)}>
      <p className="body-text text-black">{label}</p>
      <p className="stat-lg mt-4 tabular-nums text-black">
        {printed} {unit}
      </p>
      <div
        tabIndex={0}
        role="slider"
        aria-label={label}
        aria-valuenow={value}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuetext={`${printed} ${unit}`}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onKeyDown={onKeyDown}
        className={cn(
          'relative mt-5 h-[70px] w-full cursor-grab touch-none overflow-hidden active:cursor-grabbing',
          FOCUS,
        )}
      >
        <div aria-hidden="true" className="absolute inset-y-0 left-0 w-1/2 bg-track" />
        {ticks}
        <span aria-hidden="true" className="absolute inset-y-0 left-1/2 w-[2px] -translate-x-1/2 bg-black" />
      </div>
    </div>
  )
}
