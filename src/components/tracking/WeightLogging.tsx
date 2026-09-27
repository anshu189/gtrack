import { useState, useEffect, useMemo } from 'react'
import { Button, SegmentedControl, TextField, WheelPicker } from '@/components/ds'
import type { WeightEntry } from '@/types'

/** Quick-fill options for the notes field, mirroring the water quick-add chips. */
const NOTE_PRESETS = ['ideal, not measured.', 'measured.']

interface WeightLoggingProps {
  todayEntry?: WeightEntry
  date: string
  onSave: (entry: WeightEntry) => void
  showButton?: boolean
  /** Shows tappable note presets above the notes field. */
  showNotePresets?: boolean
  /** Shows the DS wheel above the typed input. */
  showWheel?: boolean
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
  showNotePresets = false,
  showWheel = false,
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

  /**
   * Two wheels, as on a scale: whole units on the left, grams on the right.
   * Both loop endlessly. Weight stays a single number, so 55 kg 200 g is 55.2 —
   * the typed field and the presets stay in step with the wheels.
   */
  const fallbackWhole = unit === 'kg' ? 70 : 154
  const whole = weight > 0 ? Math.floor(weight) : fallbackWhole
  const grams = weight > 0 ? Math.round((weight - Math.floor(weight)) * 1000) : 0

  const wholeOptions = useMemo(() => Array.from({ length: 400 }, (_, i) => i + 1), [])
  const gramOptions = useMemo(() => Array.from({ length: 1000 }, (_, i) => i), [])

  const setFromWheels = (nextWhole: number, nextGrams: number) => {
    setWeight(Math.round((nextWhole + nextGrams / 1000) * 1000) / 1000)
  }

  const applyNote = (value: string) => {
    if (isControlled) onNotesChange?.(value)
    else setInternalNotes(value)
  }

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

  const setWeight = (next: number) => {
    if (isControlled) onWeightChange?.(next)
    else setInternalWeight(next)
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Wheel and typed entry drive the same value: spin for a nudge from the
          last reading, type when you know the number. */}
      {showWheel && (
        <div className="flex items-center justify-center gap-2 rounded-md bg-surface-2 py-3">
          <WheelPicker
            label={'Weight, whole ' + unit}
            options={wholeOptions}
            value={whole}
            onChange={(next) => setFromWheels(next, grams)}
            format={(n) => String(n)}
            infinite
            className="w-16"
          />
          <span className="footnote text-ink-2">{unit}</span>
          <WheelPicker
            label="Weight, grams"
            options={gramOptions}
            value={grams}
            onChange={(next) => setFromWheels(whole, next)}
            format={(n) => String(n).padStart(3, '0')}
            infinite
            className="w-16"
          />
          <span className="footnote text-ink-2">g</span>
        </div>
      )}

      <div className="flex items-center gap-2">
        <TextField
          label="Weight"
          isLabelHidden
          type="number"
          inputMode="decimal"
          step={0.1}
          min={0}
          value={weight > 0 ? String(weight) : ''}
          onChange={(e) => setWeight(Number(e.target.value) || 0)}
          placeholder="Weight"
          suffix={unit}
          className="flex-1"
        />
        <SegmentedControl
          label="Weight unit"
          value={unit}
          onChange={(u) => {
            if (isControlled) onUnitChange?.(u)
            else setInternalUnit(u)
          }}
          options={[
            { value: 'kg' as const, label: 'kg' },
            { value: 'lbs' as const, label: 'lbs' },
          ]}
          className="w-[104px] shrink-0"
        />
      </div>
      {showNotePresets && (
        <div className="flex flex-wrap gap-2">
          {NOTE_PRESETS.map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => applyNote(preset)}
              className="rounded-pill bg-surface-2 px-3 py-1.5 chip-text text-ink-2 transition-colors hover:bg-fill-strong hover:text-black disabled:opacity-40"
            >
              {preset}
            </button>
          ))}
          <button
            type="button"
            onClick={() => applyNote('')}
            disabled={!notes}
            className="rounded-pill bg-surface-2 px-3 py-1.5 chip-text text-black transition-colors hover:bg-fill-strong"
          >
            Clear
          </button>
        </div>
      )}
      <TextField
        label="Notes"
        isLabelHidden
        value={notes}
        onChange={(e) => {
          if (isControlled) onNotesChange?.(e.target.value)
          else setInternalNotes(e.target.value)
        }}
        placeholder="Notes (optional)"
      />
      {showButton && (
        <Button
          variant="primary"
          size="md"
          block
          onClick={handleSave}
          disabled={weight <= 0}
        >
          {todayEntry ? 'Update weight' : 'Log weight'}
        </Button>
      )}
    </div>
  )
}
