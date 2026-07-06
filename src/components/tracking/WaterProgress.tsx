interface WaterProgressProps {
  current: number
  goal: number
  unit?: string
}

export const WaterProgress = ({ current, goal, unit = 'ml' }: WaterProgressProps) => {
  const percentage = goal > 0 ? Math.min((current / goal) * 100, 100) : 0
  const remaining = Math.max(goal - current, 0)
  const isComplete = current >= goal

  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-sm">
        <span className="text-slate-600">
          {Math.round(current)} / {Math.round(goal)} {unit}
        </span>
        <span className={isComplete ? 'font-medium text-green-600' : 'text-slate-500'}>
          {isComplete ? 'Goal reached' : `${Math.round(remaining)} ${unit} remaining`}
        </span>
      </div>
      <div className="h-3 w-full overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-3 rounded-full bg-blue-600 transition-all"
          style={{ width: `${percentage}%` }}
          role="progressbar"
          aria-valuenow={current}
          aria-valuemin={0}
          aria-valuemax={goal}
        />
      </div>
    </div>
  )
}

export default WaterProgress
