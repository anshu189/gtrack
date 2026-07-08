import type { Nutrition } from '@/types'
import { formatNum } from '@/lib/utils/format'

interface MealNutritionCardProps {
  name: string
  nutrition: Nutrition
}

export const MealNutritionCard = ({ name, nutrition }: MealNutritionCardProps) => {
  return (
    <div className="flex flex-col gap-2 border border-slate-200 bg-white p-3 dark:border-[#2D2D2D] dark:bg-[#1F1F1F]">
      <h4 className="mb-2 pb-2 text-base capitalize font-medium text-slate-950 border-b-1 border-black/30 dark:border-b-1 dark:border-[#FDFDFD]/20 dark:text-[#FDFDFD]">{name}</h4>
      <div className="grid grid-cols-4 gap-2 text-center text-sm">
        <div>
          <p className="font-bold text-slate-950 dark:text-[#FDFDFD]">{formatNum(nutrition.calories)}</p>
          <p className="text-slate-500 dark:text-[#FDFDFD]/70">kcal</p>
        </div>
        <div>
          <p className="font-bold text-slate-950 dark:text-[#FDFDFD]">{formatNum(nutrition.protein)}</p>
          <p className="text-slate-500 dark:text-[#FDFDFD]/70">protein</p>
        </div>
        <div>
          <p className="font-bold text-slate-950 dark:text-[#FDFDFD]">{formatNum(nutrition.carbs)}</p>
          <p className="text-slate-500 dark:text-[#FDFDFD]/70">carbs</p>
        </div>
        <div>
          <p className="font-bold text-slate-950 dark:text-[#FDFDFD]">{formatNum(nutrition.fat)}</p>
          <p className="text-slate-500 dark:text-[#FDFDFD]/70">fat</p>
        </div>
      </div>
    </div>
  )
}

export default MealNutritionCard
