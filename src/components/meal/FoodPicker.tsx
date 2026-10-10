import { useState, useEffect, useRef } from 'react'
import type { Food } from '@/types'
import { foodSearchService } from '@/lib/search/foodSearch'
import { foodRepository } from '@/lib/repositories/foodRepository'
import { DEFAULT_GRAMS_PER_UNIT, toPer100 } from '@/lib/utils/nutrition'
import { formatCalories, formatNum } from '@/lib/utils/format'
import { cn } from '@/lib/utils/cn'
import { Button, FOCUS, Icon, MacroInline, SelectField, TextField } from '@/components/ds'

const CATEGORIES = [
  { id: 'cat:fruits', name: 'Fruits' },
  { id: 'cat:vegetables', name: 'Vegetables' },
  { id: 'cat:meat', name: 'Meat & Fish' },
  { id: 'cat:grains', name: 'Grains' },
  { id: 'cat:dairy', name: 'Dairy' },
  { id: 'cat:pantry', name: 'Pantry & Staples' },
]

interface FoodPickerProps {
  onSelect: (food: Food) => void
  placeholder?: string
}

const FoodPicker = ({ onSelect, placeholder = 'Search food...' }: FoodPickerProps) => {
  const [q, setQ] = useState('')
  const [results, setResults] = useState<Food[]>([])
  const [loading, setLoading] = useState(false)
  const [showCustomForm, setShowCustomForm] = useState(false)
  const [customName, setCustomName] = useState('')
  const [customCategory, setCustomCategory] = useState('cat:pantry')
  const [customServing, setCustomServing] = useState(100)
  const [customUnit, setCustomUnit] = useState('g')
  const [customCalories, setCustomCalories] = useState(0)
  const [customProtein, setCustomProtein] = useState(0)
  const [customCarbs, setCustomCarbs] = useState(0)
  const [customFat, setCustomFat] = useState(0)
  const [customFiber, setCustomFiber] = useState(0)
  /** Grams in one unit, for discrete units like "piece". */
  const [customGramsPerUnit, setCustomGramsPerUnit] = useState(DEFAULT_GRAMS_PER_UNIT.piece)
  const [saving, setSaving] = useState(false)
  const debounceRef = useRef<number | null>(null)

  useEffect(() => {
    if (debounceRef.current) window.clearTimeout(debounceRef.current)
    if (!q) {
      setResults([])
      setLoading(false)
      return
    }
    setLoading(true)
    debounceRef.current = window.setTimeout(async () => {
      try {
        const res = await foodSearchService.search(q, 15)
        setResults(res.map((r) => r.item))
      } finally {
        setLoading(false)
      }
    }, 180)

    return () => {
      if (debounceRef.current) window.clearTimeout(debounceRef.current)
    }
  }, [q])

  const isWeightUnit = customUnit === 'g' || customUnit === 'ml'
  /** The grams the entered macros actually describe. */
  const customServingGrams = isWeightUnit
    ? customServing
    : customServing * (customGramsPerUnit || 1)

  const handleCreateCustom = async () => {
    if (!customName.trim()) return
    setSaving(true)
    try {
      /**
       * The macros are entered FOR THE SERVING ("600 kcal per 1 piece"), but
       * nutrition is stored per 100g. This used to pass them through
       * unconverted, so a 300g food was stored as though those were its
       * per-100g values and read back at 3x.
       */
      const food = await foodRepository.createCustom({
        name: customName.trim(),
        category: customCategory,
        servingSize: customServing,
        servingUnit: customUnit,
        // Pin the unit's weight so nothing later falls back to a guess.
        measures: isWeightUnit
          ? []
          : [
              {
                label: `${customServing} ${customUnit}`,
                quantity: customServing,
                unit: customUnit,
                grams: customServingGrams,
              },
            ],
        nutrition: toPer100(
          {
            calories: customCalories,
            protein: customProtein,
            carbs: customCarbs,
            fat: customFat,
            fiber: customFiber,
          },
          customServingGrams,
        ),
      })
      setShowCustomForm(false)
      setCustomName('')
      setCustomCalories(0)
      setCustomProtein(0)
      setCustomCarbs(0)
      setCustomFat(0)
      onSelect(food)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="w-full">
      <TextField
        label="Search food"
        isLabelHidden
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder={placeholder}
        icon={<Icon name="search" size={18} />}
      />

      <div className="mt-2 max-h-56 overflow-auto">
        {loading && <p className="footnote text-ink-2">Searching…</p>}
        {!loading && results.length === 0 && q && <p className="footnote text-ink-2">No results</p>}
        <ul className="flex flex-col gap-1">
          {results.map((f) => (
            <li key={f.id}>
              <button
                type="button"
                className={cn(
                  'flex w-full cursor-pointer flex-col gap-1 rounded-md border border-line bg-surface p-3 text-left',
                  'transition-colors hover:bg-surface-2',
                  FOCUS,
                )}
                onClick={() => { onSelect(f); setQ(''); setResults([]) }}
              >
                <div className="flex items-baseline justify-between gap-2">
                  <span className="min-w-0 truncate footnote text-black">{f.name}</span>
                  <span className="inline-flex shrink-0 items-center gap-1 caption text-ink-2">
                    <Icon name="flame" size={13} />
                    {formatCalories(f.nutrition.calories)} kcal
                  </span>
                </div>
                <MacroInline
                  protein={`${formatNum(f.nutrition.protein)}g`}
                  carbs={`${formatNum(f.nutrition.carbs)}g`}
                  fat={`${formatNum(f.nutrition.fat)}g`}
                />
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-3">
        {!showCustomForm ? (
          <Button
            variant="secondary"
            size="sm"
            block
            className="h-11"
            icon={<Icon name="plus" size={16} />}
            onClick={() => setShowCustomForm(true)}
          >
            Create Custom Food
          </Button>
        ) : (
          <div className="flex flex-col gap-3 rounded-lg border border-line bg-surface p-3">
            <p className="title-2 text-black">New custom food</p>

            <TextField
              label="Food name"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              placeholder="Food name"
            />

            <SelectField
              label="Category"
              value={customCategory}
              onChange={(e) => setCustomCategory(e.target.value)}
            >
              {CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </SelectField>

            <div className="flex items-end gap-2">
              <TextField
                label="Serving"
                type="number"
                inputMode="decimal"
                min={0}
                className="w-24 shrink-0"
                value={String(customServing)}
                onChange={(e) => setCustomServing(Number(e.target.value))}
              />
              <TextField
                label="Unit"
                className="min-w-0 flex-1"
                value={customUnit}
                onChange={(e) => setCustomUnit(e.target.value)}
                placeholder="g, ml, piece…"
              />
            </div>

            {!isWeightUnit && (
              <TextField
                label={`One ${customUnit || 'piece'} weighs (g)`}
                type="number"
                inputMode="decimal"
                min={0}
                value={String(customGramsPerUnit)}
                onChange={(e) => setCustomGramsPerUnit(Number(e.target.value) || 0)}
              />
            )}

            <p className="footnote text-ink-2">
              Enter the macros for {customServing || 0} {customUnit || 'g'}
              {!isWeightUnit && customServingGrams > 0 ? ` (${customServingGrams}g)` : ''}.
            </p>

            <div className="grid grid-cols-2 gap-2">
              <TextField
                label="Calories"
                type="number"
                inputMode="decimal"
                min={0}
                value={String(customCalories)}
                onChange={(e) => setCustomCalories(Number(e.target.value))}
              />
              <TextField
                label="Protein (g)"
                type="number"
                inputMode="decimal"
                min={0}
                value={String(customProtein)}
                onChange={(e) => setCustomProtein(Number(e.target.value))}
              />
              <TextField
                label="Carbs (g)"
                type="number"
                inputMode="decimal"
                min={0}
                value={String(customCarbs)}
                onChange={(e) => setCustomCarbs(Number(e.target.value))}
              />
              <TextField
                label="Fat (g)"
                type="number"
                inputMode="decimal"
                min={0}
                value={String(customFat)}
                onChange={(e) => setCustomFat(Number(e.target.value))}
              />
              <TextField
                label="Fiber (g)"
                type="number"
                inputMode="decimal"
                min={0}
                value={String(customFiber)}
                onChange={(e) => setCustomFiber(Number(e.target.value))}
              />
            </div>

            <div className="flex items-center gap-2">
              <Button
                size="sm"
                className="h-11 min-w-0 flex-1"
                onClick={handleCreateCustom}
                disabled={!customName.trim() || saving}
                isLoading={saving}
              >
                {saving ? 'Saving…' : 'Save Food'}
              </Button>
              <Button
                variant="secondary"
                size="sm"
                className="h-11 min-w-0 flex-1"
                onClick={() => setShowCustomForm(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default FoodPicker
