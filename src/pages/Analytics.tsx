import { useState, useEffect, useMemo } from 'react'
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend,
} from 'recharts'
import type { Meal, TretinoinLog, Workout } from '@/types'
import { mealRepository } from '@/lib/repositories/mealRepository'
import { weightRepository } from '@/lib/repositories/weightRepository'
import { waterRepository } from '@/lib/repositories/waterRepository'
import { workoutRepository } from '@/lib/repositories/workoutRepository'
import { tretinoinRepository } from '@/lib/repositories/tretinoinRepository'
import { nutritionCalculationService } from '@/lib/services/nutritionCalculation'
import { useSettingsStore } from '@/stores/settingsStore'
import { useSupplementStore } from '@/stores/supplementStore'
import { ChartCard, SegmentedControl, StreakCalendar, StreakCard } from '@/components/ds'
import { Card } from '@/components/ds'
import { SupplementTrends, type SupplementSeries } from '@/components/tracking/SupplementTrends'
import { isSupplementLog } from '@/lib/utils/supplements'
import {
  addDays, formatDayLabel, startOfWeek, tretinoinAdherence, tretinoinCalendar, tretinoinMonth,
  tretinoinStreak, tretinoinWeek,
} from '@/lib/utils/tretinoin'

type RangeKey = '7d' | '30d' | '90d'

const RANGE_LABELS: Record<RangeKey, string> = { '7d': '7 Days', '30d': '30 Days', '90d': '90 Days' }
const RANGE_DAYS: Record<RangeKey, number> = { '7d': 7, '30d': 30, '90d': 90 }

