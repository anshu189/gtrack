import { useState, useCallback } from 'react'
import type { Food } from '@/types'
import FoodPicker from './FoodPicker'
import QuantityPicker from './QuantityPicker'

interface AddItemProps {
  onAdd: (payload: { food: Food; quantity: number; unit?: string; gramsPerUnit: number }) => void
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
    const gramsPerUnit = unit === 'g' || unit === 'ml' ? 1 : selectedFood.measures?.find((m) => m.unit === unit)?.grams ?? 1
    onAdd({ food: selectedFood, quantity, unit, gramsPerUnit })
    setSelectedFood(null)
    setAddedName(selectedFood.name)
    setTimeout(() => setAddedName(null), 2000)
  }, [selectedFood, quantity, unit, onAdd])

  const handleCancel = useCallback(() => {
    setSelectedFood(null)
  }, [])

  if (selectedFood) {
    return (
      <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] p-3">
        <p className="text-sm font-medium text-[var(--color-text)] mb-2">{selectedFood.name}</p>
        <QuantityPicker value={quantity} unit={unit} onChange={(v, u) => { setQuantity(v); if (u) setUnit(u) }} />
        <div className="mt-3 flex items-center gap-2">
          <button
            type="button"
            onClick={handleCancel}
            className="flex-1 rounded-lg py-2 text-sm font-medium border border-[var(--color-border)] text-[var(--color-text)] hover:bg-[var(--color-surface)] transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="flex-1 rounded-lg py-2 text-sm font-medium bg-[var(--color-text)] text-[var(--color-bg)] hover:opacity-90 transition-colors"
          >
            Add
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] p-3">
      <p className="text-sm font-medium text-[var(--color-muted)] mb-2">Add food item</p>
      <FoodPicker onSelect={handleSelect} />
      {addedName && (
        <p className="mt-2 text-sm text-[var(--color-success)]">Added: {addedName}</p>
      )}
    </div>
  )
}

export default AddItem
