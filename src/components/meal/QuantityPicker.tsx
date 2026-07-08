interface QuantityPickerProps {
  value: number
  unit?: string
  onChange: (value: number, unit?: string) => void
  units?: string[]
}

const QuantityPicker = ({ value, unit = 'g', onChange, units = ['g', 'ml'] }: QuantityPickerProps) => {
  return (
    <div className="flex items-center gap-2">
      <input
        type="number"
        className="w-20 border border-slate-200 px-2 py-1.5 text-sm dark:border-[#2D2D2D] dark:bg-[#1F1F1F] dark:text-[#FDFDFD]"
        value={value}
        onChange={(e) => onChange(Number(e.target.value), unit)}
        min={0}
      />
      <select
        className="border border-slate-200 px-2 py-1.5 text-sm dark:border-[#2D2D2D] dark:bg-[#1F1F1F] dark:text-[#FDFDFD]"
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
