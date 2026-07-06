import { useState, useCallback } from 'react'
import type { Food } from '@/types'
import FoodPicker from './FoodPicker'

interface AddItemProps {
  onAdd: (payload: { food: Food; quantity: number; unit?: string }) => void
}

const AddItem = ({ onAdd }: AddItemProps) => {
  const [addedName, setAddedName] = useState<string | null>(null)

  const handleSelect = useCallback((food: Food) => {
    const quantity = food.servingSize ?? 100
    const unit = food.servingUnit ?? 'g'
    onAdd({ food, quantity, unit })
    setAddedName(food.name)
    setTimeout(() => setAddedName(null), 2000)
  }, [onAdd])

  return (
    <div className="rounded-lg border border-slate-100 bg-white p-3 dark:border-neutral-800 dark:bg-black">
      <FoodPicker onSelect={handleSelect} />
      {addedName && (
        <p className="mt-2 text-sm text-green-600">Added: {addedName}</p>
      )}
    </div>
  )
}

export default AddItem
