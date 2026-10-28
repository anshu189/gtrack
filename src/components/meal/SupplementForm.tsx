import { useState } from 'react'
import type { Supplement, SupplementUnit } from '@/types'
import { Button, SelectField, TextField } from '@/components/ds'
import { SUPPLEMENT_UNITS, defaultStep, isMassUnit, perUnitLabel } from '@/lib/utils/supplements'

export type SupplementDraft = Omit<Supplement, 'id' | 'order' | 'createdAt' | 'updatedAt'>

/**
 * Add or edit one supplement: its name, what the counter counts, and the
 * macros for one unit as the label prints them. Edits only ever touch this
 * user's copy.
 */
interface SupplementFormProps {
  initial?: Supplement
  onSave: (draft: SupplementDraft) => Promise<void>
  onCancel: () => void
}

const toNumber = (raw: string) => {
  const n = Number(raw)
  return Number.isFinite(n) && n >= 0 ? n : 0
}

export const SupplementForm = ({ initial, onSave, onCancel }: SupplementFormProps) => {
  const [name, setName] = useState(initial?.name ?? '')
  const [unit, setUnit] = useState<SupplementUnit>(initial?.unit ?? 'scoop')
  const [grams, setGrams] = useState(String(initial?.gramsPerUnit ?? 30))
  const [calories, setCalories] = useState(String(initial?.nutrition.calories ?? 0))
  const [protein, setProtein] = useState(String(initial?.nutrition.protein ?? 0))
  const [carbs, setCarbs] = useState(String(initial?.nutrition.carbs ?? 0))
  const [fat, setFat] = useState(String(initial?.nutrition.fat ?? 0))
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const mass = isMassUnit(unit)
  const per = perUnitLabel(unit)

  const handleSave = async () => {
    const trimmed = name.trim()
    if (!trimmed) {
      setError('Give the supplement a name.')
      return
    }
    const gramsPerUnit = mass ? 1 : toNumber(grams)
    if (gramsPerUnit <= 0) {
      setError(`Enter how many grams one ${unit} weighs.`)
      return
    }
    setSaving(true)
    try {
      await onSave({
        name: trimmed,
        unit,
        gramsPerUnit,
        // A new unit gets its own step; an unchanged one keeps the old step.
        step: initial && initial.unit === unit ? initial.step : defaultStep(unit),
        nutrition: {
          calories: toNumber(calories),
          protein: toNumber(protein),
          carbs: toNumber(carbs),
          fat: toNumber(fat),
        },
      })
    } catch (e: any) {
      setError(e?.message ?? 'Saving failed. Try again.')
      setSaving(false)
    }
  }

  return (
    <div className="flex flex-col gap-4 rounded-sm bg-surface p-3">
      <p className="headline text-black">{initial ? `Edit ${initial.name}` : 'New supplement'}</p>

      <TextField
        label="Name"
        value={name}
        onChange={(e) => {
          setName(e.target.value)
          setError(null)
        }}
        placeholder="Fish oil"
      />

      <div className="flex items-end gap-2">
        <SelectField
          label="Counted in"
          className="min-w-0 flex-1"
          value={unit}
          onChange={(e) => {
            setUnit(e.target.value as SupplementUnit)
            setError(null)
          }}
        >
          {SUPPLEMENT_UNITS.map((u) => (
            <option key={u.value} value={u.value}>{u.plural}</option>
          ))}
        </SelectField>
        {!mass && (
          <TextField
            label={`Grams per ${unit}`}
            type="number"
            inputMode="decimal"
            min={0}
            className="w-32 min-w-0 shrink-0"
            value={grams}
            onChange={(e) => {
              setGrams(e.target.value)
              setError(null)
            }}
          />
        )}
      </div>

      <div className="flex flex-col gap-2">
        <p className="footnote text-ink-2">Macros {per}, from the label</p>
        <div className="grid grid-cols-2 gap-2">
          <TextField label="Calories" type="number" inputMode="decimal" min={0} value={calories} onChange={(e) => setCalories(e.target.value)} />
          <TextField label="Protein (g)" type="number" inputMode="decimal" min={0} value={protein} onChange={(e) => setProtein(e.target.value)} />
          <TextField label="Carbs (g)" type="number" inputMode="decimal" min={0} value={carbs} onChange={(e) => setCarbs(e.target.value)} />
          <TextField label="Fat (g)" type="number" inputMode="decimal" min={0} value={fat} onChange={(e) => setFat(e.target.value)} />
        </div>
      </div>

      {/* DS error: an ink message with a protein dot, never red text. */}
      {error && (
        <p role="alert" className="flex items-center gap-2 footnote text-black">
          <span aria-hidden="true" className="size-1.5 shrink-0 rounded-pill bg-protein" />
          {error}
        </p>
      )}

      <div className="flex items-center gap-2">
        <Button size="sm" className="h-11 min-w-0 flex-1" onClick={handleSave} disabled={saving} isLoading={saving}>
          {initial ? 'Save changes' : 'Add supplement'}
        </Button>
        <Button variant="secondary" size="sm" className="h-11 min-w-0 flex-1" onClick={onCancel} disabled={saving}>
          Cancel
        </Button>
      </div>
    </div>
  )
}

export default SupplementForm
