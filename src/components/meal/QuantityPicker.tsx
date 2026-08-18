interface QuantityPickerProps {
  value: number
  unit?: string
  onChange: (value: number, unit?: string) => void
  units?: string[]
}

const ALL_UNITS = ['g', 'ml', 'piece', 'cup', 'tbsp', 'tsp', 'slice']

const QuantityPicker = ({ value, unit = 'g', onChange, units = ALL_UNITS }: QuantityPickerProps) => {
  return (
    <div className="flex items-center gap-2">
      <input
        type="number"
        className="w-20 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-2 py-1.5 text-sm text-[var(--color-text)]"
        value={value}
        onChange={(e) => onChange(Number(e.target.value), unit)}
        min={0}
      />
      <select
        className="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-2 py-1.5 text-sm text-[var(--color-text)]"
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
