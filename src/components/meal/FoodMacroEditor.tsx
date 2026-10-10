import { useState, useEffect, useRef } from 'react'
import type { Food, FoodMeasure, Nutrition } from '@/types'
import { foodSearchService } from '@/lib/search/foodSearch'
import { foodRepository } from '@/lib/repositories/foodRepository'
import { formatCalories, formatNum } from '@/lib/utils/format'
import { computeGramsPerUnit, gramsFor, scaleNutrition, toPer100 } from '@/lib/utils/nutrition'
import { cn } from '@/lib/utils/cn'
import { Button, FOCUS, Icon, MacroInline, SelectField, TextField } from '@/components/ds'

const LS_KEY = 'gtrak:macroOverrides'

const FoodMacroEditor = () => {
  const [q, setQ] = useState('')
  const [results, setResults] = useState<Food[]>([])
  const [loading, setLoading] = useState(false)
  const [selected, setSelected] = useState<Food | null>(null)
  const [nutrition, setNutrition] = useState<Nutrition>({ calories: 0, protein: 0, carbs: 0, fat: 0 })
  const [fiber, setFiber] = useState(0)
  const [saving, setSaving] = useState(false)
  const [done, setDone] = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [importMsg, setImportMsg] = useState<string | null>(null)
  const [editQuantity, setEditQuantity] = useState<number>(100)
  const [editUnit, setEditUnit] = useState('g')
  const fileRef = useRef<HTMLInputElement>(null)
  const debounceRef = useRef<number | null>(null)

  useEffect(() => {
    if (debounceRef.current) window.clearTimeout(debounceRef.current)
    if (!q) { setResults([]); setLoading(false); return }
    setLoading(true)
    debounceRef.current = window.setTimeout(async () => {
      try {
        const res = await foodSearchService.search(q, 15)
        setResults(res.map((r) => r.item))
      } finally {
        setLoading(false)
      }
    }, 180)
    return () => { if (debounceRef.current) window.clearTimeout(debounceRef.current) }
  }, [q])

  const handleSelect = (food: Food) => {
    setSelected(food)
    // The choice is made, so the query and its result list get out of the way.
    setQ('')
    setResults([])
    const qty = food.servingSize ?? 100
    const unit = food.servingUnit ?? 'g'
    setEditQuantity(qty)
    setEditUnit(unit)
    /**
     * Scale by the serving's GRAMS, not its raw quantity. Using the quantity
     * meant "1 piece" divided the stored per-100g values by 100, while saving
     * used grams — so a non-gram unit could never round-trip.
     */
    const scaled = scaleNutrition(food.nutrition, gramsFor(food, qty, unit))
    setNutrition({
      calories: scaled.calories,
      protein: scaled.protein,
      carbs: scaled.carbs,
      fat: scaled.fat,
    })
    setFiber(scaled.fiber ?? 0)
    setDone(null)
  }

  const handleQuantityChange = (newQty: number, newUnit: string) => {
    if (!selected) return
    const oldGrams = editQuantity * computeGramsPerUnit(selected, editUnit)
    const newGrams = newQty * computeGramsPerUnit(selected, newUnit)
    const scale = oldGrams > 0 ? newGrams / oldGrams : 1
    setNutrition((p) => ({
      calories: Math.round(p.calories * scale * 100) / 100,
      protein: Math.round(p.protein * scale * 100) / 100,
      carbs: Math.round(p.carbs * scale * 100) / 100,
      fat: Math.round(p.fat * scale * 100) / 100,
    }))
    setFiber((p) => Math.round(p * scale * 100) / 100)
    setEditQuantity(newQty)
    setEditUnit(newUnit)
  }

  const handleDelete = async () => {
    if (!selected) return
    setSaving(true)
    try {
      await foodRepository.delete(selected.id)
      setDone(`Deleted ${selected.name}`)
      setSelected(null)
      setQ('')
      setResults([])
      setConfirmDelete(false)
    } finally {
      setSaving(false)
    }
  }

  const handleUpdate = async () => {
    if (!selected) return
    setSaving(true)
    try {
      const grams = gramsFor(selected, editQuantity, editUnit)


      const existingMeasures = selected.measures ?? []
      let newMeasures = [...existingMeasures]
      if (editUnit !== 'g' && editUnit !== 'ml') {
        const idx = newMeasures.findIndex((m) => m.unit === editUnit)
        const entry: FoodMeasure = {
          label: `${editQuantity} ${editUnit}`,
          quantity: editQuantity,
          unit: editUnit,
          grams: editQuantity * computeGramsPerUnit(selected, editUnit),
        }
        if (idx >= 0) {
          newMeasures[idx] = entry
        } else {
          newMeasures.push(entry)
        }
      }

      await foodRepository.update(selected.id, {
        nutrition: toPer100({ ...nutrition, fiber: fiber ?? 0 }, grams),
        measures: newMeasures,
        servingSize: editQuantity,
        servingUnit: editUnit,
      })
      setDone(selected.name)
      setSelected(null)
      setQ('')
    } finally {
      setSaving(false)
    }
  }

  const handleExport = () => {
    try {
      const stored = localStorage.getItem(LS_KEY)
      const overrides: Record<string, Nutrition> = stored ? JSON.parse(stored) : {}
      const count = Object.keys(overrides).length
      if (count === 0) { setImportMsg('No overrides to export'); return }
      const blob = new Blob([JSON.stringify(overrides, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `macro-overrides-${new Date().toISOString().split('T')[0]}.json`
      a.click()
      URL.revokeObjectURL(url)
      setImportMsg(`Exported ${count} override${count > 1 ? 's' : ''}`)
    } catch (e) {
      setImportMsg('Export failed')
    }
  }

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const text = await file.text()
      const overrides: Record<string, Nutrition> = JSON.parse(text)
      const ids = Object.keys(overrides)
      if (ids.length === 0) { setImportMsg('File is empty'); return }

      localStorage.setItem(LS_KEY, JSON.stringify(overrides))

      let applied = 0
      for (const id of ids) {
        const food = await foodRepository.getById(id)
        if (food) {
          await foodRepository.update(id, {
            nutrition: { ...food.nutrition, ...overrides[id] },
          })
          applied++
        }
      }
      setImportMsg(`Imported ${applied} of ${ids.length} override${ids.length > 1 ? 's' : ''}`)
      await foodSearchService.refreshIfStale()
    } catch (e) {
      setImportMsg('Import failed — check file format')
    }
    if (fileRef.current) fileRef.current.value = ''
  }

  const fields: { label: string; key: keyof Nutrition; value: number; setter: (v: number) => void }[] = [
    { label: 'Calories', key: 'calories', value: nutrition.calories, setter: (v) => setNutrition((p) => ({ ...p, calories: v })) },
    { label: 'Protein (g)', key: 'protein', value: nutrition.protein, setter: (v) => setNutrition((p) => ({ ...p, protein: v })) },
    { label: 'Carbs (g)', key: 'carbs', value: nutrition.carbs, setter: (v) => setNutrition((p) => ({ ...p, carbs: v })) },
    { label: 'Fat (g)', key: 'fat', value: nutrition.fat, setter: (v) => setNutrition((p) => ({ ...p, fat: v })) },
  ]

  return (
    <div className="w-full rounded-lg">
      <TextField
        label="Search food to edit macros"
        isLabelHidden
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search food to edit macros"
        icon={<Icon name="search" size={18} />}
      />

      <div className="mt-2 max-h-72 overflow-auto">
        {loading && <p className="footnote text-ink-2">Searching…</p>}
        {!loading && results.length === 0 && q && <p className="footnote text-ink-2">No results</p>}
        <ul className="flex flex-col gap-1">
          {results.map((f) => (
            <li key={f.id}>
              <button
                type="button"
                className={cn(
                  'flex w-full cursor-pointer items-center justify-between gap-2 rounded-md border border-line bg-surface p-3 text-left',
                  'transition-colors hover:bg-surface-2',
                  selected?.id === f.id && 'bg-surface-2',
                  FOCUS,
                )}
                onClick={() => handleSelect(f)}
              >
                <span className="flex min-w-0 flex-col">
                  <span className="truncate footnote text-black">{f.name}</span>
                  <span className="truncate caption text-ink-2">{f.source}{f.sourceReference ? ` · ${f.sourceReference}` : ''}</span>
                </span>
                <span className="inline-flex shrink-0 items-center gap-1 caption text-ink-2">
                  <Icon name="flame" size={13} />
                  {formatCalories(f.nutrition.calories)} kcal
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      {selected && (
        <div className="mt-3 rounded-lg border border-line bg-surface p-3">
          <p className="mb-3 title-2 text-black">{selected.name}</p>

          <div className="mb-4 flex items-end gap-2">
            <TextField
              label="Per"
              type="number"
              inputMode="decimal"
              min={0}
              className="w-24 shrink-0"
              value={String(editQuantity)}
              onChange={(e) => handleQuantityChange(Number(e.target.value), editUnit)}
            />
            <SelectField
              label="Unit"
              className="min-w-0 flex-1"
              value={editUnit}
              onChange={(e) => handleQuantityChange(editQuantity, e.target.value)}
            >
              {['g', 'ml', 'piece', 'cup', 'tbsp', 'tsp', 'slice'].map((u) => (
                <option key={u} value={u}>{u}</option>
              ))}
            </SelectField>
          </div>

          <div className="mb-6 flex flex-wrap items-center gap-x-3 gap-y-1">
            <span className="inline-flex items-center gap-1 caption text-ink-2">
              <Icon name="flame" size={13} />
              {formatCalories(nutrition.calories)} kcal
            </span>
            <MacroInline
              protein={`${formatNum(nutrition.protein)}g`}
              carbs={`${formatNum(nutrition.carbs)}g`}
              fat={`${formatNum(nutrition.fat)}g`}
            />
            {fiber ? <span className="caption text-ink-2">{formatNum(fiber)}g fiber</span> : null}
            {selected.source && <span className="caption text-ink-3">{selected.source}</span>}
          </div>
          <div className="grid grid-cols-2 gap-2">
            {fields.map((f) => (
              <TextField
                key={f.key}
                label={f.label}
                type="number"
                inputMode="decimal"
                min={0}
                value={String(f.value)}
                onChange={(e) => f.setter(Number(e.target.value))}
              />
            ))}
            <TextField
              label="Fiber (g)"
              type="number"
              inputMode="decimal"
              min={0}
              value={String(fiber)}
              onChange={(e) => setFiber(Number(e.target.value))}
            />
          </div>
          <div className="mt-3 grid grid-cols-3 gap-2">
            <Button
              size="sm"
              className="h-11 min-w-0"
              onClick={handleUpdate}
              disabled={saving || confirmDelete}
              isLoading={saving}
            >
              {saving ? 'Saving…' : 'Update'}
            </Button>
            <Button
              variant="secondary"
              size="sm"
              className="h-11 min-w-0"
              onClick={() => { setSelected(null); setQ(''); setResults([]); setConfirmDelete(false) }}
            >
              Cancel
            </Button>
            {/* Two-step: deleting a food cannot be undone from the UI. */}
            <Button
              variant="secondary"
              size="sm"
              className="h-11 min-w-0 text-protein hover:text-protein"
              onClick={confirmDelete ? handleDelete : () => setConfirmDelete(true)}
              disabled={saving}
            >
              {confirmDelete ? 'Confirm' : 'Delete'}
            </Button>
          </div>
          {confirmDelete && (
            <p className="mt-2 footnote text-ink-2">
              Removes {selected.name} from your food list. Meals already logged keep
              their own copy of the name and macros, so your history is unchanged.
            </p>
          )}
        </div>
      )}

      {done && (
        <p className="mt-2 text-sm text-success">Updated: {done}</p>
      )}

      <div className="mt-4 flex items-center gap-2 border-t border-line pt-3">
        <Button
          variant="secondary"
          size="sm"
          className="h-11 min-w-0 flex-1"
          icon={<Icon name="download" size={16} />}
          onClick={handleExport}
        >
          Export
        </Button>
        <Button
          variant="secondary"
          size="sm"
          className="h-11 min-w-0 flex-1"
          icon={<Icon name="upload" size={16} />}
          onClick={() => fileRef.current?.click()}
        >
          Import
        </Button>
        <input ref={fileRef} type="file" accept=".json" className="hidden" onChange={handleImport} />
      </div>
      {importMsg && (
        <p className="mt-2 text-sm text-ink-2">{importMsg}</p>
      )}
    </div>
  )
}

export default FoodMacroEditor
