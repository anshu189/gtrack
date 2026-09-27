import { useState } from 'react'
import type { WaterLog } from '@/types'
import { Button, Chip, TextField } from '@/components/ds'

interface WaterLoggingProps {
  onAdd: (log: Partial<WaterLog>) => void
}

const QUICK_AMOUNTS = [250, 300, 350, 500, 750]

export const WaterLogging = ({ onAdd }: WaterLoggingProps) => {
  const [custom, setCustom] = useState('')

  const amount = Number(custom)
  const canAdd = Number.isFinite(amount) && amount > 0

  const handleCustomAdd = () => {
    if (!canAdd) return
    onAdd({ amount, unit: 'ml' })
    setCustom('')
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-2">
        {QUICK_AMOUNTS.map((quick) => (
          <Chip key={quick} variant="action" onClick={() => onAdd({ amount: quick, unit: 'ml' })}>
            {quick} ml
          </Chip>
        ))}
      </div>

      <div className="flex items-center gap-2">
        <TextField
          label="Custom amount"
          isLabelHidden
          type="number"
          inputMode="numeric"
          min={0}
          value={custom}
          onChange={(e) => setCustom(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              handleCustomAdd()
            }
          }}
          placeholder="Custom amount"
          suffix="ml"
          className="flex-1"
        />
        <Button variant="primary" size="md" onClick={handleCustomAdd} disabled={!canAdd}>
          Add
        </Button>
      </div>
    </div>
  )
}
