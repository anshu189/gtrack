import { useState, useEffect, useRef } from 'react'
import type { Food, Nutrition } from '@/types'
import { Button } from '@/components/ui/button'
import { foodSearchService } from '@/lib/search/foodSearch'
import { foodRepository } from '@/lib/repositories/foodRepository'
import { formatNum } from '@/lib/utils/format'

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
  const [importMsg, setImportMsg] = useState<string | null>(null)
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
    const factor = (food.servingSize ?? 100) / 100
    setNutrition({
      calories: Math.round(food.nutrition.calories * factor * 100) / 100,
      protein: Math.round(food.nutrition.protein * factor * 100) / 100,
      carbs: Math.round(food.nutrition.carbs * factor * 100) / 100,
      fat: Math.round(food.nutrition.fat * factor * 100) / 100,
    })
    setFiber(food.nutrition.fiber ? Math.round(food.nutrition.fiber * factor * 100) / 100 : 0)
    setDone(null)
  }

  const handleUpdate = async () => {
    if (!selected) return
    setSaving(true)
    try {
      const servingSize = selected.servingSize ?? 100
      const factor = servingSize === 100 ? 1 : 100 / servingSize
      await foodRepository.update(selected.id, {
        nutrition: {
          calories: Math.round(nutrition.calories * factor * 100) / 100,
          protein: Math.round(nutrition.protein * factor * 100) / 100,
          carbs: Math.round(nutrition.carbs * factor * 100) / 100,
          fat: Math.round(nutrition.fat * factor * 100) / 100,
          fiber: fiber ? Math.round(fiber * factor * 100) / 100 : undefined,
        },
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

      // save to localStorage
      localStorage.setItem(LS_KEY, JSON.stringify(overrides))

      // apply to IndexedDB
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
      // refresh search to reflect updated values
      await foodSearchService.refreshIfStale()
    } catch (e) {
      setImportMsg('Import failed — check file format')
    }
    // reset file input so same file can be re-imported
    if (fileRef.current) fileRef.current.value = ''
  }

  const fields: { label: string; key: keyof Nutrition; value: number; setter: (v: number) => void }[] = [
    { label: 'Calories', key: 'calories', value: nutrition.calories, setter: (v) => setNutrition((p) => ({ ...p, calories: v })) },
    { label: 'Protein (g)', key: 'protein', value: nutrition.protein, setter: (v) => setNutrition((p) => ({ ...p, protein: v })) },
    { label: 'Carbs (g)', key: 'carbs', value: nutrition.carbs, setter: (v) => setNutrition((p) => ({ ...p, carbs: v })) },
    { label: 'Fat (g)', key: 'fat', value: nutrition.fat, setter: (v) => setNutrition((p) => ({ ...p, fat: v })) },
  ]

  return (
    <div className="w-full">
      <div className="flex items-center gap-2">
        <input
          className="flex-1 border border-slate-200 px-3 py-2 text-sm dark:border-[#2D2D2D] dark:bg-[#1F1F1F] dark:text-[#FDFDFD]"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search food to edit macros"
        />
        <Button onClick={() => setQ('')} variant="ghost">Clear</Button>
      </div>

      <div className="mt-2 max-h-72 overflow-auto">
        {loading && <p className="text-sm text-slate-500 dark:text-[#FDFDFD]/60">Searching...</p>}
        {!loading && results.length === 0 && q && <p className="text-sm text-slate-500 dark:text-[#FDFDFD]/60">No results</p>}
        <ul className="space-y-1">
          {results.map((f) => (
            <li
              key={f.id}
              className={`flex cursor-pointer items-center justify-between p-2 hover:bg-neutral-50 dark:hover:bg-[#2D2D2D] ${selected?.id === f.id ? 'bg-neutral-100 dark:bg-[#2D2D2D]' : ''}`}
              onClick={() => handleSelect(f)}
            >
              <div>
                <p className="text-sm font-medium text-slate-950 dark:text-[#FDFDFD]">{f.name}</p>
                <p className="text-xs text-slate-500 dark:text-[#FDFDFD]/70">{f.source}{f.sourceReference ? ` · ${f.sourceReference}` : ''}</p>
              </div>
              <p className="text-xs text-slate-400 dark:text-[#FDFDFD]/70">{f.nutrition.calories} kcal</p>
            </li>
          ))}
        </ul>
      </div>

      {selected && (
        <div className="mt-3 border border-slate-200 bg-slate-50 p-3 dark:border-[#2D2D2D] dark:bg-[#1F1F1F]">
          <p className="mb-2 text-sm font-semibold text-slate-950 dark:text-[#FDFDFD]">{selected.name}</p>
          <p className="mb-3 text-xs text-slate-400 dark:text-[#FDFDFD]/70">
            Per {selected.servingSize ?? 100}{selected.servingUnit ?? 'g'}: {formatNum(selected.nutrition.calories)} kcal / {formatNum(selected.nutrition.protein)}g P / {formatNum(selected.nutrition.carbs)}g C / {formatNum(selected.nutrition.fat)}g F{selected.nutrition.fiber ? ` / ${formatNum(selected.nutrition.fiber)}g fiber` : ''}
            {selected.source && ` (${selected.source})`}
          </p>
          <div className="grid grid-cols-2 gap-2">
            {fields.map((f) => (
              <div key={f.key}>
                <p className="text-xs text-slate-500 mb-1 dark:text-[#FDFDFD]/60">{f.label}</p>
                <input
                  type="number"
                  className="w-full border border-slate-200 px-3 py-2 text-sm dark:border-[#2D2D2D] dark:bg-[#2D2D2D] dark:text-[#FDFDFD]"
                  value={f.value}
                  onChange={(e) => f.setter(Number(e.target.value))}
                />
              </div>
            ))}
            <div>
              <p className="text-xs text-slate-500 mb-1 dark:text-[#FDFDFD]/60">Fiber (g)</p>
              <input
                type="number"
                className="w-full border border-slate-200 px-3 py-2 text-sm dark:border-[#2D2D2D] dark:bg-[#2D2D2D] dark:text-[#FDFDFD]"
                value={fiber}
                onChange={(e) => setFiber(Number(e.target.value))}
              />
            </div>
          </div>
          <div className="mt-3 flex items-center gap-2">
            <Button onClick={handleUpdate} disabled={saving} size="sm">
              {saving ? 'Saving...' : 'Update'}
            </Button>
            <Button variant="ghost" size="sm" onClick={() => { setSelected(null); setQ('') }}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      {done && (
        <p className="mt-2 text-sm text-green-600 dark:text-green-400">Updated: {done}</p>
      )}

      <div className="mt-4 flex items-center gap-2 border-t border-slate-200 pt-3 dark:border-[#2D2D2D]">
        <Button variant="outline" size="sm" onClick={handleExport}>Export Overrides</Button>
        <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()}>Import Overrides</Button>
        <input ref={fileRef} type="file" accept=".json" className="hidden" onChange={handleImport} />
      </div>
      {importMsg && (
        <p className="mt-2 text-sm text-slate-600 dark:text-[#FDFDFD]/70">{importMsg}</p>
      )}
    </div>
  )
}

export default FoodMacroEditor
