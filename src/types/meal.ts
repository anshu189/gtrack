import type { FoodID } from './food'
import type { Nutrition } from './nutrition'

export type MealID = string

export interface MealItem {
  id: string
  foodId: FoodID
  /** Human-readable food name (cached from Food at creation time) */
  name?: string
  /** quantity in the unit specified (e.g., 100) */
  quantity: number
  /** unit, ideally matches Food.servingUnit (e.g., 'g') */
  unit?: string
  note?: string
  /** Optional cached nutrition snapshot for the item */
  nutrition?: Nutrition
}

export interface Meal {
  id: MealID
  name?: string
  /** ISO date/time when meal was consumed or logged */
  loggedAt: string
  items: MealItem[]
  notes?: string
  createdAt?: string
  updatedAt?: string
  /** Optional cached totals */
  totals?: Nutrition
}
