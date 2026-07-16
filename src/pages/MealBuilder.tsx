import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import type { Food, Meal, MealItem } from '@/types'
import { useMealStore } from '@/stores/mealStore'
import { MealCard, AddItem, FoodMacroEditor, UndoBanner } from '@/components/meal'
import { Button } from '@/components/ui/button'
import { PageContainer } from '@/components/ui/page-container'
import { Card } from '@/components/ui/card'

function getTodayIso() {
  return new Date().toISOString().split('T')[0]
}

const MealBuilder = () => {
  const location = useLocation()
  const mealStore = useMealStore()
  const [currentMeal, setCurrentMeal] = useState<Partial<Meal> | null>(null)
  const [mealNameInput, setMealNameInput] = useState('')
  const [showEditor, setShowEditor] = useState(false)
  const [selectedDate, setSelectedDate] = useState<string>(
    (location.state as any)?.date ?? getTodayIso()
  )

  const isToday = selectedDate === getTodayIso()
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    mealStore.loadByDateRange(`${selectedDate}T00:00:00Z`, `${selectedDate}T23:59:59Z`)
    mealStore.loadDeleted()
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
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })

  const handleCreateMeal = async () => {
    const created = await mealStore.create({
      name: mealNameInput || 'Meal',
      loggedAt: `${selectedDate}T12:00:00Z`,
      items: [],
    })
    setCurrentMeal(created)
    setMealNameInput('')
  }

  const handleAddItem = (payload: { food: Food; quantity: number; unit?: string }) => {
    if (!currentMeal) return
    const item: MealItem = {
      id: `item:${Date.now()}-${Math.random()}`,
      foodId: payload.food.id,
      name: payload.food.name,
      quantity: payload.quantity,
      unit: payload.unit,
      nutrition: payload.food.nutrition,
    }
    setCurrentMeal({
      ...currentMeal,
      items: [...(currentMeal.items ?? []), item],
    })
  }

  const handleRemoveItem = (itemId: string) => {
    if (!currentMeal) return
    setCurrentMeal({
      ...currentMeal,
      items: currentMeal.items?.filter((i) => i.id !== itemId) ?? [],
    })
  }

  const handleSaveMeal = async () => {
    if (!currentMeal || !currentMeal.id) return
    await mealStore.update(currentMeal.id, {
      name: currentMeal.name,
      items: currentMeal.items,
    })
    setCurrentMeal(null)
  }

  const handleDeleteMeal = async (id: string) => {
    await mealStore.removeWithUndo(id)
  }

  const handleUndo = (deleteId: string) => {
    mealStore.restoreDeleted(deleteId)
  }

  const handleDismissUndo = (deleteId: string) => {
    setDismissedIds((prev) => new Set(prev).add(deleteId))
  }

  return (
    <PageContainer>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-950 dark:text-[#FDFDFD]">Meal Builder</h1>
        <Button variant="outline" size="sm" onClick={() => setShowEditor((v) => !v)}>
          {showEditor ? 'Done Editing' : 'Edit Foods'}
        </Button>
      </div>

      {showEditor ? (
        <Card title="Food Macro Editor">
          <FoodMacroEditor />
        </Card>
      ) : (
      <div className="space-y-6">
        <div className="mb-2 flex items-center justify-between">
          <Button size="sm" variant="outline" onClick={handlePreviousDay} className="flex gap-2 items-center">
            &larr; Prev
          </Button>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                const input = document.getElementById('meal-date-picker') as HTMLInputElement
                if (input) input.showPicker?.() ?? input.click()
              }}
              className="text-sm font-medium text-slate-950 hover:text-neutral-700 dark:text-[#FDFDFD]"
            >
              {formattedDate}
            </button>
            <input
              id="meal-date-picker"
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="sr-only"
            />
            {!isToday && (
              <Button size="sm" variant="outline" onClick={handleToday}>
                Today
              </Button>
            )}
          </div>
          <Button size="sm" variant="outline" onClick={handleNextDay} disabled={isToday}>
            Next &rarr;
          </Button>
        </div>

        <UndoBanner
          entries={mealStore.deletedMeals}
          dismissedIds={dismissedIds}
          onDismiss={handleDismissUndo}
          onUndo={handleUndo}
        />

        <Card title="New Meal">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <input
              type="text"
              className="flex-1 border border-slate-200 dark:border-[#2D2D2D] px-3 py-2 text-sm dark:bg-[#1F1F1F] dark:text-[#FDFDFD]"
              value={mealNameInput}
              onChange={(e) => setMealNameInput(e.target.value)}
              placeholder="Meal name"
            />
            <Button onClick={handleCreateMeal} className="w-full sm:w-auto dark:bg-[#FDFDFD] dark:text-[#111111]">Create</Button>
          </div>
        </Card>

        {currentMeal && (
          <div className="border border-[#2D2D2D] bg-[#1F1F1F] p-5">
            <h3 className="mb-3 text-sm font-semibold text-[#FDFDFD]">{currentMeal.name}</h3>
            <AddItem onAdd={handleAddItem} />
            <div className="mt-4 space-y-2">
              {currentMeal.items?.map((item) => (
                <div key={item.id} className="flex items-center justify-between border border-[#2D2D2D] bg-[#111111] p-2">
                  <div>
                    <p className="text-sm font-medium text-[#FDFDFD]">{item.foodId}</p>
                    <p className="text-xs text-[#FDFDFD]/60">{item.quantity} {item.unit}</p>
                  </div>
                  <Button size="sm" variant="ghost" className="text-red-400" onClick={() => handleRemoveItem(item.id)}>
                    Remove
                  </Button>
                </div>
              ))}
            </div>
            <div className="mt-4 flex items-center gap-2">
              <Button onClick={handleSaveMeal} className='dark:bg-[#FDFDFD] dark:text-[#111111]'>Save Meal</Button>
              <Button onClick={() => setCurrentMeal(null)} variant="outline">
                Cancel
              </Button>
            </div>
          </div>
        )}

        <Card title="Meals">
          {mealStore.meals.length === 0 ? (
            <p className="text-sm text-[#FDFDFD]/60">No meals for this day</p>
          ) : (
            <div className="space-y-2">
              {mealStore.meals.map((meal) => (
                <MealCard
                  key={meal.id}
                  meal={meal}
                  onAddItem={() => setCurrentMeal(meal)}
                  onDelete={() => handleDeleteMeal(meal.id)}
                />
              ))}
            </div>
          )}
        </Card>
      </div>
      )}
    </PageContainer>
  )
}

export default MealBuilder
