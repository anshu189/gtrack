import { useState, useEffect, useRef } from 'react'
import type { UserSettings } from '@/types'
import { useSettingsStore } from '@/stores/settingsStore'
import { firestore } from '@/lib/firebase'
import { getDocs, setDoc, writeBatch } from 'firebase/firestore'
import { userColl, userDoc } from '@/lib/paths'
import { useAuthStore } from '@/stores/authStore'
import { cleanForFirestore } from '@/lib/utils/firestore'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { TextField } from '@/components/ds'

const DEFAULT_SETTINGS: UserSettings = {
  id: 'settings:default',
  unitSystem: 'metric',
  theme: 'light',
  nutritionTargets: { calories: 3300, protein: 120, carbs: 420, fat: 95, fiber: 35 },
  waterGoalMl: 2000,
}

/**
 * Collections included in export / import — everything the signed-in user owns
 * except deletedMeals, which is a 24h undo buffer and not worth restoring.
 * `foods` is per user now, so custom foods and macro tweaks are backed up too.
 */
const BACKUP_COLLECTIONS = [
  'meals', 'history', 'favorites', 'workouts', 'waterLogs', 'weights',
  'dailyNotes', 'tretinoinLogs', 'foods', 'categories', 'quantityPresets',
  'nutritionSources',
] as const

/** Typed-confirmation phrase for the destructive reset, in place of a shared password. */
const RESET_CONFIRM_PHRASE = 'delete my data'

/** Collections wiped by Reset. Reference data (foods, categories, presets, sources) is spared. */
const RESET_COLLECTIONS = [
  'meals', 'history', 'favorites', 'workouts', 'waterLogs', 'weights',
  'dailyNotes', 'tretinoinLogs', 'settings', 'deletedMeals',
] as const

