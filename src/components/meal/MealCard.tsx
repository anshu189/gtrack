import { useState, useEffect } from 'react'
import type { Meal } from '@/types'
import { foodRepository } from '@/lib/repositories/foodRepository'
import { Card } from '@/components/ui/card'

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
        <h3 className="text-base font-semibold text-slate-950">{meal.name}</h3>
      </div>

      <div className="mt-3 space-y-2">
        {meal.items && meal.items.length > 0 ? (
          meal.items.map((it) => {
            const displayName = it.name ?? resolvedNames[it.foodId] ?? it.foodId.split(':').pop()
            return (
              <div key={it.id} className="flex items-center justify-between border border-slate-100 p-2">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-slate-950">{displayName}</span>
                  <span className="text-xs text-slate-500">{it.quantity} {it.unit}</span>
                </div>
                <span className="text-xs text-slate-500">{Math.round(it.nutrition?.calories ?? 0)} kcal</span>
              </div>
            )
          })
        ) : (
          <p className="text-sm text-slate-500">No items</p>
        )}
      </div>

      {(onAddItem || onDelete) && (
        <div className="mt-4 grid grid-cols-2 gap-2">
          {onAddItem && (
            <button
              type="button"
              onClick={onAddItem}
              className="bg-black px-4 py-2 text-sm font-medium text-white"
            >
              Add
            </button>
          )}
          {onDelete && (
            <button
              type="button"
              onClick={onDelete}
              className="border border-transparent px-4 py-2 text-sm font-medium text-red-600"
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
