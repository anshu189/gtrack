import { useState } from 'react'
import type { WaterLog } from '@/types'

interface WaterLoggingProps {
  onAdd: (log: Partial<WaterLog>) => void
}

const QUICK_AMOUNTS = [250, 350, 500, 750]

export const WaterLogging = ({ onAdd }: WaterLoggingProps) => {
  const [custom, setCustom] = useState('')

  const handleCustomAdd = () => {
    const amount = parseInt(custom, 10)
    if (isNaN(amount) || amount <= 0) return
    onAdd({ amount, unit: 'ml' })
    setCustom('')
  }

  return (
    <div className='flex flex-col gap-2'>
      <div className="flex flex-wrap gap-2">
        {QUICK_AMOUNTS.map((amount) => (
          <button
            key={amount}
            type="button"
            onClick={() => onAdd({ amount, unit: 'ml' })}
            className="border border-slate-300 px-3 py-1.5 !text-sm text-slate-950 hover:bg-slate-100 dark:border-neutral-700 dark:text-white dark:hover:bg-neutral-800"
          >
            {amount} ml
          </button>
        ))}
      </div>
      <div className="mt-2 flex items-center gap-2">
        <input
          type="number"
          className="flex-1 border border-slate-200 px-3 py-1.5 text-sm dark:border-neutral-700 dark:bg-neutral-900 dark:text-white"
          placeholder="Custom amount (ml)"
          value={custom}
          onChange={(e) => setCustom(e.target.value)}
        />
        <button
          type="button"
          onClick={handleCustomAdd}
          disabled={!custom || parseInt(custom, 10) <= 0}
          className="bg-black px-3 py-1.5 text-sm font-medium text-white hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Add
        </button>
      </div>
    </div>
  )
}
