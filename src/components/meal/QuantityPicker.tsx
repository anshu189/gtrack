interface QuantityPickerProps {
  value: number
  unit?: string
  onChange: (value: number, unit?: string) => void
  units?: string[]
}

const QuantityPicker = ({ value, unit = 'g', onChange, units = ['g', 'ml', 'serving'] }: QuantityPickerProps) => {
  return (
    <div className="flex items-center gap-2">
      <input
        type="number"
        className="w-20 rounded-lg border border-slate-200 px-2 py-1.5 text-sm"
        value={value}
        onChange={(e) => onChange(Number(e.target.value), unit)}
        min={0}
      />
      <select
        className="rounded-lg border border-slate-200 px-2 py-1.5 text-sm"
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
