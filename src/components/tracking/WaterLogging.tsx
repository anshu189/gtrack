import React, { useState } from 'react'
import type { WaterLog } from '@/types'
import { Button } from '@/components/ui/button'

interface WaterLoggingProps {
  onAdd: (log: Partial<WaterLog>) => void
}

const QUICK_AMOUNTS = [
  { label: '250ml', value: 250 },
  { label: '500ml', value: 500 },
  { label: '1L', value: 1000 },
]

export const WaterLogging: React.FC<WaterLoggingProps> = ({ onAdd }) => {
  const [amount, setAmount] = useState(250)

  const handleAdd = (value: number) => {
    onAdd({ amount: value, unit: 'ml' })
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2">
        {QUICK_AMOUNTS.map((btn) => (
          <Button key={btn.value} size="sm" variant="outline" className="flex-1" onClick={() => handleAdd(btn.value)}>
            {btn.label}
          </Button>
        ))}
      </div>
      <div className="flex items-center gap-2">
        <input
          type="number"
          className="flex-1 rounded-sm border border-slate-200 px-3 py-2 text-sm"
          placeholder="Custom amount"
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
          min={1}
          aria-label="Water amount in ml"
        />
        <Button size="sm" onClick={() => handleAdd(amount)} disabled={amount <= 0}>
          Add
        </Button>
      </div>
    </div>
  )
}

export default WaterLogging
