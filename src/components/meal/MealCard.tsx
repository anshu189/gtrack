import { useState, useEffect } from 'react'
import type { Meal } from '@/types'
import { foodRepository } from '@/lib/repositories/foodRepository'
import { formatNum } from '@/lib/utils/format'
import { mealItemGrams, mealTotals } from '@/lib/utils/nutrition'
import { Button, Icon, MacroInline, MacroTiles } from '@/components/ds'

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

  const totals = mealTotals(meal.items)
  const hasItems = meal.items && meal.items.length > 0

  return (
    <div className="rounded-lg bg-surface-2 p-4">
      <div className="mb-3 flex items-baseline justify-between gap-2">
        <p className="min-w-0 truncate title-2 text-black">{meal.name}</p>
        <span className="inline-flex shrink-0 items-center gap-1 label-text text-ink-2">
          <Icon name="flame" size={14} />
          {Math.round(totals.calories)} kcal
        </span>
      </div>

      {hasItems ? (
        <>
          {/* DS macro readout for a meal detail: three tiles across, in
              Protein, Carbs, Fats order. */}
          <MacroTiles
            protein={`${formatNum(totals.protein)}g`}
            carbs={`${formatNum(totals.carbs)}g`}
            fat={`${formatNum(totals.fat)}g`}
            className="mb-3"
          />

          <div className="flex flex-col gap-2">
            {meal.items.map((it) => {
              const displayName = it.name ?? resolvedNames[it.foodId] ?? it.foodId.split(':').pop()
              const multiplier = mealItemGrams(it) / 100
              const n = it.nutrition
              return (
                <div key={it.id} className="flex flex-col gap-1 rounded-sm bg-surface p-3">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="min-w-0 truncate footnote text-black">{displayName}</span>
                    <span className="shrink-0 caption text-ink-2">
                      {it.quantity} {it.unit} &middot; {n ? formatNum(n.calories * multiplier) : '0'} kcal
                    </span>
                  </div>
                  <MacroInline
                    protein={`${n ? formatNum(n.protein * multiplier) : '0'}g`}
                    carbs={`${n ? formatNum(n.carbs * multiplier) : '0'}g`}
                    fat={`${n ? formatNum(n.fat * multiplier) : '0'}g`}
                  />
                </div>
              )
            })}
          </div>
        </>
      ) : (
        <p className="footnote text-ink-2">No items</p>
      )}

      {(onAddItem || onDelete) && (
        <div className="mt-3 grid grid-cols-2 gap-2">
          {onAddItem && (
            <Button
              variant="secondary"
              size="sm"
              className="h-11"
              icon={<Icon name="plus" size={16} />}
              onClick={onAddItem}
            >
              Add
            </Button>
          )}
          {onDelete && (
            <Button
              variant="secondary"
              size="sm"
              className="h-11 text-protein hover:text-protein"
              icon={<Icon name="trash" size={16} />}
              onClick={onDelete}
            >
              Delete
            </Button>
          )}
        </div>
      )}
    </div>
  )
}

export default MealCard
