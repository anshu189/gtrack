export interface Nutrition {
  calories: number
  protein: number
  carbs: number
  fat: number
  fiber?: number
}

export function emptyNutrition(): Nutrition {
  return { calories: 0, protein: 0, carbs: 0, fat: 0 }
}
