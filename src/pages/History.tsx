import { useState, useEffect } from 'react'
import type { Meal, WaterLog, WeightEntry, DailyNote, WorkoutType } from '@/types'
import { mealRepository } from '@/lib/repositories/mealRepository'
import { workoutRepository } from '@/lib/repositories/workoutRepository'
import { waterRepository } from '@/lib/repositories/waterRepository'
import { weightRepository } from '@/lib/repositories/weightRepository'
import { dailyNoteRepository } from '@/lib/repositories/dailyNoteRepository'
import { tretinoinRepository } from '@/lib/repositories/tretinoinRepository'
import { foodRepository } from '@/lib/repositories/foodRepository'
import { nutritionCalculationService } from '@/lib/services/nutritionCalculation'
import { useDailyNutritionProgress } from '@/hooks/useNutrition'
import { useSettingsStore } from '@/stores/settingsStore'
import { useMealStore } from '@/stores/mealStore'
import { NutritionSummary } from '@/components/nutrition'
import { WorkoutLogging } from '@/components/tracking'
import { WaterLogging, WaterProgress } from '@/components/tracking'
import { WeightLogging } from '@/components/tracking'
import { TretinoinTracker } from '@/components/tracking'
import { UndoBanner } from '@/components/meal'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { DatePicker, IconButton } from '@/components/ds'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatNum } from '@/lib/utils/format'
import { mealItemGrams } from '@/lib/utils/nutrition'
import type { TretinoinLog } from '@/types'

const DEFAULT_WATER_GOAL_ML = 2000

function getTodayIso() {
  return new Date().toISOString().split('T')[0]
}

