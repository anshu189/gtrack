import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import type { Food, Meal, MealItem } from '@/types'
import { useMealStore } from '@/stores/mealStore'
import { MealCard, AddItem, QuantityPicker, FoodMacroEditor, UndoBanner } from '@/components/meal'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button, Card, DatePicker, IconButton, TextField } from '@/components/ds'
import { cleanForFirestore } from '@/lib/utils/firestore'

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
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set())
  const [editItemId, setEditItemId] = useState<string | null>(null)

  const today = getTodayIso()
  const isToday = selectedDate === today

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

  const handleCreateMeal = () => {
    const name = mealNameInput.trim()
    if (!name) return
    const id = `meal:${Date.now()}-${Math.floor(Math.random() * 10000)}`
    const meal: Meal = {
      id,
      name,
      loggedAt: `${selectedDate}T12:00:00Z`,
      items: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    setCurrentMeal(meal)
    setMealNameInput('')
  }

  const handleAddItem = (payload: { food: Food; quantity: number; unit?: string; gramsPerUnit: number }) => {
    if (!currentMeal) return
    const item: MealItem = {
      id: `item:${Date.now()}-${Math.random()}`,
      foodId: payload.food.id,
      name: payload.food.name,
      quantity: payload.quantity,
      unit: payload.unit,
      nutrition: payload.food.nutrition,
      gramsPerUnit: payload.gramsPerUnit,
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
    const existing = mealStore.meals.find((m) => m.id === currentMeal.id)
    if (existing) {
      await mealStore.update(currentMeal.id, cleanForFirestore({
        name: currentMeal.name,
        loggedAt: currentMeal.loggedAt,
        items: currentMeal.items,
        notes: currentMeal.notes,
      }))
    } else {
      await mealStore.create(cleanForFirestore({
        id: currentMeal.id,
        name: currentMeal.name,
        loggedAt: currentMeal.loggedAt,
        items: currentMeal.items,
        notes: currentMeal.notes,
        createdAt: currentMeal.createdAt,
      }))
    }
    setCurrentMeal(null)
  }

  const handleEditItem = (itemId: string) => {
    setEditItemId(itemId)
  }

  const handleSaveItem = () => {
    if (!editItemId || !currentMeal) return
    setEditItemId(null)
  }

  const handleCancelEdit = () => {
    setEditItemId(null)
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
    <>
      <div className="mb-5 flex items-center justify-between gap-4">
        <h1 className="title-1 text-black">Meals</h1>
        <Button variant="ghost" size="sm" onClick={() => setShowEditor((v) => !v)}>
          {showEditor ? 'Done editing' : 'Edit foods'}
        </Button>
      </div>

      {showEditor ? (
        <Card>
          <FoodMacroEditor />
        </Card>
      ) : (
      <div className="flex flex-col gap-3">
        {/* Date navigation. The old centre pill hid a date input behind
            an invisible overlay; the DS picker owns its own popover instead. */}
        <div className="mb-5 flex items-center gap-2">
          <IconButton
            label="Previous day"
            icon={<ChevronLeft size={20} />}
            onClick={handlePreviousDay}
          />
          <DatePicker
            label="Select date"
            value={selectedDate}
            onChange={setSelectedDate}
            max={today}
            fullWidth
            className="flex-1"
          />
          <IconButton
            label="Next day"
            icon={<ChevronRight size={20} />}
            onClick={handleNextDay}
            disabled={isToday}
            className="disabled:bg-surface-2 disabled:opacity-40"
          />
        </div>

        <UndoBanner
          entries={mealStore.deletedMeals}
          dismissedIds={dismissedIds}
          onDismiss={handleDismissUndo}
          onUndo={handleUndo}
        />

        {/* New meal. The DS TextField's inline action is disabled until there
            is input, which is exactly the meal-name-required rule. */}
        <Card>
          <p className="title-2 mb-4 text-black">New meal</p>
          <TextField
            label="Meal name"
            isLabelHidden
            value={mealNameInput}
            onChange={(e) => setMealNameInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && mealNameInput.trim()) {
                e.preventDefault()
                handleCreateMeal()
              }
            }}
            placeholder="Meal name"
            action={{
              label: 'Create',
              onClick: handleCreateMeal,
              disabled: !mealNameInput.trim(),
            }}
          />
        </Card>

        {/* Current meal being edited */}
        {currentMeal && (
          <div className="rounded-lg border border-line bg-surface p-5">
            <p className="text-base font-semibold text-black mb-3">{currentMeal.name}</p>
            <AddItem onAdd={handleAddItem} />
            <div className="mt-4 space-y-2">
              {currentMeal.items?.map((item) => {
                if (editItemId === item.id) {
                  return (
                    <div key={item.id} className="rounded-lg border border-line bg-surface-2 p-3">
                      <p className="text-base font-semibold text-black mb-2">Edit Item</p>
                      <QuantityPicker
                        value={item.quantity}
                        unit={item.unit}
                        onChange={(v, u) => {
                          // Update item quantity/unit in state
                          setCurrentMeal({
                            ...currentMeal,
                            items: currentMeal.items?.map((i) =>
                              i.id === item.id ? { ...i, quantity: v, unit: u } : i
                            ) ?? [],
                          })
                        }}
                      />
                      <div className="mt-3 flex items-center gap-2">
                        <button
                          type="button"
                          onClick={handleSaveItem}
                          className="flex-1 py-2 text-sm font-medium bg-ink text-on-ink hover:opacity-90 transition-colors"
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          onClick={handleCancelEdit}
                          className="flex-1 py-2 text-sm font-medium border border-line text-black hover:bg-surface transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )
                }
                return (
                  <div key={item.id} className="rounded-lg border border-line bg-surface-2 p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-black">{item.name}</span>
                      <span className="text-sm text-ink-2">{item.quantity} {item.unit}</span>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(item.id)}
                          className="py-1.5 rounded-sm px-2 text-xs text-protein hover:bg-surface-2 transition-colors"
                        >
                          Remove
                        </button>
                        <button
                          type="button"
                          onClick={() => handleEditItem(item.id)}
                          className="py-1.5 rounded-sm px-2 text-xs text-accent hover:bg-surface-2 transition-colors"
                        >
                          Edit
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
            <div className="mt-4 flex items-center gap-2">
              <button
                type="button"
                onClick={handleSaveMeal}
                className="min-w-0 flex-1 rounded-lg py-2.5 text-sm font-medium bg-ink text-on-ink hover:opacity-90 transition-colors"
              >
                Save Meal
              </button>
              <button
                type="button"
                onClick={() => setCurrentMeal(null)}
                className="min-w-0 flex-1 rounded-lg py-2.5 text-sm font-medium border border-line text-black hover:bg-surface transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Meals list */}
        <div className="rounded-lg border border-line bg-surface p-5">
          <p className="text-base font-semibold text-black mb-3">Meals</p>
          {mealStore.meals.length === 0 ? (
            <p className="text-sm text-ink-2">No meals for this day</p>
          ) : (
            <div className="space-y-4">
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
        </div>
      </div>
      )}
    </>
  )
}

export default MealBuilder
