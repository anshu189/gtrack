import { useState, useEffect } from 'react'
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend,
} from 'recharts'
import type { Meal, Workout } from '@/types'
import { mealRepository } from '@/lib/repositories/mealRepository'
import { weightRepository } from '@/lib/repositories/weightRepository'
import { waterRepository } from '@/lib/repositories/waterRepository'
import { workoutRepository } from '@/lib/repositories/workoutRepository'
import { tretinoinRepository } from '@/lib/repositories/tretinoinRepository'
import { nutritionCalculationService } from '@/lib/services/nutritionCalculation'
import { useSettingsStore } from '@/stores/settingsStore'
import { ChartCard, SegmentedControl } from '@/components/ds'
import { Card } from '@/components/ui/card'

type RangeKey = '7d' | '30d' | '90d'

const RANGE_LABELS: Record<RangeKey, string> = { '7d': '7 Days', '30d': '30 Days', '90d': '90 Days' }
const RANGE_DAYS: Record<RangeKey, number> = { '7d': 7, '30d': 30, '90d': 90 }

function getDateRange(days: number): { start: string; end: string } {
  const end = new Date()
  const start = new Date()
  start.setDate(start.getDate() - days)
  return { start: start.toISOString().split('T')[0], end: end.toISOString().split('T')[0] }
}

