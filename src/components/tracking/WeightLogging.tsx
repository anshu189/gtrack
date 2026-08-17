import { useState, useEffect } from 'react'
import { NumberInput, TextInput, Button } from '@astryxdesign/core'
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
      <div className="flex items-end gap-2">
        <div className="flex-1">
          <NumberInput
            label="Weight"
            isLabelHidden
            value={weight || null}
            onChange={(v) => {
              if (isControlled) onWeightChange?.(v)
              else setInternalWeight(v)
            }}
            placeholder="Weight"
            min={0}
            step={0.1}
            size="lg"
            className="h-10"
          />
        </div>
        <div className="w-20">
          <select
            className="w-full rounded-md border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 cursor-pointer text-sm text-[var(--color-text)]"
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
      </div>
      <TextInput
        label="Notes"
        isLabelHidden
        value={notes}
        onChange={(v) => {
          if (isControlled) onNotesChange?.(v)
          else setInternalNotes(v)
        }}
        placeholder="Notes (optional)"
        size="lg"
        className="h-10"
      />
      {showButton && (
        <Button
          label={todayEntry ? 'Update Weight' : 'Log Weight'}
          variant="primary"
          onClick={handleSave}
          isDisabled={weight <= 0}
        />
      )}
    </div>
  )
}
