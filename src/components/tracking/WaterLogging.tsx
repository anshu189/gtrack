import { useState } from 'react'
import { NumberInput, Button } from '@astryxdesign/core'
import type { WaterLog } from '@/types'

interface WaterLoggingProps {
  onAdd: (log: Partial<WaterLog>) => void
}

const QUICK_AMOUNTS = [250, 300, 350, 500, 750]

export const WaterLogging = ({ onAdd }: WaterLoggingProps) => {
  const [custom, setCustom] = useState<number | null>(null)

  const handleCustomAdd = () => {
    if (!custom || custom <= 0) return
    onAdd({ amount: custom, unit: 'ml' })
    setCustom(null)
  }

  return (
    <div className='flex flex-col gap-2'>
      <div className="flex flex-wrap gap-2">
        {QUICK_AMOUNTS.map((amount) => (
          <button
            key={amount}
            type="button"
            onClick={() => onAdd({ amount, unit: 'ml' })}
            className="rounded-lg border border-[var(--color-border)] px-3 py-1.5 !text-sm text-[var(--color-text)] hover:bg-[var(--color-surface)] transition-colors"
          >
            {amount} ml
          </button>
        ))}
      </div>
      <div className="mt-2 flex items-center gap-2">
        <div className="flex-1">
          <NumberInput
            label="Custom amount"
            isLabelHidden
            value={custom}
            onChange={(val) => setCustom(val)}
            placeholder="Custom amount (ml)"
            min={0}
            size="sm"
            className="h-10"
          />
        </div>
        <Button
          label="Add"
          variant="primary"
          size="lg"
          className="h-10"
          onClick={handleCustomAdd}
          isDisabled={!custom || custom <= 0}
        />
      </div>
    </div>
  )
}
