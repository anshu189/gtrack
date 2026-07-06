import React from 'react'
import type { NutritionStatus } from '@/lib/services/nutritionCalculation'
import ProgressCard from './ProgressCard'

interface ProgressCardsProps {
  status: NutritionStatus | null
}

export const ProgressCards: React.FC<ProgressCardsProps> = ({ status }) => {
  if (!status) {
    return <div className="text-sm text-gray-500">No nutrition data</div>
  }

  return (
    <div className="grid grid-cols-2 gap-2">
      <ProgressCard
        label="Calories"
        actual={status.actual.calories}
        target={status.target?.calories ?? 2000}
        unit="kcal"
        percentage={status.percentage.calories}
      />
      <ProgressCard
        label="Protein"
        actual={status.actual.protein}
        target={status.target?.protein ?? 150}
        unit="g"
        percentage={status.percentage.protein}
      />
      <ProgressCard
        label="Carbs"
        actual={status.actual.carbs}
        target={status.target?.carbs ?? 250}
        unit="g"
        percentage={status.percentage.carbs}
      />
      <ProgressCard
        label="Fat"
        actual={status.actual.fat}
        target={status.target?.fat ?? 70}
        unit="g"
        percentage={status.percentage.fat}
      />
    </div>
  )
}

export default ProgressCards
