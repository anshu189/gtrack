import React from 'react'
import type { Meal } from '@/types'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
interface MealCardProps {
  meal: Meal
  onAddItem?: () => void
  onDelete?: () => void
}

const MealCard: React.FC<MealCardProps> = ({ meal, onAddItem, onDelete }) => {
  return (
    <Card className="p-4 bg-white text-black border border-gray-200 shadow-sm rounded-sm">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-medium">{meal.name}</h3>
        <div className="flex items-center gap-2">
          {onAddItem && (
            <Button size="sm" variant="outline" onClick={onAddItem}>
              Add
            </Button>
          )}
          {onDelete && (
            <Button size="sm" variant="ghost" onClick={onDelete}>
              Delete
            </Button>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        {meal.items && meal.items.length > 0 ? (
          meal.items.map((it) => (
            <div key={it.id} className="flex items-center justify-between p-2 border border-gray-100 rounded-sm">
              <div className="flex items-center gap-3">
                <div className="text-sm font-medium">{it.foodId}</div>
                <div className="text-xs text-gray-600">{it.quantity} {it.unit}</div>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-xs text-gray-600">{Math.round(it.nutrition?.calories ?? 0)} kcal</div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-sm text-gray-600">No items</div>
        )}
      </div>
    </Card>
  )
}

export default MealCard
