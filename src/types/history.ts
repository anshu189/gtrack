import type { Meal, MealID } from './meal'
import type { Nutrition } from './nutrition'

export type HistoryID = string

/** Snapshot of a meal stored in history to preserve nutrition at the time */
export interface MealHistoryEntry {
  id: HistoryID
  type: 'meal'
  mealId: MealID
  /** Snapshot of the meal at time of logging */
  mealSnapshot: Meal
  totals?: Nutrition
  loggedAt: string
  createdAt?: string
}

export interface HistoryWeightEntry {
  id: HistoryID
  type: 'weight'
  weightKg: number
  loggedAt: string
  createdAt?: string
}

export type HistoryEntry = MealHistoryEntry | HistoryWeightEntry
