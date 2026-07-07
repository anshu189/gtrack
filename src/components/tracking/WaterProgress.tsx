interface WaterProgressProps {
  current: number
  goal: number
  unit?: string
}

export const WaterProgress = ({ current, goal, unit = 'ml' }: WaterProgressProps) => {
  const pct = goal > 0 ? Math.min(100, Math.round((current / goal) * 100)) : 0

  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-sm text-slate-500">
        <span>{current} {unit} / {goal} {unit}</span>
        <span>{pct}%</span>
      </div>
      <div className="h-2 w-full border border-slate-200 bg-white">
        <div
          className="h-full bg-black transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
