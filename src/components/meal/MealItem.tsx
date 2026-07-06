import React from 'react'
import type { MealItem } from '@/types'
import { Button } from '@/components/ui/button'

interface MealItemProps {
  item: MealItem
  onDelete?: (id: string) => void
}

const MealItem: React.FC<MealItemProps> = ({ item, onDelete }) => {
  return (
    <div className="flex items-center justify-between p-2 border border-gray-100 rounded-sm">
      <div className="flex items-center gap-3">
        <div className="text-sm font-medium">{item.foodId}</div>
        <div className="text-xs text-gray-600">{item.quantity} {item.unit}</div>
      </div>
      <div className="flex items-center gap-2">
        <div className="text-xs text-gray-600">{Math.round(item.nutrition?.calories ?? 0)} kcal</div>
        {onDelete && (
          <Button size="sm" variant="outline" onClick={() => onDelete(item.id)}>
            Remove
          </Button>
        )}
      </div>
    </div>
  )
}

export default MealItem
