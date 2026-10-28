import { useState, useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import type { Food, Meal, MealItem } from '@/types'
import { useMealStore } from '@/stores/mealStore'
import { useSettingsStore } from '@/stores/settingsStore'
import { MealCard, AddItem, QuantityPicker, FoodMacroEditor, UndoBanner, SupplementsRow } from '@/components/meal'
import { Button, Card, DatePicker, Icon, IconButton, TextField } from '@/components/ds'
import { cleanForFirestore } from '@/lib/utils/firestore'
import { regularMeals } from '@/lib/utils/supplements'

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
  const editSectionRef = useRef<HTMLDivElement | null>(null)

  const startEditingMeal = (meal: Meal) => {
    setCurrentMeal(meal)
    // Bring the meal's own editor into view, not the page top — the date pills
    // and New meal card above it are not what you just asked for. The delay
    // lets the editor render first; measuring it on the same frame gives the
    // pre-render position and the scroll goes nowhere.
    window.setTimeout(() => {
      editSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 200)
  }

  const today = getTodayIso()
  const isToday = selectedDate === today
  const meals = regularMeals(mealStore.meals)
  const showSupplements = useSettingsStore((s) => s.settings?.showSupplements) !== false

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
            icon={<Icon name="chevron-left" size={20} />}
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
            icon={<Icon name="chevron-right" size={20} />}
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
          // scroll-mt clears the sticky header when scrolled into view.
          <div ref={editSectionRef} className="scroll-mt-28 rounded-lg bg-surface p-5 shadow-card">
            <p className="mb-3 title-2 text-black">{currentMeal.name}</p>
            <AddItem onAdd={handleAddItem} />
            <div className="mt-4 space-y-2">
              {currentMeal.items?.map((item) => {
                if (editItemId === item.id) {
                  return (
                    <div key={item.id} className="rounded-md bg-surface-2 p-3">
                      <p className="mb-2 title-2 text-black">Edit item</p>
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
                        <Button size="sm" className="h-11 min-w-0 flex-1" onClick={handleSaveItem}>
                          Save
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          className="h-11 min-w-0 flex-1"
                          onClick={handleCancelEdit}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )
                }
                return (
                  <div key={item.id} className="rounded-md bg-surface-2 p-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="min-w-0 flex-1 truncate footnote text-black">{item.name}</span>
                      <span className="shrink-0 caption text-ink-2">{item.quantity} {item.unit}</span>
                      <div className="flex shrink-0 items-center gap-1">
                        <IconButton
                          variant="ghost"
                          size={32}
                          label={`Edit ${item.name}`}
                          icon={<Icon name="pencil" size={15} />}
                          onClick={() => handleEditItem(item.id)}
                        />
                        <IconButton
                          variant="ghost"
                          size={32}
                          label={`Remove ${item.name}`}
                          icon={<Icon name="trash" size={15} />}
                          className="hover:text-protein"
                          onClick={() => handleRemoveItem(item.id)}
                        />
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
            <div className="mt-4 flex items-center gap-2">
              <Button size="sm" className="h-11 min-w-0 flex-1" onClick={handleSaveMeal}>
                Save Meal
              </Button>
              <Button
                variant="secondary"
                size="sm"
                className="h-11 min-w-0 flex-1"
                onClick={() => setCurrentMeal(null)}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Meals list. The day's supplements are a document in the same
            collection; they show as the pinned row below, never as a meal. */}
        <Card>
          <p className="mb-3 title-2 text-black">Meals</p>
          {meals.length === 0 ? (
            <p className="footnote text-ink-2">No meals for this day</p>
          ) : (
            <div className="space-y-4">
              {meals.map((meal) => (
                <MealCard
                  key={meal.id}
                  meal={meal}
                  onAddItem={() => startEditingMeal(meal)}
                  onDelete={() => handleDeleteMeal(meal.id)}
                />
              ))}
            </div>
          )}
          {/* The full row: counters plus Edit, Remove and Add supplement. */}
          {showSupplements && (
            <div className="mt-4">
              <SupplementsRow date={selectedDate} manage />
            </div>
          )}
        </Card>
      </div>
      )}
    </>
  )
}

export default MealBuilder
