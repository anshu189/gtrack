export interface Nutrition {
  /** Energy in kilocalories */
  calories: number
  /** Protein in grams */
  protein: number
  /** Carbohydrates in grams */
  carbs: number
  /** Fat in grams */
  fat: number
  /** Fiber in grams (optional) */
  fiber?: number
  /** Sugar in grams (optional) */
  sugar?: number
  /** Sodium in milligrams (optional) */
  sodium?: number
}

export function emptyNutrition(): Nutrition {
  return { calories: 0, protein: 0, carbs: 0, fat: 0 }
}
