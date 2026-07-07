import type { Nutrition } from './nutrition'

export type FoodID = string

export type FoodSource = 'IFCT' | 'USDA' | 'FSSAI' | 'Brand' | 'Custom'

export interface FoodMeasure {
  /** Optional measure id, e.g., 'm:cup' */
  id?: string
  /** Human readable label, e.g., '1 medium (182g)' */
  label: string
  /** Quantity value in the given unit (e.g., 1) */
  quantity: number
  /** Unit of the measure (e.g., 'g', 'cup', 'piece') */
  unit: string
  /** Approximate grams equivalent when available (helps calculations) */
  grams?: number
}

export interface FoodBase {
  id: FoodID
  name: string
  /** Optional brand or author */
  brand?: string
  /** Category ID (optional) */
  category?: string
  /** canonical serving size (number) */
  servingSize?: number
  /** serving unit, e.g. 'g', 'ml', 'serving' */
  servingUnit?: string
  /** Optional alternative measures (cup, piece, tbsp) */
  measures?: FoodMeasure[]
  isCustom?: boolean
  isDiscrete?: boolean
  source?: FoodSource
  sourceReference?: string
  createdAt?: string
  updatedAt?: string
}

export interface Food extends FoodBase {
  /** Nutrition per serving */
  nutrition: Nutrition
  aliases?: string[]
  notes?: string
  tags?: string[]
}
