import React, { useCallback, useEffect } from 'react'
import { useDailyNutritionProgress } from '@/hooks/useNutrition'
import { useMealStore } from '@/stores/mealStore'
import { useWorkoutStore } from '@/stores/workoutStore'
import { useWaterStore } from '@/stores/waterStore'
import { useWeightStore } from '@/stores/weightStore'
import { useDailyNoteStore } from '@/stores/dailyNoteStore'
import { useSettingsStore } from '@/stores/settingsStore'
import { DailySummary, ProgressCards } from '@/components/dashboard'
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
import { Section } from '@/components/ui/section'
import { Card } from '@/components/ui/card'
import type { DailyNote, WaterLog, WeightEntry, WorkoutType } from '@/types'

const DEFAULT_WATER_GOAL_ML = 2000

function getTodayIso() {
  return new Date().toISOString().split('T')[0]
}

const Dashboard: React.FC = () => {
  const today = getTodayIso()
  const mealStore = useMealStore()
  const workoutStore = useWorkoutStore()
  const waterStore = useWaterStore()
  const weightStore = useWeightStore()
  const dailyNoteStore = useDailyNoteStore()
  const settingsStore = useSettingsStore()
  const { status: dailyStatus, loading } = useDailyNutritionProgress(today)

  const waterGoal = settingsStore.settings?.waterGoalMl ?? DEFAULT_WATER_GOAL_ML

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

  return (
    <PageContainer>
      <Section title={`Dashboard — ${formattedDate}`}>
        <Card className="mb-4 rounded-sm border border-slate-200 p-3 shadow-sm">
          <div className="text-sm text-slate-600">Today&apos;s Overview</div>
          <div className="text-xs text-slate-500">{today}</div>
        </Card>

        <div className="mb-4">
          <h3 className="mb-2 text-sm font-medium text-slate-950">Daily Summary</h3>
          <DailySummary
            mealsCount={mealStore.meals.length}
            totalCalories={dailyStatus?.actual.calories ?? 0}
            workoutType={workoutStore.todayWorkout?.type}
            waterTotal={waterStore.totalToday}
            waterGoal={waterGoal}
          />
        </div>

        <div className="mb-4">
          <NutritionSummary status={dailyStatus} compact={false} />
        </div>

        <div className="mb-4">
          <h3 className="mb-2 text-sm font-medium text-slate-950">Progress Towards Goals</h3>
          {loading ? (
            <div className="p-3 text-center text-sm text-slate-500">Loading...</div>
          ) : (
            <ProgressCards status={dailyStatus} />
          )}
        </div>

        <div className="mb-4">
          <h3 className="mb-2 text-sm font-medium text-slate-950">Workout</h3>
          <Card className="rounded-sm border border-slate-200 p-3 shadow-sm">
            <WorkoutLogging
              selectedType={workoutStore.todayWorkout?.type}
              onSelect={handleWorkoutSelect}
            />
            {workoutStore.todayWorkout && (
              <div className="mt-3">
                <WorkoutCard workout={workoutStore.todayWorkout} />
              </div>
            )}
            <div className="mt-3">
              <div className="mb-2 text-xs font-medium text-slate-500">Recent workouts</div>
              <WorkoutHistory workouts={workoutStore.recentWorkouts} excludeDate={today} />
            </div>
          </Card>
        </div>

        <div className="mb-4">
          <h3 className="mb-2 text-sm font-medium text-slate-950">Water Intake</h3>
          <Card className="rounded-sm border border-slate-200 p-3 shadow-sm">
            <WaterLogging onAdd={handleAddWater} />
            <WaterProgress current={waterStore.totalToday} goal={waterGoal} unit="ml" />
            {waterStore.waterLogs.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1">
                {waterStore.waterLogs.map((log) => (
                  <span
                    key={log.id}
                    className="rounded-sm border border-slate-200 bg-slate-50 px-2 py-1 text-xs text-slate-700"
                  >
                    {log.amount} {log.unit}
                  </span>
                ))}
              </div>
            )}
          </Card>
        </div>

        <div className="mb-4">
          <h3 className="mb-2 text-sm font-medium text-slate-950">Weight</h3>
          <Card className="rounded-sm border border-slate-200 p-3 shadow-sm">
            <WeightLogging
              todayEntry={weightStore.todayEntry}
              date={today}
              onSave={handleSaveWeight}
            />
            <div className="mt-3">
              <div className="mb-2 text-xs font-medium text-slate-500">Weight history</div>
              <WeightHistory entries={weightStore.recentEntries} excludeDate={today} />
            </div>
          </Card>
        </div>

        <div className="mb-4">
          <h3 className="mb-2 text-sm font-medium text-slate-950">Daily Notes</h3>
          <Card className="rounded-sm border border-slate-200 p-3 shadow-sm">
            <DailyNoteEditor date={today} note={dailyNoteStore.note} onSave={handleSaveNote} />
          </Card>
        </div>
      </Section>
    </PageContainer>
  )
}

export default Dashboard