export default function History() {
  const [selectedDate, setSelectedDate] = useState(getTodayIso())
  const [meals, setMeals] = useState<Meal[]>([])
  const [workout, setWorkout] = useState<WorkoutType | null>(null)
  const [waterLogs, setWaterLogs] = useState<WaterLog[]>([])
  const [waterTotal, setWaterTotal] = useState(0)
  const [weightEntry, setWeightEntry] = useState<WeightEntry | undefined>()
  const [dailyNote, setDailyNote] = useState<DailyNote | undefined>()
  const [tretinoinLogs, setTretinoinLogs] = useState<TretinoinLog[]>([])
  const [loading, setLoading] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const [editing, setEditing] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  const [editWorkout, setEditWorkout] = useState<WorkoutType | null>(null)
  const [editWeight, setEditWeight] = useState(0)
  const [editWeightUnit, setEditWeightUnit] = useState<WeightEntry['unit']>('kg')
  const [editWeightNotes, setEditWeightNotes] = useState('')
  const [editNoteContent, setEditNoteContent] = useState('')
  const [waterChanged, setWaterChanged] = useState(false)
  const [expandedMeals, setExpandedMeals] = useState<Set<string>>(new Set())
  const [resolvedFoodNames, setResolvedFoodNames] = useState<Record<string, string>>({})

  const settingsStore = useSettingsStore()
  const mealStore = useMealStore()
  const waterGoal = settingsStore.settings?.waterGoalMl ?? DEFAULT_WATER_GOAL_ML
  const [dismissedUndoIds, setDismissedUndoIds] = useState<Set<string>>(new Set())

  const { status: dailyStatus } = useDailyNutritionProgress(selectedDate)

  useEffect(() => {
    settingsStore.load()
  }, [])

  useEffect(() => {
    loadDateData(selectedDate)
  }, [selectedDate])

  async function loadDateData(dateIso: string) {
    setLoading(true)
    try {
      const dayStart = dateIso.split('T')[0]
      const dayEnd = `${dayStart}T23:59:59.999Z`

      const [loadedMeals, loadedWorkout, loadedWaterLogs, loadedTotal, loadedWeight, loadedNote, loadedTretinoin] = await Promise.all([
        mealRepository.listByDateRange(dayStart, dayEnd),
        workoutRepository.getByDate(dayStart),
        waterRepository.listByDate(dayStart),
        waterRepository.getTotalForDate(dayStart),
        weightRepository.getByDate(dayStart),
        dailyNoteRepository.getByDate(dayStart),
        tretinoinRepository.listByDate(dayStart),
      ])

      setMeals(loadedMeals)
      setWorkout(loadedWorkout?.type ?? null)
      setWaterLogs(loadedWaterLogs)
      setWaterTotal(loadedTotal)
      setWeightEntry(loadedWeight)
      setDailyNote(loadedNote)
      setTretinoinLogs(loadedTretinoin)

      mealStore.loadDeleted()
    } finally {
      setLoading(false)
    }
  }

  const handlePreviousDay = () => {
    const prev = new Date(selectedDate)
    prev.setDate(prev.getDate() - 1)
    setSelectedDate(prev.toISOString().split('T')[0])
    setEditing(false)
    setHasChanges(false)
  }

  const handleNextDay = () => {
    const next = new Date(selectedDate)
    next.setDate(next.getDate() + 1)
    setSelectedDate(next.toISOString().split('T')[0])
    setEditing(false)
    setHasChanges(false)
  }

  const handleToday = () => {
    setSelectedDate(getTodayIso())
    setEditing(false)
    setHasChanges(false)
  }

  const handleAddWater = async (log: Partial<WaterLog>) => {
    const now = new Date().toISOString()
    const entry: WaterLog = {
      id: `water:${Date.now()}`,
      date: selectedDate,
      amount: log.amount ?? 250,
      unit: log.unit ?? 'ml',
      timestamp: now,
      createdAt: now,
    }
    await waterRepository.add(entry)
    setWaterLogs((prev) => [...prev, entry])
    setWaterTotal((prev) => prev + (log.amount ?? 0))
  }

  const handleTretinoinToggleInHistory = async (applied: boolean) => {
    const now = new Date().toISOString()
    const id = `tret:${selectedDate}`
    const entry: TretinoinLog = {
      id,
      date: selectedDate,
      applied,
      timestamp: now,
      createdAt: now,
      updatedAt: now,
    }
    await tretinoinRepository.add(entry)
    setTretinoinLogs([entry])
  }

  const handleDeleteWaterLog = async (id: string) => {
    const log = waterLogs.find((w) => w.id === id)
    if (!log) return
    await waterRepository.delete(id)
    setWaterLogs((prev) => prev.filter((w) => w.id !== id))
    setWaterTotal((prev) => prev - log.amount)
    if (editing) setWaterChanged(true)
  }

  const handleSaveWeight = async (entry: WeightEntry) => {
    const saved = await weightRepository.upsert(entry)
    setWeightEntry(saved)
  }

  const handleDeleteMeal = async (mealId: string) => {
    await mealStore.removeWithUndo(mealId)
    setMeals((prev) => prev.filter((m) => m.id !== mealId))
  }

  const handleUndo = (deleteId: string) => {
    mealStore.restoreDeleted(deleteId)
    const entry = mealStore.deletedMeals.find((d) => d.id === deleteId)
    if (entry) setMeals((prev) => [...prev, entry.meal])
  }

  const handleDismissUndo = (deleteId: string) => {
    setDismissedUndoIds((prev) => new Set(prev).add(deleteId))
  }

  const handleDeleteDay = async () => {
    const dayStart = selectedDate.split('T')[0]

    await Promise.all([
      ...meals.map((m) => mealRepository.delete(m.id)),
      workout ? workoutRepository.delete(`workout:${dayStart}`) : Promise.resolve(),
      ...waterLogs.map((w) => waterRepository.delete(w.id)),
      weightEntry ? weightRepository.delete(weightEntry.id) : Promise.resolve(),
      dailyNote ? dailyNoteRepository.delete(dailyNote.id) : Promise.resolve(),
    ])

    setMeals([])
    setWorkout(null)
    setWaterLogs([])
    setWaterTotal(0)
    setWeightEntry(undefined)
    setDailyNote(undefined)
    setConfirmDelete(false)
    setEditing(false)
    setHasChanges(false)
  }

  const handleEditLog = () => {
    setEditWorkout(workout)
    setEditWeight(weightEntry?.weight ?? 0)
    setEditWeightUnit(weightEntry?.unit ?? 'kg')
    setEditWeightNotes(weightEntry?.notes ?? '')
    setEditNoteContent(dailyNote?.content ?? '')
    setWaterChanged(false)
    setEditing(true)
    setHasChanges(false)
  }

  useEffect(() => {
    if (!editing) return
    const weightChanged = editWeight !== (weightEntry?.weight ?? 0) ||
      editWeightUnit !== (weightEntry?.unit ?? 'kg') ||
      editWeightNotes !== (weightEntry?.notes ?? '')
    const workoutChanged = editWorkout !== workout
    const noteChanged = editNoteContent !== (dailyNote?.content ?? '')
    setHasChanges(weightChanged || workoutChanged || noteChanged || waterChanged)
  }, [editing, editWorkout, editWeight, editWeightUnit, editWeightNotes, editNoteContent, workout, weightEntry, dailyNote, waterChanged])

  const toggleMealExpand = (mealId: string) => {
    setExpandedMeals((prev) => {
      const next = new Set(prev)
      if (next.has(mealId)) next.delete(mealId)
      else next.add(mealId)
      return next
    })
  }

  useEffect(() => {
    const allItems = meals.flatMap((m) => m.items ?? [])
    const unresolved = allItems.filter((it) => !it.name)
    if (unresolved.length === 0) return
    let cancelled = false
    const resolve = async () => {
      const names: Record<string, string> = {}
      for (const it of unresolved) {
        if (resolvedFoodNames[it.foodId]) continue
        try {
          const food = await foodRepository.getById(it.foodId)
          if (food) names[it.foodId] = food.name
        } catch { /* skip */ }
      }
      if (!cancelled && Object.keys(names).length > 0) {
        setResolvedFoodNames((prev) => ({ ...prev, ...names }))
      }
    }
    resolve()
    return () => { cancelled = true }
  }, [meals])

  const handleUpdateLog = async () => {
    const now = new Date().toISOString()

    if (editWorkout !== workout && editWorkout) {
      const entry = {
        id: `workout:${selectedDate}`,
        date: selectedDate,
        type: editWorkout,
        createdAt: now,
        updatedAt: now,
      }
      await workoutRepository.upsert(entry)
      setWorkout(editWorkout)
    }

    if (editWeight > 0 && (editWeight !== (weightEntry?.weight ?? 0) ||
      editWeightUnit !== (weightEntry?.unit ?? 'kg') ||
      editWeightNotes !== (weightEntry?.notes ?? ''))) {
      const saved = await weightRepository.upsert({
        id: weightEntry?.id ?? `weight:${selectedDate}`,
        date: selectedDate,
        weight: editWeight,
        unit: editWeightUnit,
        notes: editWeightNotes.trim() || undefined,
        createdAt: weightEntry?.createdAt ?? now,
        updatedAt: now,
      })
      setWeightEntry(saved)
    }

    if (editNoteContent !== (dailyNote?.content ?? '')) {
      await dailyNoteRepository.upsert({
        id: dailyNote?.id ?? `note:${selectedDate}`,
        date: selectedDate,
        content: editNoteContent,
        createdAt: dailyNote?.createdAt ?? now,
        updatedAt: now,
      })
      setDailyNote((prev) => ({
        id: prev?.id ?? `note:${selectedDate}`,
        date: selectedDate,
        content: editNoteContent,
        createdAt: prev?.createdAt ?? now,
        updatedAt: now,
      }))
    }

    setEditing(false)
    setHasChanges(false)
    setWaterChanged(false)
  }

  const handleCancelEdit = async () => {
    setEditing(false)
    setHasChanges(false)
    setWaterChanged(false)
    await loadDateData(selectedDate)
  }

  const isToday = selectedDate === getTodayIso()

  function renderWorkout() {
    if (!workout) return <p className="text-base text-ink-2">No workout logged</p>
    const labels: Record<string, string> = { push: 'Push', pull: 'Pull', legs: 'Legs', rest: 'Rest' }
    return <p className="text-base text-black">{labels[workout] ?? workout}</p>
  }

  function renderWaterLogs() {
    if (waterLogs.length === 0) return <p className="text-sm text-ink-2">No water logged</p>
    return (
      <div className="flex flex-wrap gap-1">
        {waterLogs.map((log) => (
          <span key={log.id} className="border border-line bg-surface-2 px-2.5 py-1 text-sm text-ink-2">
            {log.amount} {log.unit}
          </span>
        ))}
      </div>
    )
  }

  function renderWeight() {
    if (!weightEntry || !weightEntry.weight) return <p className="text-sm text-ink-2">No weight logged</p>
    return (
      <div>
        <p className="text-base text-black">{weightEntry.weight} {weightEntry.unit}</p>
        {weightEntry.notes && (
          <p className="mt-1 text-sm text-ink-2">{weightEntry.notes}</p>
        )}
      </div>
    )
  }

  function renderNote() {
    if (!dailyNote?.content) return <p className="text-base text-ink-2">No notes</p>
    return <p className="text-base whitespace-pre-wrap text-black">{dailyNote.content}</p>
  }

  return (
    <>
      <div className="mb-5 flex items-center justify-between gap-4">
        <h1 className="title-1 text-black">History</h1>
        {!isToday && (
          <Button size="sm" variant="ghost" onClick={handleToday}>
            Back to today
          </Button>
        )}
      </div>

      <div className="mb-6 flex items-center gap-2">
        <IconButton
          label="Previous day"
          icon={<ChevronLeft size={20} />}
          onClick={handlePreviousDay}
        />
        <DatePicker
          label="Select date"
          value={selectedDate}
          onChange={(next) => {
            setSelectedDate(next)
            setEditing(false)
            setHasChanges(false)
            setWaterChanged(false)
          }}
          max={getTodayIso()}
          fullWidth
          className="flex-1"
        />
        <IconButton
          label="Next day"
          icon={<ChevronRight size={20} />}
          onClick={handleNextDay}
          disabled={isToday}
          className="disabled:bg-surface-2 disabled:opacity-40"
        />
      </div>

      {loading ? (
        <p className="py-12 text-center text-sm text-ink-2">Loading...</p>
      ) : (
        <div className="space-y-6">
          <UndoBanner
            entries={mealStore.deletedMeals}
            dismissedIds={dismissedUndoIds}
            onDismiss={handleDismissUndo}
            onUndo={handleUndo}
          />

          {dailyStatus && (
            <Card title="Nutrition">
              <NutritionSummary status={dailyStatus} />
            </Card>
          )}

          <Card title={`Meals (${meals.length})`}>
            {meals.length === 0 ? (
              <p className="text-sm text-ink-2">No meals logged for this day.</p>
            ) : (
              <div className="space-y-2">
                {meals.map((meal) => {
                  const mealNutrition = nutritionCalculationService.calculateMealNutrition(meal)
                  const expanded = expandedMeals.has(meal.id)
                  return (
                    <div key={meal.id} className="overflow-hidden rounded-md bg-surface-2">
                      <div className="flex items-center justify-between p-3">
                        <button
                          type="button"
                          onClick={() => toggleMealExpand(meal.id)}
                          className="flex-1 text-left"
                        >
                          <span className="text-sm font-medium text-black capitalize">{meal.name ?? 'Meal'}</span>
                        </button>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-ink-2">{formatNum(mealNutrition.calories)} kcal</span>
                          <button type="button" onClick={() => toggleMealExpand(meal.id)} className="text-xs text-ink-3 px-1">
                            {expanded ? '▲' : '▼'}
                          </button>
                          {editing && (
                            <Button size="sm" variant="ghost" className="text-protein text-xs" onClick={() => handleDeleteMeal(meal.id)}>
                              Delete
                            </Button>
                          )}
                        </div>
                      </div>
                      {expanded && meal.items && meal.items.length > 0 && (
                        <div className="border-t border-line px-3 pb-3 pt-2 space-y-1">
                          {meal.items.map((it) => {
                            const displayName = it.name ?? resolvedFoodNames[it.foodId] ?? it.foodId.split(':').pop()
                            const multiplier = mealItemGrams(it) / 100
                            const n = it.nutrition
                            return (
                              <div key={it.id} className="flex items-center justify-between text-xs py-1">
                                <span className="text-black">{displayName}</span>
                                <div className="flex items-center gap-3">
                                  <span className="text-ink-2">{it.quantity}{it.unit}</span>
                                  <span className="text-black">{n ? formatNum(n.calories * multiplier) : '0'} kcal</span>
                                  <span className="text-protein">{n ? formatNum(n.protein * multiplier) : '0'}g P</span>
                                  <span className="text-carbs">{n ? formatNum(n.carbs * multiplier) : '0'}g C</span>
                                  <span className="text-fat">{n ? formatNum(n.fat * multiplier) : '0'}g F</span>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </Card>

          <Card title="Workout">
            {editing ? (
              <WorkoutLogging selectedType={editWorkout ?? undefined} onSelect={setEditWorkout} />
            ) : (
              renderWorkout()
            )}
          </Card>

          <Card title="Water Intake">
            {editing ? (
              <>
                <WaterLogging onAdd={(log) => {
                  handleAddWater(log)
                }} />
                <div className="mt-4">
                  <WaterProgress current={waterTotal} goal={waterGoal} unit="ml" />
                </div>
                {waterLogs.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1">
                    {waterLogs.map((log) => (
                      <span
                        key={log.id}
                        className="inline-flex items-center gap-1.5 border border-line bg-surface-2 px-2.5 py-1 text-sm text-ink-2"
                      >
                        {log.amount} {log.unit}
                        <button
                          type="button"
                          className="text-ink-3 hover:text-protein"
                          onClick={() => handleDeleteWaterLog(log.id)}
                          aria-label="Delete water log"
                        >
                          &times;
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </>
            ) : (
              renderWaterLogs()
            )}
          </Card>

          {tretinoinLogs.length > 0 && (
            <Card title="Tretinoin">
              <TretinoinTracker
                todayLog={tretinoinLogs[0]}
                onToggle={editing ? handleTretinoinToggleInHistory : () => {}}
              />
            </Card>
          )}

          <Card title="Weight">
            {editing ? (
              <WeightLogging
                todayEntry={weightEntry}
                date={selectedDate}
                onSave={handleSaveWeight}
                showButton={false}
                weight={editWeight}
                unit={editWeightUnit}
                notes={editWeightNotes}
                onWeightChange={setEditWeight}
                onUnitChange={setEditWeightUnit}
                onNotesChange={setEditWeightNotes}
              />
            ) : (
              renderWeight()
            )}
          </Card>

          <Card title="Daily Notes">
            {editing ? (
              <textarea
                className="w-full resize-none border border-line px-3 py-2 text-sm"
                placeholder="No notes for this day."
                value={editNoteContent}
                onChange={(e) => setEditNoteContent(e.target.value)}
                rows={4}
                aria-label="Daily note"
              />
            ) : (
              renderNote()
            )}
          </Card>

          <div className="flex flex-col gap-3 pt-2">
            {editing ? (
              <div className="flex items-center gap-3">
                <Button variant="outline" className="flex-1" onClick={handleCancelEdit}>
                  Cancel
                </Button>
                <Button
                  className="flex-1"
                  onClick={handleUpdateLog}
                  disabled={!hasChanges}
                >
                  {hasChanges ? 'Save changes' : 'No changes'}
                </Button>
              </div>
            ) : (
              <Button variant="secondary" className="w-full" onClick={handleEditLog}>
                Edit Log
              </Button>
            )}

            {!confirmDelete ? (
              <Button
                variant="outline"
                className="w-full text-protein"
                onClick={() => setConfirmDelete(true)}
              >
                Delete Entire Day
              </Button>
            ) : (
              <div className="flex items-center gap-3">
                <Button variant="outline" className="flex-1" onClick={() => setConfirmDelete(false)}>
                  Cancel
                </Button>
                <Button variant="danger" className="flex-1" onClick={handleDeleteDay}>
                  Confirm Delete
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}