export default function Settings() {
  const settingsStore = useSettingsStore()
  const authUser = useAuthStore((s) => s.user)
  const authLoading = useAuthStore((s) => s.loading)
  const handleSignOut = useAuthStore((s) => s.signOut)
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
  const [resetConfirmText, setResetConfirmText] = useState('')
  const [resetting, setResetting] = useState(false)
  const [resetError, setResetError] = useState<string | null>(null)
  const resetPhraseMatches = resetConfirmText.trim() === RESET_CONFIRM_PHRASE
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
      const entries: Record<string, any[]> = {}
      for (const name of BACKUP_COLLECTIONS) {
        const snap = await getDocs(userColl(name))
        entries[name] = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
      }
      const data = {
        exportedAt: new Date().toISOString(),
        version: '1.0.0',
        settings: settingsStore.settings ?? null,
        ...entries,
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

      const now = new Date().toISOString()
      if (data.settings) {
        await setDoc(userDoc('settings', data.settings.id ?? 'settings:default'), { ...data.settings, updatedAt: now })
      }

      for (const name of BACKUP_COLLECTIONS) {
        const items = data[name]
        if (!items?.length) continue
        let batch = writeBatch(firestore)
        let count = 0
        for (const item of items) {
          batch.set(userDoc(name, item.id ?? `${name}:${Date.now()}-${count}`), cleanForFirestore(item))
          count++
          if (count >= 490) {
            await batch.commit()
            batch = writeBatch(firestore)
            count = 0
          }
        }
        if (count > 0) await batch.commit()
      }

      setImportStatus('Import complete')
      settingsStore.load()
    } catch {
      setImportStatus('Import failed: invalid file')
    }
    if (fileInputRef.current) fileInputRef.current.value = ''
    setTimeout(() => setImportStatus(null), 3000)
  }

  const handleReset = async () => {
    if (!resetPhraseMatches) return

    setResetting(true)
    setResetError(null)
    try {
      for (const name of RESET_COLLECTIONS) {
        const snap = await getDocs(userColl(name))
        if (snap.empty) continue
        let batch = writeBatch(firestore)
        let count = 0
        for (const d of snap.docs) {
          batch.delete(d.ref)
          count++
          if (count >= 490) {
            await batch.commit()
            batch = writeBatch(firestore)
            count = 0
          }
        }
        if (count > 0) await batch.commit()
      }

      setCalories(DEFAULT_SETTINGS.nutritionTargets!.calories!)
      setProtein(DEFAULT_SETTINGS.nutritionTargets!.protein!)
      setCarbs(DEFAULT_SETTINGS.nutritionTargets!.carbs!)
      setFat(DEFAULT_SETTINGS.nutritionTargets!.fat!)
      setFiber(DEFAULT_SETTINGS.nutritionTargets!.fiber!)
      setWaterGoal(DEFAULT_SETTINGS.waterGoalMl!)
      setTheme('light')

      setConfirmReset(false)
      setResetConfirmText('')
    } catch (e: any) {
      setResetError(e?.message ?? 'Reset failed. Please try again.')
    } finally {
      setResetting(false)
    }
  }

  const cancelReset = () => {
    setConfirmReset(false)
    setResetConfirmText('')
    setResetError(null)
  }

  return (
    <>
      <div className="mb-5">
        <h1 className="title-1 text-black">Settings</h1>
      </div>

      <div className="space-y-6">
        <Card title="Account">
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1">
              {authUser?.displayName && (
                <p className="text-base font-semibold text-black">
                  {authUser.displayName}
                </p>
              )}
              <p className="text-base text-ink-2">
                {authUser?.email ?? '—'}
              </p>
            </div>
            <div>
              <Button variant="outline" size="sm" onClick={handleSignOut} disabled={authLoading}>
                Sign out
              </Button>
            </div>
          </div>
        </Card>

        <Card title="Nutrition targets">
          <div className="grid grid-cols-2 gap-4">
            <TextField
              label="Calories (kcal)"
              type="number"
              inputMode="numeric"
              min={0}
              step={50}
              value={String(calories)}
              onChange={(e) => setCalories(Number(e.target.value) || 0)}
            />
            <TextField
              label="Protein (g)"
              type="number"
              inputMode="numeric"
              min={0}
              step={5}
              value={String(protein)}
              onChange={(e) => setProtein(Number(e.target.value) || 0)}
            />
            <TextField
              label="Carbs (g)"
              type="number"
              inputMode="numeric"
              min={0}
              step={5}
              value={String(carbs)}
              onChange={(e) => setCarbs(Number(e.target.value) || 0)}
            />
            <TextField
              label="Fat (g)"
              type="number"
              inputMode="numeric"
              min={0}
              step={5}
              value={String(fat)}
              onChange={(e) => setFat(Number(e.target.value) || 0)}
            />
            <TextField
              label="Fiber (g)"
              type="number"
              inputMode="numeric"
              min={0}
              step={1}
              value={String(fiber)}
              onChange={(e) => setFiber(Number(e.target.value) || 0)}
            />
          </div>
        </Card>

        <Card title="Water goal">
          <TextField
              label="Daily target (ml)"
              type="number"
              inputMode="numeric"
              min={0}
              step={100}
              value={String(waterGoal)}
              onChange={(e) => setWaterGoal(Number(e.target.value) || 0)}
            />
        </Card>


        <div className="flex items-center gap-3">
          <Button onClick={handleSave} disabled={saving}>
            {saving ? 'Saving…' : saved ? 'Saved' : 'Save settings'}
          </Button>
        </div>

        <Card title="Export data" description="Download all your data as a JSON file.">
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={handleExport}>
              Export
            </Button>
            {exportStatus && <span className="text-xs text-success">{exportStatus}</span>}
          </div>
        </Card>

        <Card title="Import data" description="Upload a previously exported JSON file. Existing data is preserved; imported records are added.">
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              className="w-full cursor-pointer footnote text-ink-2 file:mr-3 file:cursor-pointer file:rounded-pill file:border-0 file:bg-surface-2 file:px-4 file:py-2 file:btn-label file:text-black hover:file:bg-fill-strong"
              onChange={handleImport}
            />
            {importStatus && <span className="text-xs text-success">{importStatus}</span>}
          </div>
        </Card>

        <Card title="Reset app data" description="Clear all your user data (meals, history, settings, and tracking). Built-in foods remain.">
          {!confirmReset ? (
            <Button
              variant="outline"
              size="sm"
              className="text-protein"
              onClick={() => setConfirmReset(true)}
            >
              Reset All Data
            </Button>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-ink-2">
                This permanently deletes your meals, history, tracking and settings. Your foods,
                categories and presets are kept. This cannot be undone.
              </p>
              <p className="text-sm text-black">
                To confirm, type <span className="font-semibold">{RESET_CONFIRM_PHRASE}</span> below.
              </p>
              <TextField
                label={`Type"${RESET_CONFIRM_PHRASE}" to confirm`}
                isLabelHidden
                value={resetConfirmText}
                onChange={(e) => {
                  setResetConfirmText(e.target.value)
                  setResetError(null)
                }}
                placeholder={RESET_CONFIRM_PHRASE}
                disabled={resetting}
              />
              {resetError && <p className="text-xs text-protein">{resetError}</p>}
              <div className="flex items-center gap-3">
                <Button variant="outline" size="sm" onClick={cancelReset} disabled={resetting}>
                  Cancel
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={handleReset}
                  disabled={!resetPhraseMatches || resetting}
                >
                  {resetting ? 'Deleting...' : 'Delete my data'}
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </>
  )
}
