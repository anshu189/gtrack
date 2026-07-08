interface ProgressCardProps {
  label: string
  actual: number
  target: number
  unit?: string
  percentage: number
}

const getBarColor = (percentage: number) => {
  if (percentage >= 100) return 'bg-green-500'
  if (percentage >= 80) return 'bg-black'
  if (percentage >= 50) return 'bg-orange-500'
  return 'bg-red-500'
}

const getStatusLabel = (percentage: number) => {
  if (percentage >= 100) return 'Complete'
  if (percentage >= 80) return 'On track'
  if (percentage >= 50) return 'Halfway'
  return 'Just started'
}

export const ProgressCard = ({ label, actual, target, unit = 'g', percentage }: ProgressCardProps) => {
  const barColor = getBarColor(percentage)
  const status = getStatusLabel(percentage)
  const displayPercentage = Math.min(percentage, 100)

  return (
    <div className="border border-slate-200 bg-white p-4 dark:border-[#2D2D2D] dark:bg-[#1F1F1F]">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm font-medium text-slate-950 dark:text-[#FDFDFD]">{label}</span>
        <span className="text-xs font-medium text-slate-500 dark:text-[#FDFDFD]/70">{Math.round(percentage)}%</span>
      </div>
      <div className="mb-2 h-3 w-full bg-slate-100 dark:bg-[#2D2D2D]">
        <div
          className={`${barColor} h-3 transition-all`}
          style={{ width: `${displayPercentage}%` }}
        />
      </div>
      <div className="flex items-center justify-between text-xs">
        <span className="text-slate-500 dark:text-[#FDFDFD]/70">
          {Math.round(actual)} / {Math.round(target)} {unit}
        </span>
        <span className="font-medium text-slate-700 dark:text-[#FDFDFD]/80">{status}</span>
      </div>
    </div>
  )
}

export default ProgressCard
