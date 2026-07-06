import React, { useState, useEffect } from 'react'
import type { Food, Meal, MealItem } from '@/types'
import { useMealStore } from '@/stores/mealStore'
import { useMealAutoComplete } from '@/hooks/useMealAutoComplete'
import { mealAutoCompletionService } from '@/lib/services/mealAutoCompletion'
import { MealCard, AddItem } from '@/components/meal'
import { Button } from '@/components/ui/button'
import { PageContainer } from '@/components/ui/page-container'
import { Section } from '@/components/ui/section'

const MealBuilder: React.FC = () => {
  const mealStore = useMealStore()
  const [currentMeal, setCurrentMeal] = useState<Partial<Meal> | null>(null)
  const [mealNameInput, setMealNameInput] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const { suggestions, loading: suggestionsLoading } = useMealAutoComplete(mealNameInput)

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
    setShowSuggestions(false)
  }

  const handleAddItem = (payload: { food: Food; quantity: number; unit?: string }) => {
    if (!currentMeal) return
    const item: MealItem = {
      id: `item:${Date.now()}-${Math.random()}`,
      foodId: payload.food.id,
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

  const handleSelectSuggestion = async (name: string) => {
    setMealNameInput(name)
    setShowSuggestions(false)
    // Optionally duplicate the meal template
    const template = await mealAutoCompletionService.getMealTemplate(name)
    if (template) {
      setCurrentMeal({
        name: template.name,
        items: template.items.map((i) => ({ ...i, id: `item:${Date.now()}-${Math.random()}` })),
      })
    }
  }

  return (
    <PageContainer>
      <Section title="Meal Builder">
        {/* Create new meal */}
        <div className="p-3 border border-gray-200 rounded-sm bg-white mb-4">
          <h3 className="text-sm font-medium mb-2">New Meal</h3>
          <div className="flex items-center gap-2 mb-2">
            <input
              type="text"
              className="flex-1 px-3 py-2 border border-gray-200 rounded-sm text-sm"
              value={mealNameInput}
              onChange={(e) => {
                setMealNameInput(e.target.value)
                setShowSuggestions(true)
              }}
              placeholder="Meal name"
            />
            <Button onClick={handleCreateMeal}>Create</Button>
          </div>

          {/* Auto-complete suggestions */}
          {showSuggestions && mealNameInput && (
            <div className="mb-2 p-2 border border-gray-100 rounded-sm bg-gray-50">
              {suggestionsLoading && <div className="text-xs text-gray-500">Loading...</div>}
              {!suggestionsLoading && suggestions.length === 0 && (
                <div className="text-xs text-gray-500">No suggestions</div>
              )}
              <ul className="flex flex-col gap-1">
                {suggestions.map((s) => (
                  <li key={s.name} className="text-xs p-1 hover:bg-white rounded cursor-pointer">
                    <button
                      className="w-full text-left"
                      onClick={() => handleSelectSuggestion(s.name)}
                    >
                      {s.name} <span className="text-gray-400">({s.frequency}x)</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Current meal being edited */}
        {currentMeal && (
          <div className="p-3 border border-blue-200 rounded-sm bg-blue-50 mb-4">
            <h3 className="text-sm font-medium mb-2">{currentMeal.name}</h3>
            <AddItem onAdd={handleAddItem} />
            <div className="mt-3 flex flex-col gap-2">
              {currentMeal.items?.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-2 border border-gray-100 rounded-sm">
                  <div>
                    <div className="text-sm">{item.foodId}</div>
                    <div className="text-xs text-gray-600">{item.quantity} {item.unit}</div>
                  </div>
                  <Button size="sm" variant="secondary" onClick={() => handleRemoveItem(item.id)}>
                    Remove
                  </Button>
                </div>
              ))}
            </div>
            <div className="mt-3 flex items-center gap-2">
              <Button onClick={handleSaveMeal}>Save Meal</Button>
              <Button onClick={() => setCurrentMeal(null)} variant="outline">
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Recent meals */}
        <h3 className="text-sm font-medium mb-2">Recent Meals</h3>
        <div className="flex flex-col gap-2">
          {mealStore.meals.length === 0 ? (
            <div className="text-xs text-gray-500">No meals yet</div>
          ) : (
            mealStore.meals.slice(-5).map((meal) => (
              <MealCard
                key={meal.id}
                meal={meal}
                onAddItem={() => setCurrentMeal(meal)}
                onDelete={() => handleDeleteMeal(meal.id)}
              />
            ))
          )}
        </div>
      </Section>
    </PageContainer>
  )
}

export default MealBuilder
