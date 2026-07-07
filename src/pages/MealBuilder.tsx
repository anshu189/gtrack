import { useState, useEffect } from 'react'
import type { Food, Meal, MealItem } from '@/types'
import { useMealStore } from '@/stores/mealStore'
import { MealCard, AddItem } from '@/components/meal'
import { Button } from '@/components/ui/button'
import { PageContainer } from '@/components/ui/page-container'
import { Card } from '@/components/ui/card'

const MealBuilder = () => {
  const mealStore = useMealStore()
  const [currentMeal, setCurrentMeal] = useState<Partial<Meal> | null>(null)
  const [mealNameInput, setMealNameInput] = useState('')

  useEffect(() => {
    mealStore.loadAll()
  }, [])

  const handleCreateMeal = async () => {
    const created = await mealStore.create({
      name: mealNameInput || 'Meal',
      loggedAt: new Date().toISOString(),
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
    await mealStore.remove(id)
  }

  return (
    <PageContainer>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-950">Meal Builder</h1>
      </div>

      <div className="space-y-6">
        <Card title="New Meal">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <input
              type="text"
              className="flex-1 border border-slate-200 px-3 py-2 text-sm"
              value={mealNameInput}
              onChange={(e) => setMealNameInput(e.target.value)}
              placeholder="Meal name"
            />
            <Button onClick={handleCreateMeal} className="w-full sm:w-auto">Create</Button>
          </div>
        </Card>

        {currentMeal && (
          <div className="border border-black bg-white p-5">
            <h3 className="mb-3 text-sm font-semibold text-slate-950">{currentMeal.name}</h3>
            <AddItem onAdd={handleAddItem} />
            <div className="mt-4 space-y-2">
              {currentMeal.items?.map((item) => (
                <div key={item.id} className="flex items-center justify-between border border-slate-200 bg-white p-2">
                  <div>
                    <p className="text-sm font-medium text-slate-950">{item.foodId}</p>
                    <p className="text-xs text-slate-500">{item.quantity} {item.unit}</p>
                  </div>
                  <Button size="sm" variant="ghost" className="text-red-600 dark:text-red-400" onClick={() => handleRemoveItem(item.id)}>
                    Remove
                  </Button>
                </div>
              ))}
            </div>
            <div className="mt-4 flex items-center gap-2">
              <Button onClick={handleSaveMeal}>Save Meal</Button>
              <Button onClick={() => setCurrentMeal(null)} variant="outline">
                Cancel
              </Button>
            </div>
          </div>
        )}

        <Card title="Recent Meals">
          {mealStore.meals.length === 0 ? (
            <p className="text-sm text-slate-500">No meals yet</p>
          ) : (
            <div className="space-y-2">
              {mealStore.meals.slice(-5).map((meal) => (
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
    </PageContainer>
  )
}

export default MealBuilder
