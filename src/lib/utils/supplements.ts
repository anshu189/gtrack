import type { Meal, MealItem, Nutrition, Supplement, SupplementUnit } from '@/types'
import { formatNum } from '@/lib/utils/format'

/** One document per day holds the Supplements row, so its id is the date. */
export function supplementLogId(date: string): string {
  return `meal:supplements:${date}`
}

export function isSupplementLog(meal: Meal): boolean {
  return meal.kind === 'supplements'
}

/** Ordinary meals only — what the meal lists show and count. */
export function regularMeals(meals: Meal[]): Meal[] {
  return meals.filter((m) => !isSupplementLog(m))
}

export const SUPPLEMENT_UNITS: { value: SupplementUnit; label: string; plural: string }[] = [
  { value: 'scoop', label: 'scoop', plural: 'scoops' },
  { value: 'g', label: 'g', plural: 'g' },
  { value: 'ml', label: 'ml', plural: 'ml' },
  { value: 'capsule', label: 'capsule', plural: 'capsules' },
  { value: 'tablet', label: 'tablet', plural: 'tablets' },
  { value: 'serving', label: 'serving', plural: 'servings' },
]

/** Grams and millilitres are already weights; their unit is one gram. */
export function isMassUnit(unit: SupplementUnit | string | undefined): boolean {
  return unit === 'g' || unit === 'ml'
}

/** One tap of +: half a scoop, a whole capsule, one gram. */
export function defaultStep(unit: SupplementUnit): number {
  if (unit === 'scoop' || unit === 'serving') return 0.5
  if (unit === 'ml') return 5
  return 1
}

/** "1 scoop", "1.5 scoops", "5g", "2 capsules". Grams attach, per DS rules. */
export function formatSupplementAmount(quantity: number, unit: SupplementUnit | string | undefined): string {
  const def = SUPPLEMENT_UNITS.find((u) => u.value === unit)
  const n = formatNum(quantity)
  if (!def) return `${n} ${unit ?? ''}`.trim()
  if (isMassUnit(def.value)) return `${n}${def.label}`
  return `${n} ${quantity === 1 ? def.label : def.plural}`
}

/** "per scoop", "per g". */
export function perUnitLabel(unit: SupplementUnit): string {
  return `per ${SUPPLEMENT_UNITS.find((u) => u.value === unit)?.label ?? unit}`
}

/**
 * The day's log entry for a supplement. Macros are snapshotted per 100g with
 * the unit's grams, exactly like a meal item, so every existing total adds it
 * up unchanged — and editing the supplement later never rewrites past days.
 */
export function supplementItem(supplement: Supplement, quantity: number): MealItem {
  const grams = supplement.gramsPerUnit > 0 ? supplement.gramsPerUnit : 1
  const per100 = (v: number | undefined) => ((v ?? 0) * 100) / grams
  const n = supplement.nutrition
  const nutrition: Nutrition = {
    calories: per100(n.calories),
    protein: per100(n.protein),
    carbs: per100(n.carbs),
    fat: per100(n.fat),
  }
  return {
    id: supplement.id,
    foodId: supplement.id,
    name: supplement.name,
    quantity,
    unit: supplement.unit,
    gramsPerUnit: grams,
    nutrition,
  }
}

/** How much of each supplement a day's log holds, keyed by supplement id. */
export function quantitiesFrom(log: Meal | undefined): Record<string, number> {
  const out: Record<string, number> = {}
  for (const item of log?.items ?? []) out[item.foodId] = item.quantity ?? 0
  return out
}

/**
 * Rebuilds a day's items from the quantities, in row order. Supplements that
 * are no longer on the row keep whatever was logged for them.
 */
export function buildSupplementItems(
  supplements: Supplement[],
  quantities: Record<string, number>,
  previous: MealItem[] = [],
): MealItem[] {
  const known = new Set(supplements.map((s) => s.id))
  const items: MealItem[] = []
  for (const s of supplements) {
    const q = quantities[s.id] ?? 0
    if (q > 0) items.push(supplementItem(s, q))
  }
  for (const item of previous) {
    if (!known.has(item.foodId) && (item.quantity ?? 0) > 0) items.push(item)
  }
  return items
}
