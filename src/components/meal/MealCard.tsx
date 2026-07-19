import { useState, useEffect } from 'react'
import type { Meal } from '@/types'
import { foodRepository } from '@/lib/repositories/foodRepository'
import { Card } from '@/components/ui/card'
import { formatNum } from '@/lib/utils/format'
import { mealItemGrams } from '@/lib/utils/nutrition'

interface MealCardProps {
  meal: Meal
  onAddItem?: () => void
  onDelete?: () => void
}

const MealCard = ({ meal, onAddItem, onDelete }: MealCardProps) => {
  const [resolvedNames, setResolvedNames] = useState<Record<string, string>>({})

  useEffect(() => {
    const unresolved = meal.items.filter((it) => !it.name)
    if (unresolved.length === 0) return

    let cancelled = false
    const resolve = async () => {
      const names: Record<string, string> = {}
      for (const it of unresolved) {
        try {
          const food = await foodRepository.getById(it.foodId)
          if (food) names[it.foodId] = food.name
        } catch {
          // skip
        }
      }
      if (!cancelled) setResolvedNames((prev) => ({ ...prev, ...names }))
    }
    resolve()
    return () => { cancelled = true }
  }, [meal.items])

  return (
    <Card>
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-slate-950 dark:text-[#FDFDFD]">{meal.name}</h3>
      </div>

      <div className="mt-3 space-y-2">
        {meal.items && meal.items.length > 0 ? (
          meal.items.map((it) => {
            const displayName = it.name ?? resolvedNames[it.foodId] ?? it.foodId.split(':').pop()
            const multiplier = mealItemGrams(it) / 100
            const n = it.nutrition
            return (
              <div key={it.id} className="border border-slate-100 p-2 dark:border-[#2D2D2D]">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-950 dark:text-[#FDFDFD]">{displayName}</span>
                  <span className="text-xs text-slate-500 dark:text-[#FDFDFD]/70">{it.quantity} {it.unit}</span>
                </div>
                <div className="mt-1 grid grid-cols-4 gap-2 text-xs">
                  <span className="dark:text-[#FDFDFD]">{n ? formatNum(n.calories * multiplier) : '0'} kcal</span>
                  <span className="dark:text-[#FDFDFD]">{n ? formatNum(n.protein * multiplier) : '0'}g P</span>
                  <span className="dark:text-[#FDFDFD]">{n ? formatNum(n.carbs * multiplier) : '0'}g C</span>
                  <span className="dark:text-[#FDFDFD]">{n ? formatNum(n.fat * multiplier) : '0'}g F</span>
                </div>
              </div>
            )
          })
        ) : (
          <p className="text-sm text-slate-500 dark:text-[#FDFDFD]/70">No items</p>
        )}
      </div>

      {(onAddItem || onDelete) && (
        <div className="mt-4 grid grid-cols-2 gap-2">
          {onAddItem && (
            <button
              type="button"
              onClick={onAddItem}
              className="bg-black px-4 py-2 text-sm font-medium text-white dark:bg-slate-300 dark:text-black"
            >
              Add
            </button>
          )}
          {onDelete && (
            <button
              type="button"
              onClick={onDelete}
              className="border border-transparent dark:border-red-300 px-4 py-2 text-sm font-medium text-red-400"
            >
              Delete
            </button>
          )}
        </div>
      )}
    </Card>
  )
}

export default MealCard
