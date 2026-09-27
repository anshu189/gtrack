import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDailyNutritionProgress } from '@/hooks/useNutrition'
import { useMealStore } from '@/stores/mealStore'
import { useWorkoutStore } from '@/stores/workoutStore'
import { useWaterStore } from '@/stores/waterStore'
import { useWeightStore } from '@/stores/weightStore'
import { useDailyNoteStore } from '@/stores/dailyNoteStore'
import { useTretinoinStore } from '@/stores/tretinoinStore'
import { useSettingsStore } from '@/stores/settingsStore'

import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button, Card, Chip, DatePicker, IconButton, ProgressBar, ProgressRing } from '@/components/ds'
import {
  WorkoutCard,
  WorkoutLogging,
  WorkoutHistory,
  WaterLogging,
  WaterProgress,
  WeightLogging,
  WeightHistory,
  DailyNoteEditor,
  TretinoinTracker,
} from '@/components/tracking'
import { foodRepository } from '@/lib/repositories/foodRepository'
import { mealItemGrams } from '@/lib/utils/nutrition'
import { getLastAppliedDate, isScheduledNight } from '@/lib/utils/tretinoin'
import type { DailyNote, WaterLog, WeightEntry, WorkoutType } from '@/types'

const DEFAULT_WATER_GOAL_ML = 2000

function getTodayIso() {
  return new Date().toISOString().split('T')[0]
}

