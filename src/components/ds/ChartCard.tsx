import { useId, useMemo, useState } from 'react'
import { cn } from '@/lib/utils/cn'
import { FOCUS } from './primitives'

/**
 * Gtrak DS WeightChartCard, generalised — components/docs/WeightChartCard.md.
 *
 * Title, optional goal chip, an interactive line chart, and an optional
 * encouragement banner. The line is `success` up to the selected point and
 * `ink` after it; the tooltip is an ink bubble. Hover, drag, or focus the chart
 * and use the arrow keys.
 *
 * The DS reference hardcodes a 120–140 Y domain and says in its own docs to
 * compute the domain from the data in production — this does that, with a 10%
 * pad so the line never touches the edges.
 */
interface ChartCardProps {
  title: string
  data: number[]
  /** One label per point, shown in the tooltip. */
  labels?: string[]
  unit?: string
  /** Optional horizontal reference line, e.g. a calorie target. */
  target?: number
  targetLabel?: string
  /** Optional chip beside the title. */
  badge?: React.ReactNode
  /** Optional encouragement line under the chart. */
  message?: string
  /** Decimal places in the tooltip. DS rule: 0 for calories, 1 for weight. */
  decimals?: number
  /** Shown instead of the chart when there is not enough data. */
  emptyMessage?: string
  className?: string
}

const W = 340
const H = 180
const PAD_L = 34
const PAD_B = 22
const PAD_T = 8

