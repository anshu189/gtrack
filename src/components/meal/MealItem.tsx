import { useState, useEffect } from 'react'
import type { MealItem } from '@/types'
import { foodRepository } from '@/lib/repositories/foodRepository'
import { formatNum } from '@/lib/utils/format'

interface MealItemProps {
  item: MealItem
  onDelete?: (id: string) => void
}

const MealItem = ({ item, onDelete }: MealItemProps) => {
  const [resolvedName, setResolvedName] = useState<string | null>(null)

  useEffect(() => {
    if (item.name) return
    let cancelled = false
    foodRepository.getById(item.foodId).then((food) => {
      if (!cancelled && food) setResolvedName(food.name)
    })
    return () => { cancelled = true }
  }, [item.name, item.foodId])

  const displayName = item.name ?? resolvedName ?? item.foodId

  return (
    <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-3">
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm font-medium text-[var(--color-text)]">{displayName}</span>
        <span className="text-sm text-[var(--color-muted)]">{item.quantity} {item.unit}</span>
      </div>
      <div className="flex items-center gap-3 text-sm">
        <span className="text-[var(--color-text)]">{formatNum(item.nutrition?.calories ?? 0)} kcal</span>
        <span className="text-[var(--color-accent)]">{formatNum(item.nutrition?.protein ?? 0)}g P</span>
        <span className="text-[var(--color-warning)]">{formatNum(item.nutrition?.carbs ?? 0)}g C</span>
        <span className="text-[var(--color-error)]">{formatNum(item.nutrition?.fat ?? 0)}g F</span>
      </div>
    </div>
  )
}

export default MealItem
