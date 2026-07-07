import { useState, useEffect } from 'react'
import type { WeightEntry } from '@/types'

interface WeightLoggingProps {
  todayEntry?: WeightEntry
  date: string
  onSave: (entry: WeightEntry) => void
  showButton?: boolean
  weight?: number
  unit?: string
  notes?: string
  onWeightChange?: (weight: number) => void
  onUnitChange?: (unit: WeightEntry['unit']) => void
  onNotesChange?: (notes: string) => void
}

export const WeightLogging = ({
  todayEntry,
  date,
  onSave,
  showButton = true,
  weight: controlledWeight,
  unit: controlledUnit,
  notes: controlledNotes,
  onWeightChange,
  onUnitChange,
  onNotesChange,
}: WeightLoggingProps) => {
  const [internalWeight, setInternalWeight] = useState(todayEntry?.weight ?? 0)
  const [internalUnit, setInternalUnit] = useState<WeightEntry['unit']>(todayEntry?.unit ?? 'kg')
  const [internalNotes, setInternalNotes] = useState(todayEntry?.notes ?? '')

  const isControlled = controlledWeight !== undefined
  const weight = isControlled ? controlledWeight : internalWeight
  const unit = (isControlled ? controlledUnit : internalUnit) as WeightEntry['unit']
  const notes = (isControlled ? controlledNotes : internalNotes) ?? ''

  useEffect(() => {
    if (!isControlled) {
      setInternalWeight(todayEntry?.weight ?? 0)
      setInternalUnit(todayEntry?.unit ?? 'kg')
      setInternalNotes(todayEntry?.notes ?? '')
    }
  }, [todayEntry, isControlled])

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
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <input
          type="number"
          className="flex-1 border border-slate-200 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900 dark:text-white"
          placeholder="Weight"
          value={weight || ''}
          onChange={(e) => {
            const v = Number(e.target.value)
            if (isControlled) onWeightChange?.(v)
            else setInternalWeight(v)
          }}
          step={0.1}
          min={0}
          aria-label="Weight value"
        />
        <select
          className="border border-slate-200 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900 dark:text-white"
          value={unit}
          onChange={(e) => {
            const u = e.target.value as WeightEntry['unit']
            if (isControlled) onUnitChange?.(u)
            else setInternalUnit(u)
          }}
          aria-label="Weight unit"
        >
          <option value="kg">kg</option>
          <option value="lbs">lbs</option>
        </select>
      </div>
      <input
        type="text"
        className="border border-slate-200 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900 dark:text-white"
        placeholder="Notes (optional)"
        value={notes}
        onChange={(e) => {
          if (isControlled) onNotesChange?.(e.target.value)
          else setInternalNotes(e.target.value)
        }}
        aria-label="Weight notes"
      />
      {showButton && (
        <button
          type="button"
          onClick={handleSave}
          disabled={weight <= 0}
          className="inline-flex items-center justify-center gap-2 bg-black px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {todayEntry ? 'Update Weight' : 'Log Weight'}
        </button>
      )}
    </div>
  )
}
