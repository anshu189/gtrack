export type NutritionSourceID = string

export interface NutritionSource {
  id: NutritionSourceID
  /** Human readable source name, e.g., 'USDA FoodData Central' */
  name: string
  /** Short description or notes about the source */
  description?: string
  /** Version or dataset identifier */
  version?: string
  /** URL or reference */
  url?: string
  createdAt?: string
  updatedAt?: string
}
