import { useState, useEffect } from 'react'
import type { MealItem } from '@/types'
import { foodRepository } from '@/lib/repositories/foodRepository'
import { Button } from '@/components/ui/button'

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
    <div className="flex items-center justify-between rounded-lg border border-slate-100 p-2">
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-slate-950">{displayName}</span>
        <span className="text-xs text-slate-500">{item.quantity} {item.unit}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-xs text-slate-500">{Math.round(item.nutrition?.calories ?? 0)} kcal</span>
        {onDelete && (
          <Button size="sm" variant="ghost" onClick={() => onDelete(item.id)}>
            Remove
          </Button>
        )}
      </div>
    </div>
  )
}

export default MealItem