export const ChartCard = ({
  title,
  data,
  labels,
  unit = '',
  target,
  targetLabel,
  badge,
  message,
  decimals = 1,
  emptyMessage = 'Not enough data yet.',
  className,
}: ChartCardProps) => {
  const [idx, setIdx] = useState(Math.max(0, data.length - 1))
  const gid = useId().replace(/:/g, '')

  const { lo, hi, ticks } = useMemo(() => {
    const values = target !== undefined ? [...data, target] : data
    if (!values.length) return { lo: 0, hi: 1, ticks: [] as number[] }
    const min = Math.min(...values)
    const max = Math.max(...values)
    const pad = (max - min) * 0.1 || Math.max(1, max * 0.1)
    const l = Math.max(0, min - pad)
    const h = max + pad
    const step = (h - l) / 3
    return { lo: l, hi: h, ticks: [0, 1, 2, 3].map((i) => l + step * i) }
  }, [data, target])

  if (data.length < 2) {
    return (
      <div className={cn('flex flex-col gap-4 rounded-lg bg-surface p-5 shadow-card', className)}>
        <h3 className="title-2 text-black">{title}</h3>
        <p className="body-text text-ink-2">{emptyMessage}</p>
      </div>
    )
  }

  const safeIdx = Math.min(idx, data.length - 1)
  const x = (i: number) => PAD_L + (i / (data.length - 1)) * (W - PAD_L - 6)
  const y = (v: number) => PAD_T + (1 - (v - lo) / (hi - lo || 1)) * (H - PAD_T - PAD_B)

  const path = (from: number, to: number) =>
    data
      .slice(from, to + 1)
      .map((v, j) => {
        const i = from + j
        if (j === 0) return `M${x(i)},${y(v)}`
        const px = x(i - 1)
        const py = y(data[i - 1])
        const mid = (px + x(i)) / 2
        return `C${mid},${py} ${mid},${y(v)} ${x(i)},${y(v)}`
      })
      .join(' ')

  const past = path(0, safeIdx)
  const future = path(safeIdx, data.length - 1)
  const tipX = Math.min(Math.max(x(safeIdx), 58), W - 58)

  const moveTo = (clientX: number, rect: DOMRect) => {
    const px = ((clientX - rect.left) / rect.width) * W
    const i = Math.round(((px - PAD_L) / (W - PAD_L - 6)) * (data.length - 1))
    setIdx(Math.max(0, Math.min(data.length - 1, i)))
  }

  return (
    <div className={cn('flex flex-col gap-4 rounded-lg bg-surface p-5 shadow-card', className)}>
      <div className="flex items-center justify-between gap-3">
        <h3 className="title-2 text-black">{title}</h3>
        {badge}
      </div>

      <svg
        viewBox={`0 0 ${W} ${H}`}
        className={cn('w-full touch-none cursor-crosshair rounded-xs', FOCUS)}
        tabIndex={0}
        role="img"
        aria-label={`${title}. Selected ${data[safeIdx]}${unit}${labels ? ` on ${labels[safeIdx]}` : ''}. Use arrow keys to move.`}
        onPointerMove={(e) => moveTo(e.clientX, e.currentTarget.getBoundingClientRect())}
        onKeyDown={(e) => {
          if (e.key === 'ArrowLeft') {
            e.preventDefault()
            setIdx((i) => Math.max(0, i - 1))
          }
          if (e.key === 'ArrowRight') {
            e.preventDefault()
            setIdx((i) => Math.min(data.length - 1, i + 1))
          }
        }}
      >
        <defs>
          <linearGradient id={`a${gid}`} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="var(--ink)" stopOpacity="0.10" />
            <stop offset="1" stopColor="var(--ink)" stopOpacity="0" />
          </linearGradient>
          <linearGradient id={`g${gid}`} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="var(--success)" stopOpacity="0.14" />
            <stop offset="1" stopColor="var(--success)" stopOpacity="0" />
          </linearGradient>
        </defs>

        {ticks.map((t) => (
          <g key={t}>
            <line x1={PAD_L} x2={W} y1={y(t)} y2={y(t)} stroke="var(--track)" strokeDasharray="3 4" />
            <text x={0} y={y(t) + 4} fontSize="11" fill="var(--ink-2)">
              {Math.round(t)}
            </text>
          </g>
        ))}

        {target !== undefined && (
          <g>
            <line
              x1={PAD_L}
              x2={W}
              y1={y(target)}
              y2={y(target)}
              stroke="var(--protein)"
              strokeWidth="1.5"
              strokeDasharray="4 4"
            />
            {targetLabel && (
              <text x={PAD_L + 4} y={y(target) - 5} fontSize="10" fill="var(--protein)">
                {targetLabel}
              </text>
            )}
          </g>
        )}

        <path
          d={`${future} L${x(data.length - 1)},${H - PAD_B} L${x(safeIdx)},${H - PAD_B} Z`}
          fill={`url(#a${gid})`}
        />
        <path d={`${past} L${x(safeIdx)},${H - PAD_B} L${x(0)},${H - PAD_B} Z`} fill={`url(#g${gid})`} />
        <path d={future} fill="none" stroke="var(--ink)" strokeWidth="2.5" strokeLinecap="round" />
        <path d={past} fill="none" stroke="var(--success)" strokeWidth="2.5" strokeLinecap="round" />

        <line
          x1={x(safeIdx)}
          x2={x(safeIdx)}
          y1={y(data[safeIdx])}
          y2={H - PAD_B}
          stroke="var(--success)"
          strokeWidth="2"
        />
        <circle
          cx={x(safeIdx)}
          cy={y(data[safeIdx])}
          r="5"
          fill="var(--surface)"
          stroke="var(--success)"
          strokeWidth="2.5"
        />

        <g transform={`translate(${tipX - 54},${Math.max(0, y(data[safeIdx]) - 50)})`}>
          <rect width="108" height="40" rx="10" fill="var(--ink)" />
          <text x="10" y="17" fontSize="12" fontWeight="600" fill="var(--on-ink)">
            {data[safeIdx].toFixed(decimals)}
            {unit}
          </text>
          {labels && (
            <text x="10" y="32" fontSize="11" fill="var(--on-ink-muted)">
              {labels[safeIdx]}
            </text>
          )}
        </g>
      </svg>

      {message && (
        <p className="rounded-md bg-success-soft px-4 py-3 text-center footnote text-success-text">
          {message}
        </p>
      )}
    </div>
  )
}
