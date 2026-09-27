import type { ReactNode } from 'react'
import { cn } from '@/lib/utils/cn'

/**
 * Gtrak DS ProgressRing — the system's signature data mark.
 * components/docs/ProgressRing.md
 *
 * Round-capped arc on the cool ring-track (#eff1f7).
 * Home calorie ring 108/12 ink · macro rings 68/6 · plan cards 66/5.
 * Animates over 600ms cubic-bezier(.2,.8,.2,1) per DESIGN.md §8.
 */
interface ProgressRingProps {
  value: number
  max: number
  size?: number
  stroke?: number
  /** CSS colour — use a data token, e.g. var(--protein). Chrome uses var(--ink). */
  color?: string
  track?: string
  dashed?: boolean
  /** Accessible name. Falls back to the rounded percentage. */
  label?: string
  className?: string
  children?: ReactNode
}

export const ProgressRing = ({
  value,
  max,
  size = 72,
  stroke = 8,
  color = 'var(--ink)',
  track = 'var(--ring-track)',
  dashed,
  label,
  className,
  children,
}: ProgressRingProps) => {
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius
  const pct = Math.max(0, Math.min(1, max ? value / max : 0))

  return (
    <span
      role="img"
      aria-label={label ?? `${Math.round(pct * 100)}%`}
      className={cn('relative inline-grid shrink-0 place-items-center', className)}
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="absolute inset-0 -rotate-90"
        aria-hidden="true"
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={track}
          strokeWidth={stroke}
          strokeDasharray={dashed ? '3 4' : undefined}
        />
        {pct > 0 && (
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference * (1 - pct)}
            style={{ transition: 'stroke-dashoffset 600ms cubic-bezier(.2,.8,.2,1)' }}
          />
        )}
      </svg>
      <span className="relative inline-flex items-center justify-center">{children}</span>
    </span>
  )
}
