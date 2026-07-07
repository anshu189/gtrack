export type UnitSystem = 'metric' | 'imperial'

export interface NutritionTargets {
  calories?: number
  protein?: number
  carbs?: number
  fat?: number
  fiber?: number
}

export interface UserSettings {
  id?: string
  unitSystem: UnitSystem
  locale?: string
  theme?: 'light' | 'dark' | 'system'
  nutritionTargets?: NutritionTargets
  waterGoalMl?: number
  createdAt?: string
  updatedAt?: string
}
