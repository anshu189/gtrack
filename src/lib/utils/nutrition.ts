import type { Food } from '@/types/food'
import type { MealItem } from '@/types/meal'
import type { Nutrition } from '@/types/nutrition'

export const DEFAULT_GRAMS_PER_UNIT: Record<string, number> = {
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

/**
 * Totals for a list of meal items, in grams and kcal.
 *
 * Every item's stored nutrition is per 100g, so each one is scaled by its own
 * grams before adding. Pulled out of the three screens that were each doing
 * this inline, which is how they drifted apart in the first place.
 */
export function mealTotals(items?: MealItem[]) {
  return (items ?? []).reduce(
    (sum, item) => {
      const multiplier = mealItemGrams(item) / 100
      const n = item.nutrition
      return {
        calories: sum.calories + (n?.calories ?? 0) * multiplier,
        protein: sum.protein + (n?.protein ?? 0) * multiplier,
        carbs: sum.carbs + (n?.carbs ?? 0) * multiplier,
        fat: sum.fat + (n?.fat ?? 0) * multiplier,
      }
    },
    { calories: 0, protein: 0, carbs: 0, fat: 0 },
  )
}

/**
 * Grams for a quantity of a food in a given unit.
 *
 * This is the single source of truth for unit -> grams. The conversion used to
 * be reimplemented at each call site, and the copies disagreed: one ignored the
 * unit entirely, another read a measure's TOTAL grams as if it were grams per
 * unit, and a third fell back to 1g per piece. Always go through this.
 */
export function gramsFor(food: Food, quantity: number, unit: string): number {
  return quantity * computeGramsPerUnit(food, unit)
}

/**
 * Nutrition is stored per 100g. Scale a stored value to an actual amount.
 */
export function scaleNutrition<T extends Nutrition>(per100: T, grams: number): Nutrition {
  const factor = grams / 100
  return {
    calories: round2(per100.calories * factor),
    protein: round2(per100.protein * factor),
    carbs: round2(per100.carbs * factor),
    fat: round2(per100.fat * factor),
    fiber: per100.fiber === undefined ? undefined : round2(per100.fiber * factor),
  }
}

/**
 * Inverse of scaleNutrition: take values the user entered FOR A SERVING and
 * express them per 100g, which is how they are stored.
 *
 * Deliberately unrounded. This value goes to the database, and rounding it to
 * two decimals makes the serving drift on the way back — 10 kcal per 300ml
 * stored as 3.33 reads back as 9.99. Round at display, never in storage.
 */
export function toPer100(perServing: Nutrition, grams: number): Nutrition {
  if (grams <= 0) return { ...perServing }
  const factor = 100 / grams
  return {
    calories: perServing.calories * factor,
    protein: perServing.protein * factor,
    carbs: perServing.carbs * factor,
    fat: perServing.fat * factor,
    fiber: perServing.fiber === undefined ? undefined : perServing.fiber * factor,
  }
}

function round2(n: number): number {
  return Math.round(n * 100) / 100
}