const Dashboard = () => {
  const navigate = useNavigate()
  const [selectedDate, setSelectedDate] = useState(getTodayIso())
  const mealStore = useMealStore()
  const workoutStore = useWorkoutStore()
  const waterStore = useWaterStore()
  const weightStore = useWeightStore()
  const dailyNoteStore = useDailyNoteStore()
  const tretinoinStore = useTretinoinStore()
  const settingsStore = useSettingsStore()
  const { status: dailyStatus } = useDailyNutritionProgress(selectedDate)

  const waterGoal = settingsStore.settings?.waterGoalMl ?? DEFAULT_WATER_GOAL_ML

  const today = getTodayIso()
  const isToday = selectedDate === today

  const errors = [
    mealStore.error,
    workoutStore.error,
    waterStore.error,
    weightStore.error,
    dailyNoteStore.error,
    tretinoinStore.error,
    settingsStore.error,
  ].filter(Boolean) as string[]

  useEffect(() => {
    mealStore.loadByDateRange(`${selectedDate}T00:00:00Z`, `${selectedDate}T23:59:59Z`)
    workoutStore.loadToday(selectedDate)
    workoutStore.loadRecent(7)
    waterStore.loadByDate(selectedDate)
    weightStore.loadToday(selectedDate)
    weightStore.loadRecent(7)
    dailyNoteStore.loadByDate(selectedDate)
    tretinoinStore.loadByDate(selectedDate)
    tretinoinStore.loadAll()
    settingsStore.load()
  }, [selectedDate])

  const handlePreviousDay = () => {
    const prev = new Date(selectedDate)
    prev.setDate(prev.getDate() - 1)
    setSelectedDate(prev.toISOString().split('T')[0])
  }

  const handleNextDay = () => {
    const next = new Date(selectedDate)
    next.setDate(next.getDate() + 1)
    setSelectedDate(next.toISOString().split('T')[0])
  }

  const handleToday = () => {
    setSelectedDate(getTodayIso())
  }

  /**
   * The selected workout used to come straight from the store, so the pill did
   * not move until the Firestore write came back — a visible lag on every tap.
   * The choice now applies immediately and the store catches up behind it.
   */
  const [optimisticWorkout, setOptimisticWorkout] = useState<WorkoutType | null>(null)

  const handleWorkoutSelect = (type: WorkoutType) => {
    setOptimisticWorkout(type)
    workoutStore.setWorkoutType(selectedDate, type)
  }

  // Drop the optimistic value once the store agrees, or when the day changes.
  useEffect(() => {
    if (optimisticWorkout && workoutStore.todayWorkout?.type === optimisticWorkout) {
      setOptimisticWorkout(null)
    }
  }, [workoutStore.todayWorkout?.type, optimisticWorkout])

  useEffect(() => {
    setOptimisticWorkout(null)
  }, [selectedDate])

  const activeWorkout = optimisticWorkout ?? workoutStore.todayWorkout?.type

  const handleAddWater = async (log: Partial<WaterLog>) => {
    const now = new Date().toISOString()
    await waterStore.add({
      id: `water:${Date.now()}`,
      date: selectedDate,
      amount: log.amount ?? 250,
      unit: log.unit ?? 'ml',
      timestamp: now,
      createdAt: now,
    })
  }

  const handleSaveWeight = async (entry: WeightEntry) => {
    await weightStore.upsert(entry)
  }

  const handleSaveNote = useCallback(async (note: DailyNote) => {
    await useDailyNoteStore.getState().save(note)
  }, [])

  const handleTretinoinToggle = async (applied: boolean) => {
    await tretinoinStore.setApplied(selectedDate, applied)
  }

  const [pendingWeight, setPendingWeight] = useState(weightStore.todayEntry?.weight ?? 0)
  const [pendingWeightUnit, setPendingWeightUnit] = useState<WeightEntry['unit']>(weightStore.todayEntry?.unit ?? 'kg')
  const [pendingWeightNotes, setPendingWeightNotes] = useState(weightStore.todayEntry?.notes ?? '')
  const [expandedMeals, setExpandedMeals] = useState<Set<string>>(new Set())
  const [resolvedFoodNames, setResolvedFoodNames] = useState<Record<string, string>>({})

  /**
   * Weight used to sit in local state until"Submit daily log" flushed it,
   * while every other tracker on this screen wrote through on interaction —
   * two save models on one screen, and no way to tell which applied.
   * It now auto-saves like the rest.
   *
   * Hydrate the inputs whenever the stored entry for the selected day changes.
   */
  useEffect(() => {
    setPendingWeight(weightStore.todayEntry?.weight ?? 0)
    setPendingWeightUnit(weightStore.todayEntry?.unit ?? 'kg')
    setPendingWeightNotes(weightStore.todayEntry?.notes ?? '')
  }, [weightStore.todayEntry, selectedDate])

  /** The write the debounce has not performed yet, so it can be flushed. */
  const pendingWeightWrite = useRef<WeightEntry | null>(null)

  /**
   * Debounced write. 600ms so typing"77.5" is one write, not four, and the
   * equality check means hydrating the inputs above never writes anything back.
   */
  useEffect(() => {
    if (pendingWeight <= 0) {
      pendingWeightWrite.current = null
      return
    }

    const stored = weightStore.todayEntry
    const unchanged =
      stored &&
      stored.weight === pendingWeight &&
      stored.unit === pendingWeightUnit &&
      (stored.notes ?? '') === pendingWeightNotes
    if (unchanged) {
      pendingWeightWrite.current = null
      return
    }

    const now = new Date().toISOString()
    const entry: WeightEntry = {
      id: stored?.id ?? `weight:${selectedDate}`,
      date: selectedDate,
      weight: pendingWeight,
      unit: pendingWeightUnit,
      notes: pendingWeightNotes.trim() || undefined,
      createdAt: stored?.createdAt ?? now,
      updatedAt: now,
    }
    pendingWeightWrite.current = entry

    const timer = setTimeout(() => {
      weightStore.upsert(entry)
      pendingWeightWrite.current = null
    }, 600)

    return () => clearTimeout(timer)
  }, [pendingWeight, pendingWeightUnit, pendingWeightNotes, selectedDate])

  /**
   * Flush on the way out. Changing day or leaving the screen inside the 600ms
   * window would otherwise drop the write. The ref still holds the entry for
   * the day being left, so the value lands on the right date.
   */
  useEffect(
    () => () => {
      const entry = pendingWeightWrite.current
      if (!entry) return
      pendingWeightWrite.current = null
      weightStore.upsert(entry)
    },
    [selectedDate],
  )

  const toggleMealExpand = (mealId: string) => {
    setExpandedMeals((prev) => {
      const next = new Set(prev)
      if (next.has(mealId)) next.delete(mealId)
      else next.add(mealId)
      return next
    })
  }

  useEffect(() => {
    const allItems = mealStore.meals.flatMap((m) => m.items ?? [])
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
  }, [mealStore.meals])

  const totalCal = dailyStatus?.actual.calories ?? 0
  const totalP = dailyStatus?.actual.protein ?? 0
  const totalC = dailyStatus?.actual.carbs ?? 0
  const totalF = dailyStatus?.actual.fat ?? 0
  const goalCal = dailyStatus?.target?.calories ?? 2000
  const goalP = dailyStatus?.target?.protein ?? 150
  const goalC = dailyStatus?.target?.carbs ?? 250
  const goalF = dailyStatus?.target?.fat ?? 65

  const calPct = dailyStatus?.percentage?.calories ?? Math.min(100, Math.round((totalCal / goalCal) * 100))
  const pPct = dailyStatus?.percentage?.protein ?? Math.min(100, Math.round((totalP / goalP) * 100))
  const cPct = dailyStatus?.percentage?.carbs ?? Math.min(100, Math.round((totalC / goalC) * 100))
  const fPct = dailyStatus?.percentage?.fat ?? Math.min(100, Math.round((totalF / goalF) * 100))

  /**
   * Status is a word, not a colour: the ring beside it already carries the
   * macro's colour, and the DS forbids colour as the only signal. The old
   * gothic status hexes went with it.
   */
  const getNutrientStatus = (pct: number): { label: string } => {
    if (pct >= 80) return { label: 'Good' }
    if (pct >= 50) return { label: 'Moderate' }
    if (pct >= 20) return { label: 'Low' }
    return { label: 'Under' }
  }

  const macros = [
    { key: 'calories', label: 'Calories', actual: totalCal, goal: goalCal, pct: calPct, unit: 'kcal', color: 'var(--ink)' },
    { key: 'protein', label: 'Protein', actual: totalP, goal: goalP, pct: pPct, unit: 'g', color: 'var(--protein)' },
    { key: 'carbs', label: 'Carbs', actual: totalC, goal: goalC, pct: cPct, unit: 'g', color: 'var(--carbs)' },
    { key: 'fat', label: 'Fat', actual: totalF, goal: goalF, pct: fPct, unit: 'g', color: 'var(--fat)' },
  ]

  return (
    <>
      {/* Title + date picker */}
      <div className="mb-5 flex items-center justify-between gap-4">
        <h1 className="title-1 text-black">Dashboard</h1>
        <DatePicker
          label="Select date"
          value={selectedDate}
          onChange={setSelectedDate}
          max={today}
        />
      </div>

      {/* Day navigation. Arrows rather than worded buttons: three equal pills
          cannot hold"Previous day" at this column width without wrapping. */}
      <div className="mb-8 flex items-center gap-2">
        <IconButton
          label="Previous day"
          icon={<ChevronLeft size={20} />}
          onClick={handlePreviousDay}
        />
        <Button variant="primary" size="md" className="h-10 flex-1" onClick={handleToday}>
          Today
        </Button>
        <IconButton
          label="Next day"
          icon={<ChevronRight size={20} />}
          onClick={handleNextDay}
          disabled={isToday}
          className="disabled:bg-surface-2 disabled:opacity-40"
        />
      </div>

      {errors.length > 0 && (
        <Card className="mb-6">
          <div className="flex flex-col gap-1">
            {errors.map((err, i) => (
              <p key={i} className="flex items-start gap-2 footnote text-black">
                <span aria-hidden="true" className="mt-1 size-2 shrink-0 rounded-pill bg-protein" />
                {err}
              </p>
            ))}
          </div>
        </Card>
      )}

      <div className="flex flex-col gap-3">
        {/* Daily summary */}
        <Card>
          <div className="mb-4">
            <p className="title-2 text-black">Daily summary</p>
            <p className="footnote text-ink-2">Overview of today's activity</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Meals', value: `${mealStore.meals.length}`, suffix: '' },
              { label: 'Calories', value: `${Math.round(totalCal)}`, suffix: 'kcal' },
              { label: 'Workout', value: workoutStore.todayWorkout?.type ?? 'Rest', suffix: '' },
              { label: 'Water', value: `${waterStore.totalToday}`, suffix: `/ ${waterGoal} ml` },
            ].map((tile) => (
              <div key={tile.label} className="rounded-md bg-surface-2 p-4">
                <p className="stat-md text-black">
                  {/* capitalize only the value — it would otherwise turn the
                      units into"Kcal" and"MI". */}
                  <span className="capitalize">{tile.value}</span>
                  {tile.suffix && <span className="label-text text-ink-2"> {tile.suffix}</span>}
                </p>
                <p className="caption text-ink-2">{tile.label}</p>
              </div>
            ))}
          </div>
        </Card>

        {/* Nutrition */}
        <Card>
          <p className="title-2 mb-4 text-black">Nutrition</p>

          {/* Rings: the DS's signature data mark. Each prints its own label, so
              colour is never the only thing carrying meaning. */}
          <div className="mb-6 grid grid-cols-4 gap-3">
            {macros.map((m) => (
              <div key={m.key} className="flex flex-col items-center gap-2">
                <ProgressRing
                  value={m.actual}
                  max={m.goal}
                  size={68}
                  stroke={6}
                  color={m.color}
                  label={`${m.label}: ${Math.round(m.pct)}% of goal`}
                >
                  <span className="footnote text-black">{Math.round(m.pct)}%</span>
                </ProgressRing>
                <p className="caption text-ink-2">{m.label}</p>
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-4">
            {macros.map((m) => (
              <div key={m.key} className="flex flex-col gap-1.5">
                <div className="flex items-baseline justify-between">
                  <span className="footnote text-black">{m.label}</span>
                  {/* Gtrak DS number rules: integers for calories, grams
                      attached to the figure ("184g"). */}
                  <span className="label-text text-ink-2">
                    {m.unit === 'g'
                      ? `${Math.round(m.actual)} / ${Math.round(m.goal)}g`
                      : `${Math.round(m.actual)} / ${Math.round(m.goal)} kcal`}
                  </span>
                </div>
                <ProgressBar label={m.label} value={m.actual} max={m.goal} color={m.color} />
                <span className="caption text-ink-2">{getNutrientStatus(m.pct).label}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Today's Meals */}
        <Card>
          <p className="title-2 mb-4 text-black">Today's meals</p>
          <div className="flex flex-col gap-2">
            {mealStore.meals.length === 0 ? (
              <p className="text-sm text-ink-2">No meals logged for this day</p>
            ) : (
              mealStore.meals.map((meal) => {
                const expanded = expandedMeals.has(meal.id)
                const mealCalories = meal.items?.reduce((sum, item) => {
                  const multiplier = mealItemGrams(item) / 100
                  return sum + (item.nutrition?.calories ?? 0) * multiplier
                }, 0) ?? 0
                return (
                  <div key={meal.id} className="rounded-md bg-surface-2 overflow-hidden">
                    <button
                      type="button"
                      onClick={() => toggleMealExpand(meal.id)}
                      className="flex w-full items-center justify-between px-3 py-2.5 text-left"
                    >
                      <span className="text-sm font-medium text-black">{meal.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-ink-2">{Math.round(mealCalories)} kcal</span>
                        <span className="text-sm text-ink-2">{expanded ? '▲' : '▼'}</span>
                      </div>
                    </button>
                    {expanded && meal.items && meal.items.length > 0 && (
                      <div className="border-t border-line px-3 pb-3 pt-2">
                        <div className="flex flex-col gap-2">
                          {meal.items.map((it) => {
                            const displayName = it.name ?? resolvedFoodNames[it.foodId] ?? it.foodId.split(':').pop()
                            const multiplier = mealItemGrams(it) / 100
                            const n = it.nutrition
                            return (
                              <div key={it.id} className="flex items-center justify-between text-xs py-0.5">
                                <span className="text-[11px] text-black">{displayName}</span>
                                <div className="flex items-center gap-3">
                                  <span className="text-[11px] text-ink-2">{it.quantity} {it.unit}</span>
                                  <span className="text-[11px] text-ink-2">{n ? Math.round(n.calories * multiplier) : '0'}<span className="text-black"> kcal</span></span>
                                  <span className="text-[11px] text-ink-2">{n ? Math.round(n.protein * multiplier) : '0'}g <span className="text-black"> P</span></span>
                                  <span className="text-[11px] text-ink-2">{n ? Math.round(n.carbs * multiplier) : '0'}g <span className="text-black"> C</span></span>
                                  <span className="text-[11px] text-ink-2">{n ? Math.round(n.fat * multiplier) : '0'}g <span className="text-black"> F</span></span>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )
              })
            )}
            <Button
              variant="secondary"
              size="md"
              onClick={() => navigate('/meals', { state: { date: selectedDate } })}
            >
              Add meal
            </Button>
          </div>
        </Card>

        {/* Workout */}
        <Card>
          <p className="title-2 mb-4 text-black">Workout</p>
          <WorkoutLogging
            selectedType={activeWorkout}
            onSelect={handleWorkoutSelect}
          />
          {workoutStore.todayWorkout && (
            <div className="mt-4">
              <WorkoutCard workout={workoutStore.todayWorkout} />
            </div>
          )}
          <div className="mt-4">
            <p className="text-sm font-semibold text-ink-2 mb-2">Recent workouts</p>
            <WorkoutHistory workouts={workoutStore.recentWorkouts} excludeDate={selectedDate} />
          </div>
        </Card>

        {/* Water Intake */}
        <Card>
          <p className="text-sm font-semibold text-black mb-3">Water intake</p>
          <WaterLogging key={`water-${selectedDate}`} onAdd={handleAddWater} />
          <div className="mt-4">
            <WaterProgress current={waterStore.totalToday} goal={waterGoal} unit="ml" />
          </div>
          {waterStore.waterLogs.length > 0 && (
            <div className="flex gap-1.5 mt-3 flex-wrap">
              {waterStore.waterLogs.map((log) => (
                <Chip key={log.id} variant="water">{log.amount} {log.unit}</Chip>
              ))}
            </div>
          )}
        </Card>

        {/* Tretinoin — only on scheduled nights. The card used to render its
            heading with nothing under it on off-nights; now it stays away. */}
        {(() => {
          const lastApplied = getLastAppliedDate(tretinoinStore.logs)
          const scheduled = isScheduledNight(selectedDate, lastApplied)
          if (!scheduled && lastApplied) return null
          return (
            <Card>
              <p className="title-2 mb-2 text-black">Tretinoin</p>
              <TretinoinTracker todayLog={tretinoinStore.todayLog} onToggle={handleTretinoinToggle} />
            </Card>
          )
        })()}

        {/* Weight */}
        <Card>
          <p className="title-2 mb-4 text-black">Weight</p>
          <WeightLogging
            todayEntry={weightStore.todayEntry}
            date={selectedDate}
            onSave={handleSaveWeight}
            showButton={false}
            showNotePresets
            showWheel
            weight={pendingWeight}
            unit={pendingWeightUnit}
            notes={pendingWeightNotes}
            onWeightChange={setPendingWeight}
            onUnitChange={setPendingWeightUnit}
            onNotesChange={setPendingWeightNotes}
          />
          <div className="mt-6">
            <p className="text-sm font-semibold text-ink-2 mb-2">Weight history</p>
            <WeightHistory entries={weightStore.recentEntries} excludeDate={selectedDate} />
          </div>
        </Card>

        {/* Daily Notes */}
        <Card>
          <p className="title-2 mb-4 text-black">Daily notes</p>
          <DailyNoteEditor key={`note-${selectedDate}`} date={selectedDate} note={dailyNoteStore.note} onSave={handleSaveNote} />
        </Card>
      </div>
    </>
  )
}

export default Dashboard
