import { useState, useEffect } from 'react'
import type { Meal } from '@/types'
import { foodRepository } from '@/lib/repositories/foodRepository'
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
    <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] p-4">
      <p className="text-base font-semibold text-[var(--color-text)] mb-3">{meal.name}</p>

      {meal.items && meal.items.length > 0 ? (
        <div className="space-y-2">
          {meal.items.map((it) => {
            const displayName = it.name ?? resolvedNames[it.foodId] ?? it.foodId.split(':').pop()
            const multiplier = mealItemGrams(it) / 100
            const n = it.nutrition
            return (
              <div key={it.id} className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-[var(--color-text)]">{displayName}</span>
                  <span className="text-sm text-[var(--color-muted)]">{it.quantity} {it.unit}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <span className="text-[var(--color-text)]">{n ? formatNum(n.calories * multiplier) : '0'} kcal</span>
                  <span className="text-[var(--color-accent)]">{n ? formatNum(n.protein * multiplier) : '0'}g P</span>
                  <span className="text-[var(--color-warning)]">{n ? formatNum(n.carbs * multiplier) : '0'}g C</span>
                  <span className="text-[var(--color-error)]">{n ? formatNum(n.fat * multiplier) : '0'}g F</span>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <p className="text-sm text-[var(--color-muted)]">No items</p>
      )}

      {(onAddItem || onDelete) && (
        <div className="mt-3 grid grid-cols-2 gap-2">
          {onAddItem && (
            <button
              type="button"
              onClick={onAddItem}
              className="rounded-lg py-2 text-sm font-medium text-[var(--color-text)] border border-[var(--color-border)] hover:bg-[var(--color-surface-alt)] transition-colors"
            >
              Add
            </button>
          )}
          {onDelete && (
            <button
              type="button"
              onClick={onDelete}
              className="rounded-lg py-2 text-sm font-medium text-[var(--color-error)] border border-[var(--color-border)] hover:bg-[var(--color-surface-alt)] transition-colors"
            >
              Delete
            </button>
          )}
        </div>
      )}
    </div>
  )
}

export default MealCard
