import type { Food } from '@/types/food'
import type { MealItem } from '@/types/meal'

const DEFAULT_GRAMS_PER_UNIT: Record<string, number> = {
  piece: 50,
  cup: 240,
  tbsp: 15,
  tsp: 5,
  slice: 30,
}

/**
 * Compute grams-per-unit from a food's measures array.
 * For 'g' or 'ml', returns 1 (quantity is already grams).
 * For 'piece', 'cup', etc., looks up food.measures for the matching unit.
 * Falls back to hardcoded defaults if no measure found.
 */
export function computeGramsPerUnit(food: Food, unit: string): number {
  if (unit === 'g' || unit === 'ml') return 1

  const measure = food.measures?.find((m) => m.unit === unit)
  if (measure?.grams && measure.quantity > 0) {
    return measure.grams / measure.quantity
  }

  return DEFAULT_GRAMS_PER_UNIT[unit] ?? 1
}

/**
 * Convert a MealItem's quantity to grams using its stored gramsPerUnit.
 * For 'g'/'ml' units gramsPerUnit is 1, so quantity passes through.
 */
export function mealItemGrams(item: MealItem): number {
  return (item.quantity ?? 100) * (item.gramsPerUnit ?? 1)
}
