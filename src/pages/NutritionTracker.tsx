import { useState, useEffect } from 'react'
import { useDailyNutritionProgress } from '@/hooks/useNutrition'
import { useMealStore } from '@/stores/mealStore'
import { NutritionSummary, MealNutritionCard } from '@/components/nutrition'
import { PageContainer } from '@/components/ui/page-container'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { nutritionCalculationService } from '@/lib/services/nutritionCalculation'

const NutritionTracker = () => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const mealStore = useMealStore()
  const { status: dailyStatus, loading } = useDailyNutritionProgress(selectedDate)

  useEffect(() => {
    mealStore.loadByDateRange(`${selectedDate}T00:00:00Z`, `${selectedDate}T23:59:59Z`)
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
    setSelectedDate(new Date().toISOString().split('T')[0])
  }

  const isToday = selectedDate === new Date().toISOString().split('T')[0]

  return (
    <PageContainer>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-950">Nutrition Tracker</h1>
      </div>

      <div className="mb-6 flex items-center justify-between">
        <Button size="sm" variant="outline" onClick={handlePreviousDay}>
          &larr; Previous
        </Button>
        <div className="text-center">
          <p className="text-sm font-medium text-slate-950">
            {new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
          </p>
          <p className="text-xs text-slate-500">{selectedDate}</p>
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
        <p className="py-12 text-center text-sm text-slate-500">Loading...</p>
      ) : (
        <div className="space-y-6">
          {dailyStatus && (
            <Card title="Daily Nutrition">
              <NutritionSummary status={dailyStatus} />
            </Card>
          )}

          <Card title={`Meals (${mealStore.meals.length})`}>
            {mealStore.meals.length === 0 ? (
              <p className="text-sm text-slate-500">No meals logged for this day.</p>
            ) : (
              <div className="space-y-2">
                {mealStore.meals.map((meal) => {
                  const mealNutrition = nutritionCalculationService.calculateMealNutrition(meal)
                  return <MealNutritionCard key={meal.id} name={meal.name ?? 'Meal'} nutrition={mealNutrition} />
                })}
              </div>
            )}
          </Card>

          {dailyStatus && (
            <Card title="Quick Stats">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-lg border border-slate-200 p-3">
                  <p className="text-xs text-slate-500">Remaining Calories</p>
                  <p className="text-lg font-semibold text-slate-950">{Math.max(0, Math.round(dailyStatus.remaining.calories))} kcal</p>
                </div>
                <div className="rounded-lg border border-slate-200 p-3">
                  <p className="text-xs text-slate-500">Surplus / Deficit</p>
                  <p className={`text-lg font-semibold ${dailyStatus.surplus.calories > 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {dailyStatus.surplus.calories > 0 ? '+' : ''}{Math.round(dailyStatus.surplus.calories)} kcal
                  </p>
                </div>
                <div className="rounded-lg border border-slate-200 p-3">
                  <p className="text-xs text-slate-500">Protein %</p>
                  <p className="text-lg font-semibold text-slate-950">{Math.round(dailyStatus.percentage.protein)}%</p>
                </div>
                <div className="rounded-lg border border-slate-200 p-3">
                  <p className="text-xs text-slate-500">Macros Balance</p>
                  <p className="text-xs text-slate-600 mt-1">
                    P: {Math.round(dailyStatus.actual.protein)}g &middot; C: {Math.round(dailyStatus.actual.carbs)}g &middot; F: {Math.round(dailyStatus.actual.fat)}g
                  </p>
                </div>
              </div>
            </Card>
          )}
        </div>
      )}
    </PageContainer>
  )
}

export default NutritionTracker
