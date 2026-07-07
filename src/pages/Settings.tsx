import { useState, useEffect, useRef } from 'react'
import type { UserSettings } from '@/types'
import { useSettingsStore } from '@/stores/settingsStore'
import db from '@/lib/db'
import { PageContainer } from '@/components/ui/page-container'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

const DEFAULT_SETTINGS: UserSettings = {
  id: 'settings:default',
  unitSystem: 'metric',
  theme: 'light',
  nutritionTargets: { calories: 3300, protein: 120, carbs: 420, fat: 95, fiber: 35 },
  waterGoalMl: 2000,
}

export default function Settings() {
  const settingsStore = useSettingsStore()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [calories, setCalories] = useState(3300)
  const [protein, setProtein] = useState(120)
  const [carbs, setCarbs] = useState(420)
  const [fat, setFat] = useState(95)
  const [fiber, setFiber] = useState(35)
  const [waterGoal, setWaterGoal] = useState(2000)
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('light')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [confirmReset, setConfirmReset] = useState(false)
  const [importStatus, setImportStatus] = useState<string | null>(null)
  const [exportStatus, setExportStatus] = useState<string | null>(null)

  useEffect(() => {
    settingsStore.load()
  }, [])

  useEffect(() => {
    if (settingsStore.settings) {
      const s = settingsStore.settings
      setCalories(s.nutritionTargets?.calories ?? DEFAULT_SETTINGS.nutritionTargets!.calories!)
      setProtein(s.nutritionTargets?.protein ?? DEFAULT_SETTINGS.nutritionTargets!.protein!)
      setCarbs(s.nutritionTargets?.carbs ?? DEFAULT_SETTINGS.nutritionTargets!.carbs!)
      setFat(s.nutritionTargets?.fat ?? DEFAULT_SETTINGS.nutritionTargets!.fat!)
      setFiber(s.nutritionTargets?.fiber ?? DEFAULT_SETTINGS.nutritionTargets!.fiber!)
      setWaterGoal(s.waterGoalMl ?? DEFAULT_SETTINGS.waterGoalMl!)
      setTheme(s.theme ?? 'light')
    }
  }, [settingsStore.settings])

  useEffect(() => {
    const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)
    document.documentElement.classList.toggle('dark', isDark)
  }, [theme])

  const handleSave = async () => {
    setSaving(true)
    const settings: UserSettings = {
      ...(settingsStore.settings ?? DEFAULT_SETTINGS),
      nutritionTargets: {
        calories: Math.max(0, calories),
        protein: Math.max(0, protein),
        carbs: Math.max(0, carbs),
        fat: Math.max(0, fat),
        fiber: Math.max(0, fiber),
      },
      waterGoalMl: Math.max(0, waterGoal),
      theme,
    }
    await settingsStore.save(settings)
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleExport = async () => {
    setExportStatus(null)
    try {
      const data = {
        exportedAt: new Date().toISOString(),
        version: '1.0.0',
        settings: settingsStore.settings ?? null,
        meals: await db.meals.toArray(),
        history: await db.history.toArray(),
        favorites: await db.favorites.toArray(),
        workouts: await db.workouts.toArray(),
        waterLogs: await db.waterLogs.toArray(),
        weights: await db.weights.toArray(),
        dailyNotes: await db.dailyNotes.toArray(),
      }
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `gtrak-export-${new Date().toISOString().split('T')[0]}.json`
      a.click()
      URL.revokeObjectURL(url)
      setExportStatus('Export complete')
    } catch {
      setExportStatus('Export failed')
    }
    setTimeout(() => setExportStatus(null), 3000)
  }

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setImportStatus(null)
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const text = await file.text()
      const data = JSON.parse(text)
      if (!data.version) {
        setImportStatus('Invalid file: missing version')
        return
      }

      if (data.settings) {
        const now = new Date().toISOString()
        await db.settings.put({ ...data.settings, updatedAt: now })
      }
      if (data.meals?.length) await db.meals.bulkAdd(data.meals)
      if (data.history?.length) await db.history.bulkAdd(data.history)
      if (data.favorites?.length) await db.favorites.bulkAdd(data.favorites)
      if (data.workouts?.length) await db.workouts.bulkAdd(data.workouts)
      if (data.waterLogs?.length) await db.waterLogs.bulkAdd(data.waterLogs)
      if (data.weights?.length) await db.weights.bulkAdd(data.weights)
      if (data.dailyNotes?.length) await db.dailyNotes.bulkAdd(data.dailyNotes)

      setImportStatus('Import complete')
      settingsStore.load()
    } catch {
      setImportStatus('Import failed: invalid file')
    }
    if (fileInputRef.current) fileInputRef.current.value = ''
    setTimeout(() => setImportStatus(null), 3000)
  }

  const handleReset = async () => {
    await db.meals.clear()
    await db.history.clear()
    await db.settings.clear()
    await db.favorites.clear()
    await db.workouts.clear()
    await db.waterLogs.clear()
    await db.weights.clear()
    await db.dailyNotes.clear()

    setCalories(DEFAULT_SETTINGS.nutritionTargets!.calories!)
    setProtein(DEFAULT_SETTINGS.nutritionTargets!.protein!)
    setCarbs(DEFAULT_SETTINGS.nutritionTargets!.carbs!)
    setFat(DEFAULT_SETTINGS.nutritionTargets!.fat!)
    setFiber(DEFAULT_SETTINGS.nutritionTargets!.fiber!)
    setWaterGoal(DEFAULT_SETTINGS.waterGoalMl!)
    setTheme('light')

    setConfirmReset(false)
  }

  return (
    <PageContainer>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-950">Settings</h1>
      </div>

      <div className="space-y-6">
        <Card title="Nutrition Targets">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-500">Calories (kcal)</label>
              <input
                type="number"
                className="w-full border border-slate-200 px-3 py-2 text-sm"
                value={calories}
                onChange={(e) => setCalories(Number(e.target.value))}
                min={0}
                step={50}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-500">Protein (g)</label>
              <input
                type="number"
                className="w-full border border-slate-200 px-3 py-2 text-sm"
                value={protein}
                onChange={(e) => setProtein(Number(e.target.value))}
                min={0}
                step={5}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-500">Carbs (g)</label>
              <input
                type="number"
                className="w-full border border-slate-200 px-3 py-2 text-sm"
                value={carbs}
                onChange={(e) => setCarbs(Number(e.target.value))}
                min={0}
                step={5}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-500">Fat (g)</label>
              <input
                type="number"
                className="w-full border border-slate-200 px-3 py-2 text-sm"
                value={fat}
                onChange={(e) => setFat(Number(e.target.value))}
                min={0}
                step={5}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-500">Fiber (g)</label>
              <input
                type="number"
                className="w-full border border-slate-200 px-3 py-2 text-sm"
                value={fiber}
                onChange={(e) => setFiber(Number(e.target.value))}
                min={0}
                step={1}
              />
            </div>
          </div>
        </Card>

        <Card title="Water Goal">
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-500">Daily target (ml)</label>
            <input
              type="number"
              className="w-full border border-slate-200 px-3 py-2 text-sm"
              value={waterGoal}
              onChange={(e) => setWaterGoal(Number(e.target.value))}
              min={0}
              step={100}
            />
          </div>
        </Card>

        <Card title="Theme">
          <div className="flex items-center gap-3">
            <Button variant={theme === 'light' ? 'default' : 'outline'} size="sm" onClick={() => setTheme('light')}>
              Light
            </Button>
            <Button variant={theme === 'dark' ? 'default' : 'outline'} size="sm" onClick={() => setTheme('dark')}>
              Dark
            </Button>
            <Button variant={theme === 'system' ? 'default' : 'outline'} size="sm" onClick={() => setTheme('system')}>
              System
            </Button>
          </div>
        </Card>

        <div className="flex items-center gap-3">
          <Button onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Settings'}
          </Button>
        </div>

        <Card title="Export Data" description="Download all your data as a JSON file.">
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={handleExport}>
              Export
            </Button>
            {exportStatus && <span className="text-xs text-green-600">{exportStatus}</span>}
          </div>
        </Card>

        <Card title="Import Data" description="Upload a previously exported JSON file. Existing data is preserved; imported records are added.">
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              className="mb-2 text-sm"
              onChange={handleImport}
            />
            {importStatus && <span className="text-xs text-green-600">{importStatus}</span>}
          </div>
        </Card>

        <Card title="Reset Application" description="Clear all your user data (meals, history, settings, and tracking). Built-in foods remain.">
          {!confirmReset ? (
            <Button
              variant="outline"
              size="sm"
              className="text-red-600"
              onClick={() => setConfirmReset(true)}
            >
              Reset All Data
            </Button>
          ) : (
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" onClick={() => setConfirmReset(false)}>
                Cancel
              </Button>
              <Button variant="danger" size="sm" onClick={handleReset}>
                Confirm Reset
              </Button>
            </div>
          )}
        </Card>
      </div>
    </PageContainer>
  )
}
