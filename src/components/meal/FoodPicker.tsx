import { useState, useEffect, useRef } from 'react'
import type { Food } from '@/types'
import { Button } from '@/components/ui/button'
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

const FoodPicker = ({ onSelect, placeholder = 'Search foods' }: FoodPickerProps) => {
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
      <div className="flex items-center gap-2">
        <input
          className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900 dark:text-white"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={placeholder}
        />
        <Button onClick={() => setQ('')} variant="ghost">Clear</Button>
      </div>
      <div className="mt-2 max-h-56 overflow-auto">
        {loading && <p className="text-sm text-slate-500 dark:text-neutral-500">Searching...</p>}
        {!loading && results.length === 0 && q && <p className="text-sm text-slate-500 dark:text-neutral-500">No results</p>}
        <ul className="space-y-1">
          {results.map((f) => (
            <li
              key={f.id}
              className="flex cursor-pointer items-center justify-between rounded-lg p-2 hover:bg-blue-50 dark:hover:bg-neutral-800"
              onClick={() => { onSelect(f); setQ('') }}
            >
              <div>
                <p className="text-sm font-medium text-slate-950 dark:text-white">{f.name}</p>
                <p className="text-xs text-slate-500 dark:text-neutral-400">{f.nutrition.calories} kcal / {f.servingSize}{f.servingUnit ? ` ${f.servingUnit}` : ''}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-3">
        {!showCustomForm ? (
          <Button variant="outline" size="sm" className="w-full" onClick={() => setShowCustomForm(true)}>
            + Create Custom Food
          </Button>
        ) : (
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 space-y-3 dark:border-neutral-700 dark:bg-neutral-900">
            <p className="text-xs font-semibold text-slate-700 dark:text-neutral-300">New Custom Food</p>
            <input
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              placeholder="Food name"
            />
            <select
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
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
                className="w-24 rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                value={customServing}
                onChange={(e) => setCustomServing(Number(e.target.value))}
                placeholder="Serving"
              />
              <input
                className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                value={customUnit}
                onChange={(e) => setCustomUnit(e.target.value)}
                placeholder="Unit (e.g. g, ml, oz)"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <p className="text-xs text-slate-500 mb-1 dark:text-neutral-500">Calories</p>
                <input
                  type="number"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                  value={customCalories}
                  onChange={(e) => setCustomCalories(Number(e.target.value))}
                />
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1 dark:text-neutral-500">Protein (g)</p>
                <input
                  type="number"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                  value={customProtein}
                  onChange={(e) => setCustomProtein(Number(e.target.value))}
                />
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1 dark:text-neutral-500">Carbs (g)</p>
                <input
                  type="number"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                  value={customCarbs}
                  onChange={(e) => setCustomCarbs(Number(e.target.value))}
                />
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1 dark:text-neutral-500">Fat (g)</p>
                <input
                  type="number"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                  value={customFat}
                  onChange={(e) => setCustomFat(Number(e.target.value))}
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button onClick={handleCreateCustom} disabled={!customName.trim() || saving} size="sm">
                {saving ? 'Saving...' : 'Save Food'}
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setShowCustomForm(false)}>
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
