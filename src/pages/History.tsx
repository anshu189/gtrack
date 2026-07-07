import { useState, useEffect } from 'react'
import type { Meal, WaterLog, WeightEntry, DailyNote, WorkoutType } from '@/types'
import { mealRepository } from '@/lib/repositories/mealRepository'
import { workoutRepository } from '@/lib/repositories/workoutRepository'
import { waterRepository } from '@/lib/repositories/waterRepository'
import { weightRepository } from '@/lib/repositories/weightRepository'
import { dailyNoteRepository } from '@/lib/repositories/dailyNoteRepository'
import { nutritionCalculationService } from '@/lib/services/nutritionCalculation'
import { useDailyNutritionProgress } from '@/hooks/useNutrition'
import { useSettingsStore } from '@/stores/settingsStore'
import { NutritionSummary, MealNutritionCard } from '@/components/nutrition'
import { WorkoutLogging } from '@/components/tracking'
import { WaterLogging, WaterProgress } from '@/components/tracking'
import { WeightLogging } from '@/components/tracking'
import { PageContainer } from '@/components/ui/page-container'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

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

  const settingsStore = useSettingsStore()
  const waterGoal = settingsStore.settings?.waterGoalMl ?? DEFAULT_WATER_GOAL_ML

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

      const [loadedMeals, loadedWorkout, loadedWaterLogs, loadedTotal, loadedWeight, loadedNote] = await Promise.all([
        mealRepository.listByDateRange(dayStart, dayEnd),
        workoutRepository.getByDate(dayStart),
        waterRepository.listByDate(dayStart),
        waterRepository.getTotalForDate(dayStart),
        weightRepository.getByDate(dayStart),
        dailyNoteRepository.getByDate(dayStart),
      ])

      setMeals(loadedMeals)
      setWorkout(loadedWorkout?.type ?? null)
      setWaterLogs(loadedWaterLogs)
      setWaterTotal(loadedTotal)
      setWeightEntry(loadedWeight)
      setDailyNote(loadedNote)
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
    setWaterTotal((prev) => prev + entry.amount)
    if (editing) setWaterChanged(true)
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
    await mealRepository.delete(mealId)
    setMeals((prev) => prev.filter((m) => m.id !== mealId))
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

  const handleCancelEdit = () => {
    setEditing(false)
    setHasChanges(false)
    setWaterChanged(false)
  }

  const isToday = selectedDate === getTodayIso()

  function renderWorkout() {
    if (!workout) return <p className="text-base text-slate-500 dark:text-neutral-500">No workout logged</p>
    const labels: Record<string, string> = { push: 'Push', pull: 'Pull', legs: 'Legs', rest: 'Rest' }
    return <p className="text-base text-slate-950 dark:text-white">{labels[workout] ?? workout}</p>
  }

  function renderWaterLogs() {
    if (waterLogs.length === 0) return <p className="text-sm text-slate-500 dark:text-neutral-500">No water logged</p>
    return (
      <div className="flex flex-wrap gap-1">
        {waterLogs.map((log) => (
          <span key={log.id} className="border border-slate-200 bg-slate-50 px-2.5 py-1 text-sm text-slate-600 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-400">
            {log.amount} {log.unit}
          </span>
        ))}
      </div>
    )
  }

  function renderWeight() {
    if (!weightEntry || !weightEntry.weight) return <p className="text-sm text-slate-500 dark:text-neutral-500">No weight logged</p>
    return <p className="text-base text-slate-950 dark:text-white">{weightEntry.weight} {weightEntry.unit}</p>
  }

  function renderNote() {
    if (!dailyNote?.content) return <p className="text-base text-slate-500 dark:text-neutral-500">No notes</p>
    return <p className="text-base whitespace-pre-wrap text-slate-950 dark:text-white">{dailyNote.content}</p>
  }

  return (
    <PageContainer>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-950 dark:text-white">History</h1>
      </div>

      <div className="mb-6 flex items-center justify-between">
        <Button size="sm" variant="outline" onClick={handlePreviousDay}>
          &larr; Previous
        </Button>
        <div className="text-center">
          <button
            type="button"
            onClick={() => {
              const input = document.getElementById('history-date-picker') as HTMLInputElement
              if (input) input.showPicker?.() ?? input.click()
            }}
            className="text-sm font-medium text-slate-950 hover:text-neutral-700 dark:text-white dark:hover:text-neutral-400"
          >
            {new Date(`${selectedDate}T12:00:00`).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
          </button>
          <input
            id="history-date-picker"
            type="date"
            value={selectedDate}
            onChange={(e) => {
              setSelectedDate(e.target.value)
              setEditing(false)
              setHasChanges(false)
              setWaterChanged(false)
            }}
            className="sr-only"
          />
        </div>
        <div className="flex items-center gap-2">
          {!isToday && (
            <Button size="sm" variant="outline" onClick={handleToday}>
              Today
            </Button>
          )}
          <Button size="sm" variant="outline" onClick={handleNextDay} disabled={isToday}>
            Next &rarr;
          </Button>
        </div>
      </div>

      {loading ? (
        <p className="py-12 text-center text-sm text-slate-500 dark:text-neutral-500">Loading...</p>
      ) : (
        <div className="space-y-6">
          {dailyStatus && (
            <Card title="Nutrition">
              <NutritionSummary status={dailyStatus} />
            </Card>
          )}

          <Card title={`Meals (${meals.length})`}>
            {meals.length === 0 ? (
              <p className="text-sm text-slate-500 dark:text-neutral-500">No meals logged for this day.</p>
            ) : (
              <div className="space-y-2">
                {meals.map((meal) => {
                  const mealNutrition = nutritionCalculationService.calculateMealNutrition(meal)
                  return (
                    <div key={meal.id} className="relative">
                      <MealNutritionCard name={meal.name ?? 'Meal'} nutrition={mealNutrition} />
                      <Button size="sm" variant="ghost" className="absolute right-2 top-2 text-red-600 dark:text-red-400" onClick={() => handleDeleteMeal(meal.id)}>
                        Delete
                      </Button>
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
                        className="inline-flex items-center gap-1.5 border border-slate-200 bg-slate-50 px-2.5 py-1 text-sm text-slate-600 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-400"
                      >
                        {log.amount} {log.unit}
                        <button
                          type="button"
                          className="text-slate-400 hover:text-red-600 dark:text-neutral-500 dark:hover:text-red-400"
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
                className="w-full resize-none border border-slate-200 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900 dark:text-white"
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
                  className={`flex-1 ${hasChanges ? 'bg-black text-white hover:bg-neutral-800' : 'bg-slate-100 text-slate-950'}`}
                  onClick={handleUpdateLog}
                  disabled={!hasChanges}
                >
                  {hasChanges ? 'Update Log' : 'No Changes'}
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
                className="w-full text-red-600"
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
    </PageContainer>
  )
}