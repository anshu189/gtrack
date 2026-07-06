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
  const today = getTodayIso()
  const mealStore = useMealStore()
  const workoutStore = useWorkoutStore()
  const waterStore = useWaterStore()
  const weightStore = useWeightStore()
  const dailyNoteStore = useDailyNoteStore()
  const settingsStore = useSettingsStore()
  const { status: dailyStatus } = useDailyNutritionProgress(today)

  const waterGoal = settingsStore.settings?.waterGoalMl ?? DEFAULT_WATER_GOAL_ML
  const [pendingWeight, setPendingWeight] = useState(weightStore.todayEntry?.weight ?? 0)
  const [pendingWeightUnit, setPendingWeightUnit] = useState<WeightEntry['unit']>(weightStore.todayEntry?.unit ?? 'kg')
  const [pendingWeightNotes, setPendingWeightNotes] = useState(weightStore.todayEntry?.notes ?? '')
  const [submitted, setSubmitted] = useState(false)

  const errors = [
    mealStore.error,
    workoutStore.error,
    waterStore.error,
    weightStore.error,
    dailyNoteStore.error,
    settingsStore.error,
  ].filter(Boolean) as string[]

  useEffect(() => {
    mealStore.loadByDateRange(`${today}T00:00:00Z`, `${today}T23:59:59Z`)
    workoutStore.loadToday(today)
    workoutStore.loadRecent(7)
    waterStore.loadByDate(today)
    weightStore.loadToday(today)
    weightStore.loadRecent(7)
    dailyNoteStore.loadByDate(today)
    settingsStore.load()
  }, [today])

  const formattedDate = new Date(`${today}T12:00:00`).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })

  const handleWorkoutSelect = (type: WorkoutType) => {
    workoutStore.setWorkoutType(today, type)
  }

  const handleAddWater = async (log: Partial<WaterLog>) => {
    const now = new Date().toISOString()
    await waterStore.add({
      id: `water:${Date.now()}`,
      date: today,
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
        id: `weight:${today}`,
        date: today,
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
    weightStore.loadToday(today)
    setSubmitted(true)
    setTimeout(() => setSubmitted(false), 3000)
  }

  return (
    <PageContainer>
      <div className="mb-6">
        <p className="text-xs font-medium uppercase tracking-widest text-blue-600">{formattedDate}</p>
        <h1 className="mt-1 text-2xl font-semibold text-slate-950">Dashboard</h1>
      </div>

      {errors.length > 0 && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
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
              <p className="text-sm text-slate-500">No meals logged today</p>
            ) : (
              mealStore.meals.map((meal) => (
                <div key={meal.id} className="flex items-center justify-between rounded-lg border border-slate-200 p-3">
                  <span className="text-sm font-medium text-slate-950">{meal.name}</span>
                  <span className="text-xs text-slate-500">
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
            <p className="mb-2 text-xs font-medium text-slate-500">Recent workouts</p>
            <WorkoutHistory workouts={workoutStore.recentWorkouts} excludeDate={today} />
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
                  className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs text-slate-600"
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
            date={today}
            onSave={handleSaveWeight}
            showButton={false}
            weight={pendingWeight}
            unit={pendingWeightUnit}
            notes={pendingWeightNotes}
            onWeightChange={setPendingWeight}
            onUnitChange={setPendingWeightUnit}
            onNotesChange={setPendingWeightNotes}
          />
          <div className="mt-4">
            <p className="mb-2 text-xs font-medium text-slate-500">Weight history</p>
            <WeightHistory entries={weightStore.recentEntries} excludeDate={today} />
          </div>
        </Card>

        <Card title="Daily Notes">
          <DailyNoteEditor date={today} note={dailyNoteStore.note} onSave={handleSaveNote} />
        </Card>

        <Button onClick={handleSubmitDay} size="lg" className="w-full">
          {submitted ? 'Day Logged!' : 'Submit Daily Log'}
        </Button>
      </div>
    </PageContainer>
  )
}

export default Dashboard
