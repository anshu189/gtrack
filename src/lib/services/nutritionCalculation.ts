import type { Meal, Nutrition, NutritionTargets } from '@/types'
import { mealRepository } from '@/lib/repositories'

export interface NutritionStatus {
  actual: Nutrition
  target?: Nutrition
  remaining: Nutrition
  percentage: Record<keyof Nutrition, number>
  surplus: Record<keyof Nutrition, number>
}

export class NutritionCalculationService {
  /**
   * Calculate total nutrition for a meal.
   */
  calculateMealNutrition(meal: Meal): Nutrition {
    const totals: Nutrition = {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      fiber: 0,
      sugar: 0,
      sodium: 0,
    }

    meal.items?.forEach((item) => {
      if (item.nutrition) {
        totals.calories += item.nutrition.calories ?? 0
        totals.protein += item.nutrition.protein ?? 0
        totals.carbs += item.nutrition.carbs ?? 0
        totals.fat += item.nutrition.fat ?? 0
        totals.fiber = (totals.fiber ?? 0) + (item.nutrition.fiber ?? 0)
        totals.sugar = (totals.sugar ?? 0) + (item.nutrition.sugar ?? 0)
        totals.sodium = (totals.sodium ?? 0) + (item.nutrition.sodium ?? 0)
      }
    })

    return totals
  }

  /**
   * Calculate total nutrition for a day.
   */
  async calculateDailyNutrition(dateIso: string): Promise<Nutrition> {
    const dayStart = dateIso.split('T')[0]
    const dayEnd = `${dayStart}T23:59:59.999Z`
    const meals = await mealRepository.listByDateRange(dayStart, dayEnd)

    const totals: Nutrition = {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      fiber: 0,
      sugar: 0,
      sodium: 0,
    }

    meals.forEach((meal) => {
      const mealNutrition = this.calculateMealNutrition(meal)
      totals.calories += mealNutrition.calories ?? 0
      totals.protein += mealNutrition.protein ?? 0
      totals.carbs += mealNutrition.carbs ?? 0
      totals.fat += mealNutrition.fat ?? 0
      totals.fiber = (totals.fiber ?? 0) + (mealNutrition.fiber ?? 0)
      totals.sugar = (totals.sugar ?? 0) + (mealNutrition.sugar ?? 0)
      totals.sodium = (totals.sodium ?? 0) + (mealNutrition.sodium ?? 0)
    })

    return totals
  }

  /**
   * Calculate progress against targets.
   */
  calculateProgress(actual: Nutrition, targets?: NutritionTargets): NutritionStatus {
    const targetNutrition: Nutrition = {
      calories: targets?.calories ?? 2000,
      protein: targets?.protein ?? 150,
      carbs: targets?.carbs ?? 250,
      fat: targets?.fat ?? 70,
      fiber: 30,
      sugar: 25,
      sodium: 2300,
    }

    const percentage: Record<keyof Nutrition, number> = {
      calories: (actual.calories / targetNutrition.calories) * 100,
      protein: (actual.protein / targetNutrition.protein) * 100,
      carbs: (actual.carbs / targetNutrition.carbs) * 100,
      fat: (actual.fat / targetNutrition.fat) * 100,
      fiber: (actual.fiber ?? 0) / (targetNutrition.fiber ?? 1) * 100,
      sugar: (actual.sugar ?? 0) / (targetNutrition.sugar ?? 1) * 100,
      sodium: (actual.sodium ?? 0) / (targetNutrition.sodium ?? 1) * 100,
    }

    const surplus: Record<keyof Nutrition, number> = {
      calories: actual.calories - targetNutrition.calories,
      protein: actual.protein - targetNutrition.protein,
      carbs: actual.carbs - targetNutrition.carbs,
      fat: actual.fat - targetNutrition.fat,
      fiber: (actual.fiber ?? 0) - (targetNutrition.fiber ?? 0),
      sugar: (actual.sugar ?? 0) - (targetNutrition.sugar ?? 0),
      sodium: (actual.sodium ?? 0) - (targetNutrition.sodium ?? 0),
    }

    const remaining: Nutrition = {
      calories: Math.max(0, targetNutrition.calories - actual.calories),
      protein: Math.max(0, targetNutrition.protein - actual.protein),
      carbs: Math.max(0, targetNutrition.carbs - actual.carbs),
      fat: Math.max(0, targetNutrition.fat - actual.fat),
      fiber: Math.max(0, (targetNutrition.fiber ?? 0) - (actual.fiber ?? 0)),
      sugar: Math.max(0, (targetNutrition.sugar ?? 0) - (actual.sugar ?? 0)),
      sodium: Math.max(0, (targetNutrition.sodium ?? 0) - (actual.sodium ?? 0)),
    }

    return { actual, target: targetNutrition, remaining, percentage, surplus }
  }

  /**
   * Get status string based on nutrition levels.
   */
  getStatus(status: NutritionStatus): {
    calories: string
    protein: string
    carbs: string
    fat: string
  } {
    const calorieStatus =
      status.percentage.calories > 110
        ? 'Over'
        : status.percentage.calories > 100
          ? 'On target'
          : 'Under'
    const proteinStatus =
      status.percentage.protein > 110
        ? 'Good'
        : status.percentage.protein > 80
          ? 'Fair'
          : 'Low'
    const carbsStatus =
      status.percentage.carbs > 110
        ? 'Over'
        : status.percentage.carbs > 80
          ? 'On target'
          : 'Under'
    const fatStatus =
      status.percentage.fat > 110
        ? 'Over'
        : status.percentage.fat > 80
          ? 'On target'
          : 'Under'

    return { calories: calorieStatus, protein: proteinStatus, carbs: carbsStatus, fat: fatStatus }
  }
}

export const nutritionCalculationService = new NutritionCalculationService()
