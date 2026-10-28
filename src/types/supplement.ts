import type { Nutrition } from './nutrition'

export type SupplementID = string

/** What the counter on the Supplements row counts. */
export type SupplementUnit = 'scoop' | 'g' | 'ml' | 'capsule' | 'tablet' | 'serving'

/**
 * A supplement the user keeps on their pinned Supplements row.
 *
 * Kept apart from `foods` on purpose: supplements are logged from their own
 * fixed row with a counter, and must never turn up in the meal food search.
 * Per user, like custom foods — every account is seeded with Whey protein and
 * Creatine once, and edits only ever touch that user's copy.
 */
export interface Supplement {
  id: SupplementID
  name: string
  unit: SupplementUnit
  /**
   * Grams in one unit (one scoop of whey is 30g). Used to snapshot macros
   * per 100g into the day's log, the same shape every meal item uses.
   */
  gramsPerUnit: number
  /** How much one tap of + adds. */
  step: number
  /** Macros for ONE unit, as a label prints them ("per scoop"). */
  nutrition: Nutrition
  /** Position on the row. */
  order: number
  createdAt?: string
  updatedAt?: string
}
