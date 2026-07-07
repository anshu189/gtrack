import { useState, useEffect } from 'react'
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend,
} from 'recharts'
import type { Meal, Workout } from '@/types'
import { mealRepository } from '@/lib/repositories/mealRepository'
import { weightRepository } from '@/lib/repositories/weightRepository'
import { waterRepository } from '@/lib/repositories/waterRepository'
import { workoutRepository } from '@/lib/repositories/workoutRepository'
import { nutritionCalculationService } from '@/lib/services/nutritionCalculation'
import { useSettingsStore } from '@/stores/settingsStore'
import { PageContainer } from '@/components/ui/page-container'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

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

export default function Analytics() {
  const [range, setRange] = useState<RangeKey>('7d')
  const [nutritionData, setNutritionData] = useState<NutritionDataPoint[]>([])
  const [weightData, setWeightData] = useState<WeightDataPoint[]>([])
  const [waterData, setWaterData] = useState<WaterDataPoint[]>([])
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

      const [allMeals, allWeights, allWorkouts] = await Promise.all([
        mealRepository.listByDateRange(start, dayEnd),
        weightRepository.listAll(),
        workoutRepository.listAll(),
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
  const avgCalories = Math.round(nutritionData.reduce((s, d) => s + d.calories, 0) / daysCount)
  const avgProtein = Math.round(nutritionData.reduce((s, d) => s + d.protein, 0) / daysCount)
  const avgCarbs = Math.round(nutritionData.reduce((s, d) => s + d.carbs, 0) / daysCount)
  const avgFat = Math.round(nutritionData.reduce((s, d) => s + d.fat, 0) / daysCount)
  const totalWorkouts = workouts.filter((w) => w.type !== 'rest').length

  return (
    <PageContainer>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-950">Analytics</h1>
      </div>

      <div className="mb-6 flex items-center gap-2">
        {(Object.keys(RANGE_LABELS) as RangeKey[]).map((key) => (
          <Button
            key={key}
            size="sm"
            variant={range === key ? 'default' : 'outline'}
            onClick={() => setRange(key)}
          >
            {RANGE_LABELS[key]}
          </Button>
        ))}
      </div>

      {loading ? (
        <p className="py-12 text-center text-sm text-slate-500">Loading...</p>
      ) : (
        <div className="space-y-6">
          <Card title="Daily Calories">
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={nutritionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="date" tickFormatter={formatShortDate} tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip />
                <Line type="monotone" dataKey="calories" stroke="#2563eb" strokeWidth={2} dot={false} name="Calories" />
                <Line
                  type="monotone" dataKey="calories" stroke="#dc2626" strokeWidth={1}
                  strokeDasharray="4 4" dot={false} name={`Target (${calTarget})`}
                  data={nutritionData.map((d) => ({ ...d, calories: calTarget }))}
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          <Card title="Macronutrients">
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={nutritionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="date" tickFormatter={formatShortDate} tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="protein" stroke="#16a34a" strokeWidth={2} dot={false} name="Protein" />
                <Line type="monotone" dataKey="carbs" stroke="#ea580c" strokeWidth={2} dot={false} name="Carbs" />
                <Line type="monotone" dataKey="fat" stroke="#dc2626" strokeWidth={2} dot={false} name="Fat" />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          {weightData.length > 0 && (
            <Card title="Weight Trend">
              <ResponsiveContainer width="100%" height={240}>
                <LineChart data={weightData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="date" tickFormatter={formatShortDate} tick={{ fontSize: 11, fill: '#64748b' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748b' }} domain={['auto', 'auto']} />
                  <Tooltip />
                  <Line type="monotone" dataKey="weight" stroke="#7c3aed" strokeWidth={2} dot={{ r: 3 }} name="Weight" />
                </LineChart>
              </ResponsiveContainer>
            </Card>
          )}

          {waterData.length > 0 && (
            <Card title="Water Intake">
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={waterData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="date" tickFormatter={formatShortDate} tick={{ fontSize: 11, fill: '#64748b' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                  <Tooltip />
                  <Bar dataKey="amount" fill="#0ea5e9" radius={[4, 4, 0, 0]} name="Water (ml)" />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          )}

          <Card title="Summary">
            <div className="grid grid-cols-2 gap-3">
              <div className="border border-slate-200 p-4">
                <p className="text-xs text-slate-500">Avg Daily Calories</p>
                <p className="mt-1 text-xl font-semibold text-slate-950">{avgCalories}</p>
                <p className="text-xs text-slate-500">target: {calTarget}</p>
              </div>
              <div className="border border-slate-200 p-4">
                <p className="text-xs text-slate-500">Avg Protein</p>
                <p className="mt-1 text-xl font-semibold text-slate-950">{avgProtein}g</p>
                <p className="text-xs text-slate-500">target: {proteinTarget}g</p>
              </div>
              <div className="border border-slate-200 p-4">
                <p className="text-xs text-slate-500">Avg Carbs</p>
                <p className="mt-1 text-xl font-semibold text-slate-950">{avgCarbs}g</p>
                <p className="text-xs text-slate-500">target: {carbsTarget}g</p>
              </div>
              <div className="border border-slate-200 p-4">
                <p className="text-xs text-slate-500">Avg Fat</p>
                <p className="mt-1 text-xl font-semibold text-slate-950">{avgFat}g</p>
                <p className="text-xs text-slate-500">target: {fatTarget}g</p>
              </div>
              <div className="border border-slate-200 p-4">
                <p className="text-xs text-slate-500">Workouts</p>
                <p className="mt-1 text-xl font-semibold text-slate-950">{totalWorkouts}</p>
                <p className="text-xs text-slate-500">in {RANGE_LABELS[range].toLowerCase()}</p>
              </div>
              <div className="border border-slate-200 p-4">
                <p className="text-xs text-slate-500">Workout Split</p>
                <div className="mt-1 space-y-0.5">
                  {workoutSummary.filter((w) => w.value > 0).map((w) => (
                    <p key={w.name} className="text-xs text-slate-600">{w.name}: {w.value}x</p>
                  ))}
                  {workoutSummary.every((w) => w.value === 0) && (
                    <p className="text-xs text-slate-400">No data</p>
                  )}
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}
    </PageContainer>
  )
}
