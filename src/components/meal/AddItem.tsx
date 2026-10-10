import { useState, useCallback } from 'react'
import { computeGramsPerUnit } from '@/lib/utils/nutrition'
import type { Food } from '@/types'
import { Button, Icon } from '@/components/ds'
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
    // Was: measures.find(...)?.grams ?? 1 — that took a measure's TOTAL grams
    // as grams-per-unit (so "4 roti = 200g" made one roti 200g) and fell back
    // to 1g per piece. computeGramsPerUnit divides by the measure's quantity
    // and falls back to the shared defaults.
    const gramsPerUnit = computeGramsPerUnit(selectedFood, unit)
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
      <div className="rounded-md bg-surface-2 p-3">
        <p className="mb-2 footnote text-black">{selectedFood.name}</p>
        <QuantityPicker value={quantity} unit={unit} onChange={(v, u) => { setQuantity(v); if (u) setUnit(u) }} />
        <div className="mt-3 flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            className="h-11 min-w-0 flex-1"
            onClick={handleCancel}
          >
            Cancel
          </Button>
          <Button
            size="sm"
            className="h-11 min-w-0 flex-1"
            icon={<Icon name="plus" size={16} />}
            onClick={handleConfirm}
          >
            Add
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-md bg-surface-2 p-3">
      <p className="mb-2 footnote text-ink-2">Add food item</p>
      <FoodPicker onSelect={handleSelect} />
      {addedName && (
        <p className="mt-2 inline-flex items-center gap-1.5 footnote text-success">
          <Icon name="check-circle" size={15} />
          Added: {addedName}
        </p>
      )}
    </div>
  )
}

export default AddItem