/** The `days` days ending today, today included — "7 Days" is seven points, not eight. */
function getDateRange(days: number): { start: string; end: string } {
  const end = new Date()
  const start = new Date()
  start.setDate(start.getDate() - (days - 1))
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
  const [tretinoinLogs, setTretinoinLogs] = useState<TretinoinLog[]>([])
  const [workouts, setWorkouts] = useState<Workout[]>([])
  const [supplementLogs, setSupplementLogs] = useState<Meal[]>([])
  const [loading, setLoading] = useState(false)
  /** 90-day view: months back from the current one. */
  const [monthOffset, setMonthOffset] = useState(0)

  const settingsStore = useSettingsStore()
  const supplements = useSupplementStore((s) => s.supplements)
  const supplementsLoaded = useSupplementStore((s) => s.loaded)
  const loadSupplements = useSupplementStore((s) => s.load)
  const calTarget = settingsStore.settings?.nutritionTargets?.calories ?? 2000
  const proteinTarget = settingsStore.settings?.nutritionTargets?.protein ?? 150
  const carbsTarget = settingsStore.settings?.nutritionTargets?.carbs ?? 250
  const fatTarget = settingsStore.settings?.nutritionTargets?.fat ?? 70
  const tretinoinSchedule = settingsStore.settings?.tretinoinSchedule
  const todayIso = new Date().toISOString().split('T')[0]

  /**
   * What the tretinoin card covers. 7 days is the current calendar week, so
   * its row reads Sunday to Saturday with every column the date it says;
   * 30 and 90 are the days ending today, drawn as a calendar.
   */
  const tretWindow = useMemo(() => {
    if (range === '7d') return { start: startOfWeek(todayIso), phrase: 'this week' }
    const days = RANGE_DAYS[range]
    return { start: addDays(todayIso, -(days - 1)), phrase: `in the last ${days} days` }
  }, [range, todayIso])

  const adherence = useMemo(
    () => tretinoinAdherence(tretinoinLogs, tretinoinSchedule, tretWindow.start, todayIso, todayIso),
    [tretinoinLogs, tretinoinSchedule, tretWindow, todayIso],
  )

  /**
   * Off-schedule applications are named rather than hidden: they draw a filled
   * dot on the card, so leaving them out of the sentence makes the dots and
   * the figure look like they disagree.
   */
  const adherenceLine = (() => {
    const { phrase } = tretWindow
    const extra =
      adherence.offSchedule > 0
        ? `, plus ${adherence.offSchedule} off-schedule`
        : ''
    if (adherence.scheduled === 0) {
      return adherence.offSchedule > 0
        ? `No scheduled days ${phrase} — ${adherence.offSchedule} applied anyway.`
        : `No scheduled days ${phrase} yet.`
    }
    return `Applied on ${adherence.applied} of ${adherence.scheduled} scheduled days ${phrase}${extra}.`
  })()

  /** 90-day pager: the month on screen, and how far back the range reaches. */
  const monthView = useMemo(() => {
    const now = new Date(`${todayIso}T12:00:00`)
    const startDate = new Date(`${tretWindow.start}T12:00:00`)
    const maxOffset =
      now.getFullYear() * 12 + now.getMonth() - (startDate.getFullYear() * 12 + startDate.getMonth())
    const shown = new Date(now.getFullYear(), now.getMonth() - monthOffset, 1, 12)
    return {
      year: shown.getFullYear(),
      month: shown.getMonth(),
      title: shown.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
      maxOffset,
    }
  }, [todayIso, tretWindow, monthOffset])

  /** One series per supplement on the list, plus any logged that has since left it. */
  const supplementSeries = useMemo<SupplementSeries[]>(() => {
    const dates = nutritionData.map((d) => d.date)
    const byDay = new Map<string, Record<string, number>>()
    const orphans = new Map<string, { name: string; unit: string }>()
    const known = new Set(supplements.map((s) => s.id))
    for (const log of supplementLogs) {
      const day = log.loggedAt.split('T')[0]
      const amounts = byDay.get(day) ?? {}
      for (const item of log.items ?? []) {
        amounts[item.foodId] = (amounts[item.foodId] ?? 0) + (item.quantity ?? 0)
        if (!known.has(item.foodId)) orphans.set(item.foodId, { name: item.name ?? 'Supplement', unit: item.unit ?? '' })
      }
      byDay.set(day, amounts)
    }
    const series = (id: string, name: string, unit: string): SupplementSeries => ({
      id,
      name,
      unit,
      values: dates.map((d) => byDay.get(d)?.[id] ?? 0),
    })
    return [
      ...supplements.map((s) => series(s.id, s.name, s.unit)),
      ...[...orphans].map(([id, o]) => series(id, o.name, o.unit)),
    ]
  }, [supplements, supplementLogs, nutritionData])

  const showSupplements = settingsStore.settings?.showSupplements !== false || supplementLogs.length > 0

  useEffect(() => {
    settingsStore.load()
  }, [])

  useEffect(() => {
    if (!supplementsLoaded) loadSupplements()
  }, [supplementsLoaded, loadSupplements])

  useEffect(() => {
    loadAnalytics(range)
    setMonthOffset(0)
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
      setSupplementLogs(allMeals.filter(isSupplementLog))

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

      setTretinoinLogs(allTretinoin)

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

          {showSupplements && (
            <SupplementTrends
              series={supplementSeries}
              dates={nutritionData.map((d) => d.date)}
              formatDate={formatShortDate}
            />
          )}

          {/* StreakCard is itself a DS card, so it stands on its own rather
              than sitting inside another one. 7 days: this week's row.
              30 days: the last 30 as a calendar. 90 days: a month at a time. */}
          <div>
            <p className="mb-3 title-2 text-black">Tretinoin adherence</p>
            <StreakCard
              days={tretinoinStreak(tretinoinLogs, tretinoinSchedule, todayIso)}
              week={range === '7d' ? tretinoinWeek(tretinoinLogs, tretinoinSchedule, todayIso) : undefined}
              footer={adherenceLine}
            >
              {range === '30d' ? (
                <StreakCalendar
                  title={`${formatDayLabel(tretWindow.start)} – ${formatDayLabel(todayIso)}`}
                  weeks={tretinoinCalendar(tretinoinLogs, tretinoinSchedule, tretWindow.start, todayIso, todayIso)}
                />
              ) : range === '90d' ? (
                <StreakCalendar
                  title={monthView.title}
                  weeks={tretinoinMonth(
                    tretinoinLogs, tretinoinSchedule, monthView.year, monthView.month, tretWindow.start, todayIso,
                  )}
                  onPrev={() => setMonthOffset((o) => Math.min(monthView.maxOffset, o + 1))}
                  onNext={() => setMonthOffset((o) => Math.max(0, o - 1))}
                  prevDisabled={monthOffset >= monthView.maxOffset}
                  nextDisabled={monthOffset === 0}
                />
              ) : undefined}
            </StreakCard>
          </div>

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
