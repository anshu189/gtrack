import type { Nutrition } from '@/types'

interface MealNutritionCardProps {
  name: string
  nutrition: Nutrition
}

export const MealNutritionCard = ({ name, nutrition }: MealNutritionCardProps) => {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3">
      <h4 className="mb-2 text-sm font-medium text-slate-950">{name}</h4>
      <div className="grid grid-cols-4 gap-2 text-center text-xs">
        <div>
          <p className="font-bold text-slate-950">{Math.round(nutrition.calories)}</p>
          <p className="text-slate-500">kcal</p>
        </div>
        <div>
          <p className="font-bold text-slate-950">{Math.round(nutrition.protein)}</p>
          <p className="text-slate-500">protein</p>
        </div>
        <div>
          <p className="font-bold text-slate-950">{Math.round(nutrition.carbs)}</p>
          <p className="text-slate-500">carbs</p>
        </div>
        <div>
          <p className="font-bold text-slate-950">{Math.round(nutrition.fat)}</p>
          <p className="text-slate-500">fat</p>
        </div>
      </div>
    </div>
  )
}

export default MealNutritionCard
