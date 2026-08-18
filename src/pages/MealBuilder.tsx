import { useState, useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import type { Food, Meal, MealItem } from '@/types'
import { useMealStore } from '@/stores/mealStore'
import { MealCard, AddItem, QuantityPicker, FoodMacroEditor, UndoBanner } from '@/components/meal'
import { PageContainer } from '@/components/ui/page-container'
import { DateInput } from '@astryxdesign/core'
import { cleanForFirestore } from '@/lib/utils/firestore'

function getTodayIso() {
  return new Date().toISOString().split('T')[0]
}

const MealBuilder = () => {
  const location = useLocation()
  const mealStore = useMealStore()
  const dateInputRef = useRef<HTMLInputElement>(null)
  const [currentMeal, setCurrentMeal] = useState<Partial<Meal> | null>(null)
  const [mealNameInput, setMealNameInput] = useState('')
  const [showEditor, setShowEditor] = useState(false)
  const [selectedDate, setSelectedDate] = useState<string>(
    (location.state as any)?.date ?? getTodayIso()
  )
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set())
  const [editItemId, setEditItemId] = useState<string | null>(null)

  const isToday = selectedDate === getTodayIso()

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

  const formattedDate = new Date(`${selectedDate}T12:00:00`).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })

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
    <PageContainer>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-lg font-bold text-[var(--color-text)]">Meal Builder</h1>
        <button 
          type="button" 
          onClick={() => setShowEditor((v) => !v)}
          className="py-2 px-4 rounded-lg text-sm font-medium border transition-colors
              bg-transparent border-[var(--color-border)] text-[var(--color-text)]
              hover:bg-[var(--color-surface)]"
          >
          {showEditor ? 'Done Editing' : 'Edit Foods'}
        </button>
      </div>

      {showEditor ? (
        <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
          <FoodMacroEditor />
        </div>
      ) : (
      <div className="space-y-4">
        {/* Date navigation pills */}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handlePreviousDay}
            className="flex-1 py-2.5 px-2 rounded-lg text-sm font-medium border transition-colors
              bg-transparent border-[var(--color-border)] text-[var(--color-text)]
              hover:bg-[var(--color-surface)]"
          >
            Prev
          </button>
          <div className="relative flex-1">
            <button
              type="button"
              onClick={() => dateInputRef.current?.click()}
              className="relative z-10 w-full py-2.5 px-4 rounded-lg text-sm font-medium border transition-colors
                bg-[var(--color-text)] text-[var(--color-bg)] border-[var(--color-text)]
                hover:opacity-90"
            >
              {formattedDate}
            </button>
            <DateInput
              ref={dateInputRef}
              label="Select date"
              isLabelHidden
              value={selectedDate as `${number}${number}${number}${number}-${number}${number}-${number}${number}`}
              onChange={(val) => { if (val) setSelectedDate(val) }}
              size="sm"
              className="absolute inset-0 opacity-0"
            />
          </div>
          <button
            type="button"
            onClick={handleNextDay}
            disabled={isToday}
            className="flex-1 py-2.5 px-2 rounded-lg text-sm font-medium border transition-colors
              bg-transparent border-[var(--color-border)] text-[var(--color-text)]
              hover:bg-[var(--color-surface)] disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>

        <UndoBanner
          entries={mealStore.deletedMeals}
          dismissedIds={dismissedIds}
          onDismiss={handleDismissUndo}
          onUndo={handleUndo}
        />

        {/* New Meal */}
        <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
          <p className="text-base font-semibold text-[var(--color-text)] mb-3">New Meal</p>
          <input
            type="text"
            className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2.5 text-sm text-[var(--color-text)] placeholder-[var(--color-muted)]"
            value={mealNameInput}
            onChange={(e) => setMealNameInput(e.target.value)}
            placeholder="Meal name"
          />
          <button
            type="button"
            onClick={handleCreateMeal}
            disabled={!mealNameInput.trim()}
            className="mt-3 w-full rounded-lg py-2.5 rounded-lg text-sm font-medium border transition-colors
                bg-[var(--color-text)] text-[var(--color-bg)] border-[var(--color-text)]
                hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Create
          </button>
        </div>

        {/* Current meal being edited */}
        {currentMeal && (
          <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
            <p className="text-base font-semibold text-[var(--color-text)] mb-3">{currentMeal.name}</p>
            <AddItem onAdd={handleAddItem} />
            <div className="mt-4 space-y-2">
              {currentMeal.items?.map((item) => {
                if (editItemId === item.id) {
                  return (
                    <div key={item.id} className="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] p-3">
                      <p className="text-base font-semibold text-[var(--color-text)] mb-2">Edit Item</p>
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
                          className="flex-1 py-2 text-sm font-medium bg-[var(--color-text)] text-[var(--color-bg)] hover:opacity-90 transition-colors"
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          onClick={handleCancelEdit}
                          className="flex-1 py-2 text-sm font-medium border border-[var(--color-border)] text-[var(--color-text)] hover:bg-[var(--color-surface)] transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )
                }
                return (
                  <div key={item.id} className="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-[var(--color-text)]">{item.name}</span>
                      <span className="text-sm text-[var(--color-muted)]">{item.quantity} {item.unit}</span>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(item.id)}
                          className="py-1.5 rounded-sm px-2 text-xs text-[var(--color-error)] hover:bg-[var(--color-surface-alt)] transition-colors"
                        >
                          Remove
                        </button>
                        <button
                          type="button"
                          onClick={() => handleEditItem(item.id)}
                          className="py-1.5 rounded-sm px-2 text-xs text-[var(--color-accent)] hover:bg-[var(--color-surface-alt)] transition-colors"
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
                className="flex-1 rounded-lg py-2.5 text-sm font-medium bg-[var(--color-text)] text-[var(--color-bg)] hover:opacity-90 transition-colors"
              >
                Save Meal
              </button>
              <button
                type="button"
                onClick={() => setCurrentMeal(null)}
                className="flex-1 rounded-lg py-2.5 text-sm font-medium border border-[var(--color-border)] text-[var(--color-text)] hover:bg-[var(--color-surface)] transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Meals list */}
        <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
          <p className="text-base font-semibold text-[var(--color-text)] mb-3">Meals</p>
          {mealStore.meals.length === 0 ? (
            <p className="text-sm text-[var(--color-muted)]">No meals for this day</p>
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
    </PageContainer>
  )
}

export default MealBuilder
