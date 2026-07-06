import React from 'react'
import { Card } from '@/components/ui/card'

interface ProgressCardProps {
  label: string
  actual: number
  target: number
  unit?: string
  percentage: number
}

const getBarColor = (percentage: number) => {
  if (percentage >= 100) return 'bg-green-500'
  if (percentage >= 80) return 'bg-blue-500'
  if (percentage >= 50) return 'bg-orange-500'
  return 'bg-red-500'
}

const getStatusLabel = (percentage: number) => {
  if (percentage >= 100) return '✓ Complete'
  if (percentage >= 80) return 'On track'
  if (percentage >= 50) return 'Halfway'
  return 'Just started'
}

export const ProgressCard: React.FC<ProgressCardProps> = ({ label, actual, target, unit = 'g', percentage }) => {
  const barColor = getBarColor(percentage)
  const status = getStatusLabel(percentage)
  const displayPercentage = Math.min(percentage, 100)

  return (
    <Card className="p-3 bg-white text-black border border-gray-200 shadow-sm rounded-sm">
      <div className="flex items-center justify-between mb-2">
        <div className="text-sm font-medium">{label}</div>
        <div className="text-xs font-medium text-gray-600">{Math.round(percentage)}%</div>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-gray-100 rounded-full h-3 mb-2 overflow-hidden">
        <div className={`${barColor} h-3 rounded-full transition-all`} style={{ width: `${displayPercentage}%` }} />
      </div>

      {/* Stats */}
      <div className="flex items-center justify-between text-xs">
        <div className="text-gray-600">
          {Math.round(actual)} / {Math.round(target)} {unit}
        </div>
        <div className="font-medium text-gray-700">{status}</div>
      </div>
    </Card>
  )
}

export default ProgressCard
