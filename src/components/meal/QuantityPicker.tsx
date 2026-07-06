import React from 'react'

interface QuantityPickerProps {
  value: number
  unit?: string
  onChange: (value: number, unit?: string) => void
  units?: string[]
}

const QuantityPicker: React.FC<QuantityPickerProps> = ({ value, unit = 'g', onChange, units = ['g', 'oz', 'serving'] }) => {
  return (
    <div className="flex items-center gap-2">
      <input
        type="number"
        className="w-20 px-2 py-1 border border-gray-200 rounded-sm text-sm"
        value={value}
        onChange={(e) => onChange(Number(e.target.value), unit)}
        min={0}
      />
      <select
        className="px-2 py-1 border border-gray-200 rounded-sm text-sm"
        value={unit}
        onChange={(e) => onChange(value, e.target.value)}
      >
        {units.map((u) => (
          <option key={u} value={u}>
            {u}
          </option>
        ))}
      </select>
    </div>
  )
}

export default QuantityPicker
