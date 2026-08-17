import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDailyNutritionProgress } from '@/hooks/useNutrition'
import { useMealStore } from '@/stores/mealStore'
import { useWorkoutStore } from '@/stores/workoutStore'
import { useWaterStore } from '@/stores/waterStore'
import { useWeightStore } from '@/stores/weightStore'
import { useDailyNoteStore } from '@/stores/dailyNoteStore'
import { useTretinoinStore } from '@/stores/tretinoinStore'
import { useRespectStore } from '@/stores/respectStore'
import { useSettingsStore } from '@/stores/settingsStore'
import {
  Card,
  Button,
  Badge,
  ProgressBar,
  Grid,
  VStack,
  Text,
  DateInput,
} from '@astryxdesign/core'
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
  RespectTracker,
} from '@/components/tracking'
import { PageContainer } from '@/components/ui/page-container'
import { foodRepository } from '@/lib/repositories/foodRepository'
import { formatNum } from '@/lib/utils/format'
import { mealItemGrams } from '@/lib/utils/nutrition'
import { getLastAppliedDate, isScheduledNight } from '@/lib/utils/tretinoin'
import type { DailyNote, RespectLog, WaterLog, WeightEntry, WorkoutType } from '@/types'

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
  const respectStore = useRespectStore()
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
    respectStore.error,
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
    respectStore.loadByDate(selectedDate)
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

  const handleWorkoutSelect = (type: WorkoutType) => {
    workoutStore.setWorkoutType(selectedDate, type)
  }

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

  const handleRespectUpsert = async (patch: Partial<RespectLog>) => {
    await respectStore.upsert({ ...patch, date: selectedDate })
  }

  const handleSubmitDay = async () => {
    if (pendingWeight > 0) {
      const now = new Date().toISOString()
      await weightStore.upsert({
        id: `weight:${selectedDate}`,
        date: selectedDate,
        weight: pendingWeight,
        unit: pendingWeightUnit,
        notes: pendingWeightNotes.trim() || undefined,
        createdAt: weightStore.todayEntry?.createdAt ?? now,
        updatedAt: now,
      })
    }
    setPendingWeight(0)
    setPendingWeightUnit('kg')
    setPendingWeightNotes('')
    weightStore.loadToday(selectedDate)
    setResetKey((k) => k + 1)
    setSubmitted(true)
    setTimeout(() => setSubmitted(false), 3000)
  }

  const [pendingWeight, setPendingWeight] = useState(weightStore.todayEntry?.weight ?? 0)
  const [pendingWeightUnit, setPendingWeightUnit] = useState<WeightEntry['unit']>(weightStore.todayEntry?.unit ?? 'kg')
  const [pendingWeightNotes, setPendingWeightNotes] = useState(weightStore.todayEntry?.notes ?? '')
  const [submitted, setSubmitted] = useState(false)
  const [resetKey, setResetKey] = useState(0)
  const [expandedMeals, setExpandedMeals] = useState<Set<string>>(new Set())
  const [resolvedFoodNames, setResolvedFoodNames] = useState<Record<string, string>>({})

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

  const getNutrientStatus = (pct: number): { label: string; color: string } => {
    if (pct >= 80) return { label: 'Good', color: '#b3c79a' }
    if (pct >= 50) return { label: 'Moderate', color: '#d3c490' }
    if (pct >= 20) return { label: 'Low', color: '#c89aab' }
    return { label: 'Under', color: '#c6a6a2' }
  }

  return (
    <PageContainer>
      {/* Dashboard title + date picker */}
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-lg font-bold text-[var(--color-text)]">Dashboard</h1>
        <DateInput
          label="Select date"
          isLabelHidden
          value={selectedDate as `${number}${number}${number}${number}-${number}${number}-${number}${number}`}
          onChange={(val) => { if (val) setSelectedDate(val) }}
          size="sm"
          className='w-30 cursor-pointer'
        />
      </div>

      {/* Day Navigation - 3 equal pill buttons */}
      <div className="flex gap-2 mb-6">
        <button
          type="button"
          onClick={handlePreviousDay}
          className="flex-1 py-2.5 px-4 rounded-lg text-sm font-medium border transition-colors
            bg-transparent border-[var(--color-border)] text-[var(--color-text)]
            hover:bg-[var(--color-surface)]"
        >
          Prev
        </button>
        <button
          type="button"
          onClick={handleToday}
          className="flex-1 py-2.5 px-4 rounded-lg text-sm font-medium border transition-colors
            bg-[var(--color-text)] text-[var(--color-bg)] border-[var(--color-text)]
            hover:opacity-90"
        >
          Today
        </button>
        <button
          type="button"
          onClick={handleNextDay}
          disabled={isToday}
          className="flex-1 py-2.5 px-4 rounded-lg text-sm font-medium border transition-colors
            bg-transparent border-[var(--color-border)] text-[var(--color-text)]
            hover:bg-[var(--color-surface)] disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>

      {/* Errors */}
      {errors.length > 0 && (
        <Card className="mb-6">
          <VStack gap={1}>
            {errors.map((err, i) => (
              <Text key={i} type="supporting">{err}</Text>
            ))}
          </VStack>
        </Card>
      )}

      <VStack gap={4}>
        {/* Daily Summary */}
        <Card>
          <div className="mb-3">
            <p className="text-base font-semibold text-[var(--color-text)]">Daily summary</p>
            <p className="text-sm text-[var(--color-muted)]">Overview of today's activity</p>
          </div>
          <Grid columns={2} gap={2}>
            <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] p-3">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--color-muted)] mb-1">Meals</p>
              <p className="text-lg font-bold text-[var(--color-text)]">{mealStore.meals.length}</p>
            </div>
            <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] p-3">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--color-muted)] mb-1">Calories</p>
              <p className="text-lg font-bold text-[var(--color-text)]">{Math.round(totalCal)} <span className="text-sm font-normal text-[var(--color-muted)]">kcal</span></p>
            </div>
            <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] p-3">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--color-muted)] mb-1">Workout</p>
              <p className="text-lg font-semibold text-[var(--color-text)] capitalize">{workoutStore.todayWorkout?.type ?? 'Rest'}</p>
            </div>
            <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] p-3">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--color-muted)] mb-1">Water</p>
              <p className="text-lg font-bold text-[var(--color-text)]">{waterStore.totalToday}<span className="text-sm font-normal text-[var(--color-muted)]">/{waterGoal} ml</span></p>
            </div>
          </Grid>
        </Card>

        {/* Nutrition */}
        <Card>
          <p className="text-base font-semibold text-[var(--color-text)] mb-3">Nutrition</p>

          {/* Percentage boxes */}
          <Grid columns={4} gap={2} className="mb-4">
            <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] p-3 text-center">
              <p className="text-md font-bold text-[var(--color-text)]">{calPct.toFixed(1)}%</p>
              <p className="text-[11px] text-[var(--color-muted)]">Calories</p>
            </div>
            <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] p-3 text-center">
              <p className="text-md font-bold text-[var(--color-text)]">{pPct.toFixed(1)}%</p>
              <p className="text-[11px] text-[var(--color-muted)]">Protein</p>
            </div>
            <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] p-3 text-center">
              <p className="text-md font-bold text-[var(--color-text)]">{cPct.toFixed(1)}%</p>
              <p className="text-[11px] text-[var(--color-muted)]">Carbs</p>
            </div>
            <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] p-3 text-center">
              <p className="text-md font-bold text-[var(--color-text)]">{fPct.toFixed(1)}%</p>
              <p className="text-[11px] text-[var(--color-muted)]">Fat</p>
            </div>
          </Grid>

          {/* Progress bars */}
          <VStack gap={0}>
            <div>
              <div className="flex flex-col items-end justify-between mb-1">
                <ProgressBar label="Calories" value={totalCal} max={goalCal} variant="accent" />
                <span className="text-sm text-[var(--color-muted)]">{formatNum(totalCal)} / {formatNum(goalCal)} kcal</span>
              </div>
            </div>
            <div>
              <div className="flex flex-col items-end justify-between mb-1">
                <ProgressBar label="Protein" value={totalP} max={goalP} variant="success" />
                <span className="text-sm text-[var(--color-muted)]">{formatNum(totalP)} / {formatNum(goalP)} g</span>
              </div>
            </div>
            <div>
              <div className="flex flex-col items-end justify-between mb-1">
                <ProgressBar label="Carbs" value={totalC} max={goalC} variant="warning" />
                <span className="text-sm text-[var(--color-muted)]">{formatNum(totalC)} / {formatNum(goalC)} g</span>
              </div>
            </div>
            <div>
              <div className="flex flex-col items-end justify-between mb-1">
                <ProgressBar label="Fat" value={totalF} max={goalF} variant="error" />
                <span className="text-sm text-[var(--color-muted)]">{formatNum(totalF)} / {formatNum(goalF)} g</span>
              </div>
            </div>
          </VStack>

          {/* Status labels */}
          <div className="flex gap-3 mt-3 flex-wrap">
            <span className="text-xs font-medium" style={{ color: getNutrientStatus(calPct).color }}>Calories: {getNutrientStatus(calPct).label}</span>
            <span className="text-xs font-medium" style={{ color: getNutrientStatus(pPct).color }}>Protein: {getNutrientStatus(pPct).label}</span>
            <span className="text-xs font-medium" style={{ color: getNutrientStatus(cPct).color }}>Carbs: {getNutrientStatus(cPct).label}</span>
            <span className="text-xs font-medium" style={{ color: getNutrientStatus(fPct).color }}>Fat: {getNutrientStatus(fPct).label}</span>
          </div>
        </Card>

        {/* Today's Meals */}
        <Card>
          <p className="text-md font-semibold text-[var(--color-text)] mb-3">Today's meals</p>
          <VStack gap={2}>
            {mealStore.meals.length === 0 ? (
              <p className="text-sm text-[var(--color-muted)]">No meals logged for this day</p>
            ) : (
              mealStore.meals.map((meal) => {
                const expanded = expandedMeals.has(meal.id)
                const mealCalories = meal.items?.reduce((sum, item) => {
                  const multiplier = mealItemGrams(item) / 100
                  return sum + (item.nutrition?.calories ?? 0) * multiplier
                }, 0) ?? 0
                return (
                  <div key={meal.id} className="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] overflow-hidden">
                    <button
                      type="button"
                      onClick={() => toggleMealExpand(meal.id)}
                      className="flex w-full items-center justify-between px-3 py-2.5 text-left"
                    >
                      <span className="text-sm font-medium text-[var(--color-text)]">{meal.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-[var(--color-muted)]">{formatNum(mealCalories)} kcal</span>
                        <span className="text-sm text-[var(--color-muted)]">{expanded ? '▲' : '▼'}</span>
                      </div>
                    </button>
                    {expanded && meal.items && meal.items.length > 0 && (
                      <div className="border-t border-[var(--color-border)] px-3 pb-3 pt-2">
                        <VStack gap={1}>
                          {meal.items.map((it) => {
                            const displayName = it.name ?? resolvedFoodNames[it.foodId] ?? it.foodId.split(':').pop()
                            const multiplier = mealItemGrams(it) / 100
                            const n = it.nutrition
                            return (
                              <div key={it.id} className="flex items-center justify-between text-xs py-0.5">
                                <span className="text-[11px] text-[var(--color-text)]">{displayName}</span>
                                <div className="flex items-center gap-3">
                                  <span className="text-[11px] text-white">{it.quantity} {it.unit}</span>
                                  <span className="text-[11px] text-[var(--color-muted)]">{n ? formatNum(n.calories * multiplier) : '0'}<span className="text-white"> kcal</span></span>
                                  <span className="text-[11px] text-[var(--color-muted)]">{n ? formatNum(n.protein * multiplier) : '0'}g <span className="text-white"> P</span></span>
                                  <span className="text-[11px] text-[var(--color-muted)]">{n ? formatNum(n.carbs * multiplier) : '0'}g <span className="text-white"> C</span></span>
                                  <span className="text-[11px] text-[var(--color-muted)]">{n ? formatNum(n.fat * multiplier) : '0'}g <span className="text-white"> F</span></span>
                                </div>
                              </div>
                            )
                          })}
                        </VStack>
                      </div>
                    )}
                  </div>
                )
              })
            )}
            <Button
              label="Add meal"
              variant="secondary"
              onClick={() => navigate('/meals', { state: { date: selectedDate } })}
            />
          </VStack>
        </Card>

        {/* Workout */}
        <Card>
          <p className="text-md font-semibold text-[var(--color-text)] mb-3">Workout</p>
          <WorkoutLogging
            selectedType={workoutStore.todayWorkout?.type}
            onSelect={handleWorkoutSelect}
          />
          {workoutStore.todayWorkout && (
            <div className="mt-4">
              <WorkoutCard workout={workoutStore.todayWorkout} />
            </div>
          )}
          <div className="mt-4">
            <p className="text-sm font-semibold text-[var(--color-muted)] mb-2">Recent workouts</p>
            <WorkoutHistory workouts={workoutStore.recentWorkouts} excludeDate={selectedDate} />
          </div>
        </Card>

        {/* Water Intake */}
        <Card>
          <p className="text-sm font-semibold text-[var(--color-text)] mb-3">Water intake</p>
          <WaterLogging key={`water-${resetKey}`} onAdd={handleAddWater} />
          <div className="mt-4">
            <WaterProgress current={waterStore.totalToday} goal={waterGoal} unit="ml" />
          </div>
          {waterStore.waterLogs.length > 0 && (
            <div className="flex gap-1.5 mt-3 flex-wrap">
              {waterStore.waterLogs.map((log) => (
                <Badge key={log.id} label={`${log.amount} ${log.unit}`} />
              ))}
            </div>
          )}
        </Card>

        {/* Tretinoin */}
        <Card>
          <p className="text-md font-semibold text-[var(--color-text)] mb-3">Tretinoin</p>
          {(() => {
            const lastApplied = getLastAppliedDate(tretinoinStore.logs)
            const scheduled = isScheduledNight(selectedDate, lastApplied)
            if (!scheduled && lastApplied) return null
            return <TretinoinTracker todayLog={tretinoinStore.todayLog} onToggle={handleTretinoinToggle} />
          })()}
        </Card>

        {/* Weight */}
        <Card>
          <p className="text-md font-semibold text-[var(--color-text)] mb-3">Weight</p>
          <WeightLogging
            todayEntry={weightStore.todayEntry}
            date={selectedDate}
            onSave={handleSaveWeight}
            showButton={false}
            weight={pendingWeight}
            unit={pendingWeightUnit}
            notes={pendingWeightNotes}
            onWeightChange={setPendingWeight}
            onUnitChange={setPendingWeightUnit}
            onNotesChange={setPendingWeightNotes}
          />
          <div className="mt-6">
            <p className="text-sm font-semibold text-[var(--color-muted)] mb-2">Weight history</p>
            <WeightHistory entries={weightStore.recentEntries} excludeDate={selectedDate} />
          </div>
        </Card>

        {/* Respect/Trust Score */}
        <Card>
          <p className="text-md font-semibold text-[var(--color-text)] mb-3">Respect/Trust score</p>
          <RespectTracker log={respectStore.todayLog} onUpsert={handleRespectUpsert} />
        </Card>

        {/* Daily Notes */}
        <Card>
          <p className="text-md font-semibold text-[var(--color-text)] mb-3">Daily notes</p>
          <DailyNoteEditor key={`note-${resetKey}`} date={selectedDate} note={dailyNoteStore.note} onSave={handleSaveNote} />
        </Card>

        {/* Submit */}
        <Button
          label={submitted ? 'Day logged!' : 'Submit daily log'}
          variant="primary"
          size="lg"
          className='h-10'
          onClick={handleSubmitDay}
        />
      </VStack>
    </PageContainer>
  )
}

export default Dashboard
