import { cn } from '@/lib/utils/cn'

/**
 * Gtrak DS ProgressBar — components/docs/ProgressBar.md.
 *
 * 8px bar, ink on `track`, for linear progress. `color` accepts a data token
 * when the bar encodes a macro; chrome stays ink. Animates with the same
 * 600ms curve as ProgressRing.
 */
interface ProgressBarProps {
  value: number
  max: number
  /** Accessible name — required, since a bare bar means nothing to a reader. */
  label: string
  /** CSS colour. Defaults to ink (chrome). */
  color?: string
  height?: number
  className?: string
}

export const ProgressBar = ({
  value,
  max,
  label,
  color = 'var(--ink)',
  height = 8,
  className,
}: ProgressBarProps) => {
  const pct = Math.max(0, Math.min(1, max ? value / max : 0))

  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuenow={Math.round(value)}
      aria-valuemin={0}
      aria-valuemax={Math.round(max)}
      className={cn('w-full overflow-hidden rounded-pill bg-track', className)}
      style={{ height }}
    >
      <div
        className="h-full rounded-pill"
        style={{
          width: `${pct * 100}%`,
          background: color,
          transition: 'width 600ms cubic-bezier(.2,.8,.2,1)',
        }}
      />
    </div>
  )
}
