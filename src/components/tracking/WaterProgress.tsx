import { ProgressBar } from '@astryxdesign/core'

interface WaterProgressProps {
  current: number
  goal: number
  unit?: string
}

export const WaterProgress = ({ current, goal, unit = 'ml' }: WaterProgressProps) => {
  const pct = goal > 0 ? Math.min(100, Math.round((current / goal) * 100)) : 0

  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-sm text-slate-500 dark:text-[var(--color-muted)]">
        <span>{current} {unit} / {goal} {unit}</span>
        <span>{pct}%</span>
      </div>
      <ProgressBar value={pct} max={100} />
    </div>
  )
}
