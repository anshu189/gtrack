import { useState, useEffect, useRef } from 'react'
import type { Food } from '@/types'
import { foodSearchService } from '@/lib/search/foodSearch'
import { foodRepository } from '@/lib/repositories/foodRepository'

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

  const handleCreateCustom = async () => {
    if (!customName.trim()) return
    setSaving(true)
    try {
      const food = await foodRepository.createCustom({
        name: customName.trim(),
        category: customCategory,
        servingSize: customServing,
        servingUnit: customUnit,
        nutrition: {
          calories: customCalories,
          protein: customProtein,
          carbs: customCarbs,
          fat: customFat,
        },
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
      <input
        className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2.5 text-sm text-[var(--color-text)] placeholder-[var(--color-muted)]"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder={placeholder}
      />
      <div className="mt-2 max-h-56 overflow-auto">
        {loading && <p className="text-sm text-[var(--color-muted)]">Searching...</p>}
        {!loading && results.length === 0 && q && <p className="text-sm text-[var(--color-muted)]">No results</p>}
        <ul className="space-y-1">
          {results.map((f) => (
            <li
              key={f.id}
              className="flex cursor-pointer items-center justify-between rounded-lg p-2 border border-[var(--color-border)] bg-[var(--color-surface)] hover:bg-[var(--color-surface-alt)] transition-colors"
              onClick={() => { onSelect(f); setQ('') }}
            >
              <div>
                <p className="text-sm font-medium text-[var(--color-text)]">{f.name}</p>
                <div className="flex items-center gap-2 text-xs mt-0.5">
                  <span className="text-[var(--color-text)]">{f.nutrition.calories} kcal</span>
                  <span className="text-[var(--color-accent)]">{f.nutrition.protein}g P</span>
                  <span className="text-[var(--color-warning)]">{f.nutrition.carbs}g C</span>
                  <span className="text-[var(--color-error)]">{f.nutrition.fat}g F</span>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-3">
        {!showCustomForm ? (
          <button
            type="button"
            className="w-full rounded-lg py-2 text-sm font-medium text-[var(--color-muted)] border border-[var(--color-border)] hover:bg-[var(--color-surface)] transition-colors"
            onClick={() => setShowCustomForm(true)}
          >
            + Create Custom Food
          </button>
        ) : (
          <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-3 space-y-3">
            <p className="text-xs font-semibold text-[var(--color-muted)]">New Custom Food</p>
            <input
              className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-sm text-[var(--color-text)] placeholder-[var(--color-muted)]"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              placeholder="Food name"
            />
            <select
              className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-sm text-[var(--color-text)]"
              value={customCategory}
              onChange={(e) => setCustomCategory(e.target.value)}
            >
              {CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <div className="flex items-center gap-2">
              <input
                type="number"
                className="w-24 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-sm text-[var(--color-text)]"
                value={customServing}
                onChange={(e) => setCustomServing(Number(e.target.value))}
                placeholder="Serving"
              />
              <input
                className="flex-1 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-sm text-[var(--color-text)] placeholder-[var(--color-muted)]"
                value={customUnit}
                onChange={(e) => setCustomUnit(e.target.value)}
                placeholder="Unit (e.g. g, ml, oz)"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <p className="text-xs text-[var(--color-muted)] mb-1">Calories</p>
                <input
                  type="number"
                  className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-sm text-[var(--color-text)]"
                  value={customCalories}
                  onChange={(e) => setCustomCalories(Number(e.target.value))}
                />
              </div>
              <div>
                <p className="text-xs text-[var(--color-muted)] mb-1">Protein (g)</p>
                <input
                  type="number"
                  className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-sm text-[var(--color-text)]"
                  value={customProtein}
                  onChange={(e) => setCustomProtein(Number(e.target.value))}
                />
              </div>
              <div>
                <p className="text-xs text-[var(--color-muted)] mb-1">Carbs (g)</p>
                <input
                  type="number"
                  className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-sm text-[var(--color-text)]"
                  value={customCarbs}
                  onChange={(e) => setCustomCarbs(Number(e.target.value))}
                />
              </div>
              <div>
                <p className="text-xs text-[var(--color-muted)] mb-1">Fat (g)</p>
                <input
                  type="number"
                  className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-sm text-[var(--color-text)]"
                  value={customFat}
                  onChange={(e) => setCustomFat(Number(e.target.value))}
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCreateCustom}
                disabled={!customName.trim() || saving}
                className="flex-1 rounded-lg py-2 text-sm font-medium bg-[var(--color-text)] text-[var(--color-bg)] hover:opacity-90 transition-colors disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Food'}
              </button>
              <button
                type="button"
                onClick={() => setShowCustomForm(false)}
                className="flex-1 rounded-lg py-2 text-sm font-medium border border-[var(--color-border)] text-[var(--color-text)] hover:bg-[var(--color-surface)] transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default FoodPicker
