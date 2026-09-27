import { useState, useEffect, useRef } from 'react'
import type { UserSettings } from '@/types'
import { useSettingsStore } from '@/stores/settingsStore'
import { firestore } from '@/lib/firebase'
import { getDocs, setDoc, writeBatch } from 'firebase/firestore'
import { userColl, userDoc } from '@/lib/paths'
import { useAuthStore } from '@/stores/authStore'
import { cleanForFirestore } from '@/lib/utils/firestore'
import { PageContainer } from '@/components/ui/page-container'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { NumberInput, TextInput } from '@astryxdesign/core'

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
    <PageContainer>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-950 dark:text-[#FDFDFD]">Settings</h1>
      </div>

      <div className="space-y-6">
        <Card title="Account">
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1">
              {authUser?.displayName && (
                <p className="text-base font-semibold text-slate-950 dark:text-[var(--color-text)]">
                  {authUser.displayName}
                </p>
              )}
              <p className="text-base text-slate-500 dark:text-[var(--color-muted)]">
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

        <Card title="Nutrition Targets">
          <div className="grid grid-cols-2 gap-4">
            <NumberInput
              label="Calories (kcal)"
              value={calories}
              onChange={(v) => setCalories(v)}
              min={0}
              step={50}
              size="sm"
            />
            <NumberInput
              label="Protein (g)"
              value={protein}
              onChange={(v) => setProtein(v)}
              min={0}
              step={5}
              size="sm"
            />
            <NumberInput
              label="Carbs (g)"
              value={carbs}
              onChange={(v) => setCarbs(v)}
              min={0}
              step={5}
              size="sm"
            />
            <NumberInput
              label="Fat (g)"
              value={fat}
              onChange={(v) => setFat(v)}
              min={0}
              step={5}
              size="sm"
            />
            <NumberInput
              label="Fiber (g)"
              value={fiber}
              onChange={(v) => setFiber(v)}
              min={0}
              step={1}
              size="sm"
            />
          </div>
        </Card>

        <Card title="Water Goal">
          <NumberInput
            label="Daily target (ml)"
            value={waterGoal}
            onChange={(v) => setWaterGoal(v)}
            min={0}
            step={100}
            size="sm"
          />
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
              className="mb-2 text-sm dark:text-[#FDFDFD] dark:border dark:border-slate-600 p-1"
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
              className="text-red-600 dark:bg-red-400 dark:border-red-400 dark:border dark:font-bold"
              onClick={() => setConfirmReset(true)}
            >
              Reset All Data
            </Button>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-slate-600 dark:text-[var(--color-muted)]">
                This permanently deletes your meals, history, tracking and settings. Your foods,
                categories and presets are kept. This cannot be undone.
              </p>
              <p className="text-sm text-slate-950 dark:text-[var(--color-text)]">
                To confirm, type <span className="font-semibold">{RESET_CONFIRM_PHRASE}</span> below.
              </p>
              <TextInput
                label={`Type "${RESET_CONFIRM_PHRASE}" to confirm`}
                isLabelHidden
                value={resetConfirmText}
                onChange={(v) => { setResetConfirmText(v); setResetError(null) }}
                placeholder={RESET_CONFIRM_PHRASE}
                size="lg"
                width="100%"
                isDisabled={resetting}
                className="rounded-lg"
              />
              {resetError && <p className="text-xs text-red-400">{resetError}</p>}
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
    </PageContainer>
  )
}
