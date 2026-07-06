import React, { useState, useEffect } from 'react'
import { useDailyNutritionProgress, useMealNutrition } from '@/hooks/useNutrition'
import { useMealStore } from '@/stores/mealStore'
import { NutritionSummary, MealNutritionCard } from '@/components/nutrition'
import { PageContainer } from '@/components/ui/page-container'
import { Section } from '@/components/ui/section'
import { Button } from '@/components/ui/button'

const NutritionTracker: React.FC = () => {
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

  return (
    <PageContainer>
      <Section title="Nutrition Tracker">
        {/* Date selector */}
        <div className="p-3 border border-gray-200 rounded-sm bg-white mb-4 flex items-center justify-between">
          <Button size="sm" variant="outline" onClick={handlePreviousDay}>
            ← Prev
          </Button>
          <div className="text-center">
            <div className="text-sm font-medium">{new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</div>
            <div className="text-xs text-gray-600">{selectedDate}</div>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={handleToday}>
              Today
            </Button>
            <Button size="sm" variant="outline" onClick={handleNextDay}>
              Next →
            </Button>
          </div>
        </div>

        {/* Daily nutrition summary */}
        {loading ? (
          <div className="p-3 text-center text-gray-500">Loading...</div>
        ) : (
          <NutritionSummary status={dailyStatus} />
        )}

        {/* Meals for the day */}
        <div className="mt-4">
          <h3 className="text-sm font-medium mb-2">Meals ({mealStore.meals.length})</h3>
          <div className="flex flex-col gap-2">
            {mealStore.meals.length === 0 ? (
              <div className="p-3 text-xs text-center text-gray-500">No meals logged for this day</div>
            ) : (
              mealStore.meals.map((meal) => {
                const mealNutrition = useMealNutrition(meal)
                if (!mealNutrition) return null
                return <MealNutritionCard key={meal.id} name={meal.name ?? 'Meal'} nutrition={mealNutrition} />
              })
            )}
          </div>
        </div>

        {/* Quick stats */}
        {dailyStatus && (
          <div className="mt-4 p-3 border border-gray-200 rounded-sm bg-gray-50">
            <h3 className="text-sm font-medium mb-2">Quick Stats</h3>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <div className="font-medium">Remaining Calories</div>
                <div className="text-gray-600">{Math.max(0, Math.round(dailyStatus.remaining.calories))} kcal</div>
              </div>
              <div>
                <div className="font-medium">Surplus / Deficit</div>
                <div className={dailyStatus.surplus.calories > 0 ? 'text-red-600' : 'text-green-600'}>
                  {dailyStatus.surplus.calories > 0 ? '+' : ''}{Math.round(dailyStatus.surplus.calories)} kcal
                </div>
              </div>
              <div>
                <div className="font-medium">Protein %</div>
                <div className="text-gray-600">{Math.round(dailyStatus.percentage.protein)}%</div>
              </div>
              <div>
                <div className="font-medium">Macros Balance</div>
                <div className="text-xs text-gray-600">P: {Math.round(dailyStatus.actual.protein)}g • C: {Math.round(dailyStatus.actual.carbs)}g • F: {Math.round(dailyStatus.actual.fat)}g</div>
              </div>
            </div>
          </div>
        )}
      </Section>
    </PageContainer>
  )
}

export default NutritionTracker
