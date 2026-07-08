import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDailyNutritionProgress } from '@/hooks/useNutrition'
import { useMealStore } from '@/stores/mealStore'
import { useWorkoutStore } from '@/stores/workoutStore'
import { useWaterStore } from '@/stores/waterStore'
import { useWeightStore } from '@/stores/weightStore'
import { useDailyNoteStore } from '@/stores/dailyNoteStore'
import { useSettingsStore } from '@/stores/settingsStore'
import { DailySummary } from '@/components/dashboard'
import { NutritionSummary } from '@/components/nutrition'
import {
  WorkoutCard,
  WorkoutLogging,
  WorkoutHistory,
  WaterLogging,
  WaterProgress,
  WeightLogging,
  WeightHistory,
  DailyNoteEditor,
} from '@/components/tracking'
import { PageContainer } from '@/components/ui/page-container'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
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

  const formattedDate = new Date(`${selectedDate}T12:00:00`).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })

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
    setSubmitted(true)
    setTimeout(() => setSubmitted(false), 3000)
  }

  const [pendingWeight, setPendingWeight] = useState(weightStore.todayEntry?.weight ?? 0)
  const [pendingWeightUnit, setPendingWeightUnit] = useState<WeightEntry['unit']>(weightStore.todayEntry?.unit ?? 'kg')
  const [pendingWeightNotes, setPendingWeightNotes] = useState(weightStore.todayEntry?.notes ?? '')
  const [submitted, setSubmitted] = useState(false)

  return (
    <PageContainer>
      <div className="flex justify-between mb-6">
        <h1 className="mt-1 text-2xl font-semibold text-slate-950 dark:text-[#FDFDFD]">Dashboard</h1>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              const input = document.getElementById('dash-date-picker') as HTMLInputElement
              if (input) input.showPicker?.() ?? input.click()
            }}
            className="!text-sm font-medium uppercase tracking-wide text-black hover:text-neutral-700 dark:text-[#FDFDFD]"
          >
            {formattedDate}
          </button>
          <input
            id="dash-date-picker"
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="sr-only"
          />
        </div>
      </div>

      <div className="mb-6 flex items-center justify-between">
        <Button size="sm" variant="outline" onClick={handlePreviousDay} className='flex gap-2 items-center'>
          ← Previous
        </Button>
        <div className="flex items-center gap-2">
          {!isToday && (
            <Button size="sm" variant="outline" onClick={handleToday}>
              Today
            </Button>
          )}
          <Button size="sm" variant="outline" onClick={handleNextDay} disabled={isToday}>
            Next →
          </Button>
        </div>
      </div>

      {errors.length > 0 && (
        <div className="mb-6 border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {errors.map((err, i) => <div key={i}>{err}</div>)}
        </div>
      )}

      <div className="space-y-6">
        <Card title="Daily Summary" description="Overview of today's activity">
          <DailySummary
            mealsCount={mealStore.meals.length}
            totalCalories={dailyStatus?.actual.calories ?? 0}
            workoutType={workoutStore.todayWorkout?.type}
            waterTotal={waterStore.totalToday}
            waterGoal={waterGoal}
          />
        </Card>

        <Card title="Nutrition">
          <NutritionSummary status={dailyStatus} compact={false} />
        </Card>

        <Card title="Today's Meals">
          <div className="space-y-2">
            {mealStore.meals.length === 0 ? (
              <p className="text-sm text-slate-500 dark:text-slate-300">No meals logged for this day</p>
            ) : (
              mealStore.meals.map((meal) => (
                <div key={meal.id} className="flex items-center justify-between border border-slate-600 p-3">
                  <span className="text-sm font-medium text-slate-950 capitalize dark:text-slate-300">{meal.name}</span>
                  <span className="text-xs text-slate-500 dark:text-slate-300">
                    {meal.items?.reduce((sum, item) => sum + (item.nutrition?.calories ?? 0), 0).toFixed(0)} kcal
                  </span>
                </div>
              ))
            )}
            <Button onClick={() => navigate('/meals')} variant="outline" className="w-full">
              + Add Meal
            </Button>
          </div>
        </Card>

        <Card title="Workout">
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
            <p className="mb-2 text-sm font-medium text-slate-500 dark:text-slate-200">Recent workouts</p>
            <WorkoutHistory workouts={workoutStore.recentWorkouts} excludeDate={selectedDate} />
          </div>
        </Card>

        <Card title="Water Intake">
          <WaterLogging onAdd={handleAddWater} />
          <div className="mt-4">
            <WaterProgress current={waterStore.totalToday} goal={waterGoal} unit="ml" />
          </div>
          {waterStore.waterLogs.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1">
              {waterStore.waterLogs.map((log) => (
                <span
                  key={log.id}
                  className="border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs text-slate-600 dark:border-[#2D2D2D] dark:bg-[#1F1F1F] dark:text-[#FDFDFD]/70"
                >
                  {log.amount} {log.unit}
                </span>
              ))}
            </div>
          )}
        </Card>

        <Card title="Weight">
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
            <p className="mb-2 text-sm font-medium text-slate-500 dark:text-slate-200">Weight history</p>
            <WeightHistory entries={weightStore.recentEntries} excludeDate={selectedDate} />
          </div>
        </Card>

        <Card title="Daily Notes">
          <DailyNoteEditor date={selectedDate} note={dailyNoteStore.note} onSave={handleSaveNote} />
        </Card>

        <Button onClick={handleSubmitDay} size="lg" className="w-full dark:bg-slate-200 dark:text-black">
          {submitted ? 'Day Logged!' : 'Submit Daily Log'}
        </Button>
      </div>
    </PageContainer>
  )
}

export default Dashboard
