import React, { useEffect, useState } from 'react'
import type { WeightEntry } from '@/types'
import { Button } from '@/components/ui/button'

interface WeightLoggingProps {
  todayEntry?: WeightEntry
  date: string
  onSave: (entry: WeightEntry) => void
}

export const WeightLogging: React.FC<WeightLoggingProps> = ({ todayEntry, date, onSave }) => {
  const [weight, setWeight] = useState(todayEntry?.weight ?? 0)
  const [unit, setUnit] = useState<WeightEntry['unit']>(todayEntry?.unit ?? 'kg')
  const [notes, setNotes] = useState(todayEntry?.notes ?? '')

  useEffect(() => {
    setWeight(todayEntry?.weight ?? 0)
    setUnit(todayEntry?.unit ?? 'kg')
    setNotes(todayEntry?.notes ?? '')
  }, [todayEntry])

  const handleSave = () => {
    if (weight <= 0) return
    const now = new Date().toISOString()
    onSave({
      id: todayEntry?.id ?? `weight:${date}`,
      date,
      weight,
      unit,
      notes: notes.trim() || undefined,
      createdAt: todayEntry?.createdAt ?? now,
      updatedAt: now,
    })
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <input
          type="number"
          className="flex-1 rounded-sm border border-slate-200 px-3 py-2 text-sm"
          placeholder="Weight"
          value={weight || ''}
          onChange={(e) => setWeight(Number(e.target.value))}
          step={0.1}
          min={0}
          aria-label="Weight value"
        />
        <select
          className="rounded-sm border border-slate-200 px-3 py-2 text-sm"
          value={unit}
          onChange={(e) => setUnit(e.target.value as WeightEntry['unit'])}
          aria-label="Weight unit"
        >
          <option value="kg">kg</option>
          <option value="lbs">lbs</option>
        </select>
      </div>
      <input
        type="text"
        className="rounded-sm border border-slate-200 px-3 py-2 text-sm"
        placeholder="Notes (optional)"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        aria-label="Weight notes"
      />
      <Button onClick={handleSave} disabled={weight <= 0}>
        {todayEntry ? 'Update Weight' : 'Log Weight'}
      </Button>
    </div>
  )
}

export default WeightLogging