function formatShortDate(dateIso: string) {
  const d = new Date(`${dateIso}T12:00:00`)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

interface NutritionDataPoint {
  date: string
  calories: number
  protein: number
  carbs: number
  fat: number
}

interface WeightDataPoint {
  date: string
  weight: number
}

interface WaterDataPoint {
  date: string
  amount: number
}

interface TretinoinDataPoint {
  date: string
  applied: number
}

export default function Analytics() {
  const [range, setRange] = useState<RangeKey>('7d')
  const [nutritionData, setNutritionData] = useState<NutritionDataPoint[]>([])
  const [weightData, setWeightData] = useState<WeightDataPoint[]>([])
  const [waterData, setWaterData] = useState<WaterDataPoint[]>([])
  const [tretinoinData, setTretinoinData] = useState<TretinoinDataPoint[]>([])
  const [workouts, setWorkouts] = useState<Workout[]>([])
  const [loading, setLoading] = useState(false)

  const settingsStore = useSettingsStore()
  const calTarget = settingsStore.settings?.nutritionTargets?.calories ?? 2000
  const proteinTarget = settingsStore.settings?.nutritionTargets?.protein ?? 150
  const carbsTarget = settingsStore.settings?.nutritionTargets?.carbs ?? 250
  const fatTarget = settingsStore.settings?.nutritionTargets?.fat ?? 70

  useEffect(() => {
    settingsStore.load()
  }, [])

  useEffect(() => {
    loadAnalytics(range)
  }, [range])

  async function loadAnalytics(rangeKey: RangeKey) {
    setLoading(true)
    try {
      const days = RANGE_DAYS[rangeKey]
      const { start, end } = getDateRange(days)
      const dayEnd = `${end}T23:59:59.999Z`

      const [allMeals, allWeights, allWorkouts, allTretinoin] = await Promise.all([
        mealRepository.listByDateRange(start, dayEnd),
        weightRepository.listAll(),
        workoutRepository.listAll(),
        tretinoinRepository.listAll(),
      ])

      const nutrition = aggregateNutrition(allMeals, start, end)
      setNutritionData(nutrition)

      const filteredWeights = allWeights.filter((w) => w.date >= start && w.date <= end)
      setWeightData(
        filteredWeights
          .sort((a, b) => a.date.localeCompare(b.date))
          .map((w) => ({ date: w.date, weight: w.weight })),
      )

      const waterPromises: Promise<{ date: string; amount: number }>[] = []
      const dateCursor = new Date(start)
      const endDate = new Date(end)
      while (dateCursor <= endDate) {
        const dateIso = dateCursor.toISOString().split('T')[0]
        waterPromises.push(
          waterRepository.getTotalForDate(dateIso).then((total) => ({ date: dateIso, amount: total })),
        )
        dateCursor.setDate(dateCursor.getDate() + 1)
      }
      const waterResults = await Promise.all(waterPromises)
      setWaterData(waterResults.filter((w) => w.amount > 0))

      const tretinoinMap = new Map<string, boolean>()
      for (const t of allTretinoin) {
        if (t.applied) tretinoinMap.set(t.date, true)
      }
      const tretinoinPoints: TretinoinDataPoint[] = []
      const cursor = new Date(start)
      const endDt = new Date(end)
      while (cursor <= endDt) {
        const iso = cursor.toISOString().split('T')[0]
        tretinoinPoints.push({ date: iso, applied: tretinoinMap.has(iso) ? 1 : 0 })
        cursor.setDate(cursor.getDate() + 1)
      }
      setTretinoinData(tretinoinPoints)

      const filteredWorkouts = allWorkouts.filter((w) => w.date >= start && w.date <= end)
      setWorkouts(filteredWorkouts)
    } finally {
      setLoading(false)
    }
  }

  function aggregateNutrition(meals: Meal[], start: string, end: string): NutritionDataPoint[] {
    const grouped = new Map<string, NutritionDataPoint>()
    const dateCursor = new Date(start)
    const endDate = new Date(end)
    while (dateCursor <= endDate) {
      const iso = dateCursor.toISOString().split('T')[0]
      grouped.set(iso, { date: iso, calories: 0, protein: 0, carbs: 0, fat: 0 })
      dateCursor.setDate(dateCursor.getDate() + 1)
    }

    for (const meal of meals) {
      const day = meal.loggedAt.split('T')[0]
      if (!grouped.has(day)) continue
      const n = nutritionCalculationService.calculateMealNutrition(meal)
      const entry = grouped.get(day)!
      entry.calories += n.calories
      entry.protein += n.protein
      entry.carbs += n.carbs
      entry.fat += n.fat
    }

    return Array.from(grouped.values())
  }

  const workoutCounts: Record<string, number> = {}
  for (const w of workouts) {
    workoutCounts[w.type] = (workoutCounts[w.type] || 0) + 1
  }
  const workoutSummary = [
    { name: 'Push', value: workoutCounts['push'] || 0 },
    { name: 'Pull', value: workoutCounts['pull'] || 0 },
    { name: 'Legs', value: workoutCounts['legs'] || 0 },
    { name: 'Rest', value: workoutCounts['rest'] || 0 },
  ]

  const daysCount = nutritionData.length || 1
  const avgCalories = nutritionData.reduce((s, d) => s + d.calories, 0) / daysCount
  const avgProtein = nutritionData.reduce((s, d) => s + d.protein, 0) / daysCount
  const avgCarbs = nutritionData.reduce((s, d) => s + d.carbs, 0) / daysCount
  const avgFat = nutritionData.reduce((s, d) => s + d.fat, 0) / daysCount
  const totalWorkouts = workouts.filter((w) => w.type !== 'rest').length

  return (
    <>
      <div className="mb-5">
        <h1 className="title-1 text-black">Analytics</h1>
      </div>

      <div className="mb-6">
        <SegmentedControl
          label="Date range"
          value={range}
          onChange={(next) => setRange(next as RangeKey)}
          options={(Object.keys(RANGE_LABELS) as RangeKey[]).map((key) => ({
            value: key,
            label: RANGE_LABELS[key],
          }))}
        />
      </div>

      {loading ? (
        <p className="py-12 text-center text-sm text-ink-2">Loading...</p>
      ) : (
        <div className="space-y-6">
          <ChartCard
            title="Daily calories"
            data={nutritionData.map((d) => d.calories)}
            labels={nutritionData.map((d) => formatShortDate(d.date))}
            unit=" kcal"
            decimals={0}
            target={calTarget}
            targetLabel={`Target ${Math.round(calTarget)}`}
            emptyMessage="Log a few more days to see a trend."
          />

          <Card title="Macronutrients">
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={nutritionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--track)" />
                <XAxis dataKey="date" tickFormatter={formatShortDate} tick={{ fontSize: 11, fill: 'var(--ink-2)' }} />
                <YAxis tick={{ fontSize: 11, fill: 'var(--ink-2)' }} />
                <Tooltip
                  contentStyle={{
                    background: 'var(--ink)',
                    border: 'none',
                    borderRadius: 10,
                    padding: '8px 10px',
                  }}
                  labelStyle={{ color: 'var(--on-ink-muted)', fontSize: 11 }}
                  itemStyle={{ color: 'var(--on-ink)', fontSize: 12, fontWeight: 600 }}
                  cursor={{ stroke: 'var(--track)' }}
                />
                <Legend />
                <Line type="monotone" dataKey="protein" stroke="var(--protein)" strokeWidth={2} dot={false} name="Protein" />
                <Line type="monotone" dataKey="carbs" stroke="var(--carbs)" strokeWidth={2} dot={false} name="Carbs" />
                <Line type="monotone" dataKey="fat" stroke="var(--fat)" strokeWidth={2} dot={false} name="Fat" />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          <ChartCard
            title="Weight trend"
            data={weightData.map((d) => d.weight)}
            labels={weightData.map((d) => formatShortDate(d.date))}
            unit=" kg"
            emptyMessage="Log your weight on a few more days to see a trend."
          />

          {waterData.length > 0 && (
            <Card title="Water intake">
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={waterData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--track)" />
                  <XAxis dataKey="date" tickFormatter={formatShortDate} tick={{ fontSize: 11, fill: 'var(--ink-2)' }} />
                  <YAxis tick={{ fontSize: 11, fill: 'var(--ink-2)' }} />
                  <Tooltip
                  contentStyle={{
                    background: 'var(--ink)',
                    border: 'none',
                    borderRadius: 10,
                    padding: '8px 10px',
                  }}
                  labelStyle={{ color: 'var(--on-ink-muted)', fontSize: 11 }}
                  itemStyle={{ color: 'var(--on-ink)', fontSize: 12, fontWeight: 600 }}
                  cursor={{ stroke: 'var(--track)' }}
                />
                  <Bar dataKey="amount" fill="var(--fat)" radius={[4, 4, 0, 0]} name="Water (ml)" />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          )}

          <Card title="Tretinoin adherence">
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={tretinoinData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--track)" />
                <XAxis dataKey="date" tickFormatter={formatShortDate} tick={{ fontSize: 11, fill: 'var(--ink-2)' }} />
                <YAxis tick={{ fontSize: 11, fill: 'var(--ink-2)' }} domain={[0, 1]} ticks={[0, 1]} />
                <Tooltip
                  contentStyle={{
                    background: 'var(--ink)',
                    border: 'none',
                    borderRadius: 10,
                    padding: '8px 10px',
                  }}
                  labelStyle={{ color: 'var(--on-ink-muted)', fontSize: 11 }}
                  itemStyle={{ color: 'var(--on-ink)', fontSize: 12, fontWeight: 600 }}
                  cursor={{ stroke: 'var(--track)' }}
                />
                <Bar dataKey="applied" fill="var(--success)" radius={[2, 2, 0, 0]} name="Applied" />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          <Card title="Summary">
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-md bg-surface-2 p-4">
                <p className="text-xs text-ink-2">Avg daily calories</p>
                <p className="mt-1 stat-md text-black">{Math.round(avgCalories)}</p>
                <p className="text-xs text-ink-2">target: {Math.round(calTarget)}</p>
              </div>
              <div className="rounded-md bg-surface-2 p-4">
                <p className="text-xs text-ink-2">Avg protein</p>
                <p className="mt-1 stat-md text-black">{Math.round(avgProtein)}g</p>
                <p className="text-xs text-ink-2">target: {Math.round(proteinTarget)}g</p>
              </div>
              <div className="rounded-md bg-surface-2 p-4">
                <p className="text-xs text-ink-2">Avg carbs</p>
                <p className="mt-1 stat-md text-black">{Math.round(avgCarbs)}g</p>
                <p className="text-xs text-ink-2">target: {Math.round(carbsTarget)}g</p>
              </div>
              <div className="rounded-md bg-surface-2 p-4">
                <p className="text-xs text-ink-2">Avg fat</p>
                <p className="mt-1 stat-md text-black">{Math.round(avgFat)}g</p>
                <p className="text-xs text-ink-2">target: {Math.round(fatTarget)}g</p>
              </div>
              <div className="rounded-md bg-surface-2 p-4">
                <p className="text-xs text-ink-2">Workouts</p>
                <p className="mt-1 stat-md text-black">{totalWorkouts}</p>
                <p className="text-xs text-ink-2">in {RANGE_LABELS[range].toLowerCase()}</p>
              </div>
              <div className="rounded-md bg-surface-2 p-4">
                <p className="text-xs text-ink-2">Workout split</p>
                <div className="mt-1 space-y-0.5">
                  {workoutSummary.filter((w) => w.value > 0).map((w) => (
                    <p key={w.name} className="text-xs text-ink-2 /70">{w.name}: {w.value}x</p>
                  ))}
                  {workoutSummary.every((w) => w.value === 0) && (
                    <p className="text-xs text-ink-3 /40">No data</p>
                  )}
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}
    </>
  )
}
