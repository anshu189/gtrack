import React from 'react'
import type { Nutrition } from '@/types'
import { Card } from '@/components/ui/card'

interface MealNutritionCardProps {
  name: string
  nutrition: Nutrition
}

export const MealNutritionCard: React.FC<MealNutritionCardProps> = ({ name, nutrition }) => {
  return (
    <Card className="p-3 bg-white text-black border border-gray-200 shadow-sm rounded-sm">
      <h4 className="text-sm font-medium mb-2">{name}</h4>
      <div className="grid grid-cols-4 gap-2 text-xs">
        <div className="text-center">
          <div className="font-bold">{Math.round(nutrition.calories)}</div>
          <div className="text-gray-600">kcal</div>
        </div>
        <div className="text-center">
          <div className="font-bold">{Math.round(nutrition.protein)}</div>
          <div className="text-gray-600">g P</div>
        </div>
        <div className="text-center">
          <div className="font-bold">{Math.round(nutrition.carbs)}</div>
          <div className="text-gray-600">g C</div>
        </div>
        <div className="text-center">
          <div className="font-bold">{Math.round(nutrition.fat)}</div>
          <div className="text-gray-600">g F</div>
        </div>
      </div>
    </Card>
  )
}

export default MealNutritionCard
