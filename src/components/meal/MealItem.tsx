import { useState, useEffect } from 'react'
import type { MealItem } from '@/types'
import { foodRepository } from '@/lib/repositories/foodRepository'
import { formatNum } from '@/lib/utils/format'
import { Icon, MacroInline } from '@/components/ds'

interface MealItemProps {
  item: MealItem
}

const MealItem = ({ item }: MealItemProps) => {
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
    <div className="flex flex-col gap-1 rounded-sm bg-surface p-3">
      <div className="flex items-baseline justify-between gap-2">
        <span className="min-w-0 truncate footnote text-black">{displayName}</span>
        <span className="shrink-0 caption text-ink-2">
          {item.quantity} {item.unit}
        </span>
      </div>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <span className="inline-flex items-center gap-1 caption text-ink-2">
          <Icon name="flame" size={13} />
          {formatNum(item.nutrition?.calories ?? 0)} kcal
        </span>
        <MacroInline
          protein={`${formatNum(item.nutrition?.protein ?? 0)}g`}
          carbs={`${formatNum(item.nutrition?.carbs ?? 0)}g`}
          fat={`${formatNum(item.nutrition?.fat ?? 0)}g`}
        />
      </div>
    </div>
  )
}

export default MealItem
