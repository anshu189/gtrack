import { useState, useCallback } from 'react'
import type { Food } from '@/types'
import FoodPicker from './FoodPicker'
import QuantityPicker from './QuantityPicker'
import { Button } from '@/components/ui/button'

interface AddItemProps {
  onAdd: (payload: { food: Food; quantity: number; unit?: string }) => void
}

const AddItem = ({ onAdd }: AddItemProps) => {
  const [selectedFood, setSelectedFood] = useState<Food | null>(null)
  const [quantity, setQuantity] = useState(100)
  const [unit, setUnit] = useState('g')
  const [addedName, setAddedName] = useState<string | null>(null)

  const handleSelect = useCallback((food: Food) => {
    setSelectedFood(food)
    setQuantity(food.servingSize ?? 100)
    setUnit(food.servingUnit ?? 'g')
  }, [])

  const handleConfirm = useCallback(() => {
    if (!selectedFood) return
    onAdd({ food: selectedFood, quantity, unit })
    setSelectedFood(null)
    setAddedName(selectedFood.name)
    setTimeout(() => setAddedName(null), 2000)
  }, [selectedFood, quantity, unit, onAdd])

  const handleCancel = useCallback(() => {
    setSelectedFood(null)
  }, [])

  if (selectedFood) {
    return (
      <div className="border border-slate-100 bg-white p-3 dark:border-neutral-800 dark:bg-black">
        <p className="mb-3 text-sm font-medium text-slate-950 dark:text-white">{selectedFood.name}</p>
        <QuantityPicker value={quantity} unit={unit} onChange={(v, u) => { setQuantity(v); if (u) setUnit(u) }} />
        <div className="mt-3 flex items-center gap-2">
          <Button variant="outline" size="sm" className="flex-1" onClick={handleCancel}>Cancel</Button>
          <Button size="sm" className="flex-1" onClick={handleConfirm}>Add</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="border border-slate-100 bg-white p-3 dark:border-neutral-800 dark:bg-black">
      <FoodPicker onSelect={handleSelect} />
      {addedName && (
        <p className="mt-2 text-sm text-green-600">Added: {addedName}</p>
      )}
    </div>
  )
}

export default AddItem
