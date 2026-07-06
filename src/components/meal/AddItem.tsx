import React, { useState } from 'react'
import type { Food } from '@/types'
import FoodPicker from './FoodPicker'
import QuantityPicker from './QuantityPicker'
import { Button } from '@/components/ui/button'

interface AddItemProps {
  onAdd: (payload: { food: Food; quantity: number; unit?: string }) => void
}

const AddItem: React.FC<AddItemProps> = ({ onAdd }) => {
  const [selected, setSelected] = useState<Food | null>(null)
  const [quantity, setQuantity] = useState<number>(100)
  const [unit, setUnit] = useState<string | undefined>('g')

  const handleAdd = () => {
    if (!selected) return
    onAdd({ food: selected, quantity: Number(quantity), unit })
    setSelected(null)
    setQuantity(100)
  }

  return (
    <div className="p-2 border border-gray-100 rounded-sm bg-white">
      <FoodPicker onSelect={(f) => setSelected(f)} />

      <div className="mt-2 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <QuantityPicker value={quantity} unit={unit} onChange={(v, u) => { setQuantity(v); setUnit(u) }} />
        </div>
        <div>
          <Button onClick={handleAdd} disabled={!selected}>
            Add Item
          </Button>
        </div>
      </div>

      {selected && (
        <div className="mt-2 text-sm text-gray-700">Selected: {selected.name}</div>
      )}
    </div>
  )
}

export default AddItem
