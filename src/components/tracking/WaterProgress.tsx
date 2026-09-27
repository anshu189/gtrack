import { ProgressBar } from '@/components/ds'

interface WaterProgressProps {
  current: number
  goal: number
  unit?: string
}

export const WaterProgress = ({ current, goal, unit = 'ml' }: WaterProgressProps) => {
  const pct = goal > 0 ? Math.min(100, Math.round((current / goal) * 100)) : 0

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-baseline justify-between">
        <span className="footnote text-black">
          {current} {unit} <span className="label-text text-ink-2">/ {goal} {unit}</span>
        </span>
        <span className="label-text text-ink-2">{pct}%</span>
      </div>
      {/* Water borrows the DS `fat` blue — same colour as the water chips. */}
      <ProgressBar label="Water intake" value={pct} max={100} color="var(--fat)" />
    </div>
  )
}
