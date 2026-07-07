import type { Nutrition } from '@/types'

interface MealNutritionCardProps {
  name: string
  nutrition: Nutrition
}

export const MealNutritionCard = ({ name, nutrition }: MealNutritionCardProps) => {
  return (
    <div className="flex flex-col gap-2 border border-slate-200 bg-white p-3 dark:border-neutral-800 dark:bg-black">
      <h4 className="mb-2 pb-2 text-base capitalize font-medium text-slate-950 border-b-1 border-black/30 dark:text-white">{name}</h4>
      <div className="grid grid-cols-4 gap-2 text-center text-sm">
        <div>
          <p className="font-bold text-slate-950 dark:text-white">{Math.round(nutrition.calories)}</p>
          <p className="text-slate-500 dark:text-neutral-400">kcal</p>
        </div>
        <div>
          <p className="font-bold text-slate-950 dark:text-white">{Math.round(nutrition.protein)}</p>
          <p className="text-slate-500 dark:text-neutral-400">protein</p>
        </div>
        <div>
          <p className="font-bold text-slate-950 dark:text-white">{Math.round(nutrition.carbs)}</p>
          <p className="text-slate-500 dark:text-neutral-400">carbs</p>
        </div>
        <div>
          <p className="font-bold text-slate-950 dark:text-white">{Math.round(nutrition.fat)}</p>
          <p className="text-slate-500 dark:text-neutral-400">fat</p>
        </div>
      </div>
    </div>
  )
}

export default MealNutritionCard
