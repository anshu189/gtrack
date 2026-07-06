import { useEffect, useState } from 'react'
import type { Meal, Nutrition, NutritionTargets } from '@/types'
import type { NutritionStatus } from '@/lib/services/nutritionCalculation'
import { nutritionCalculationService } from '@/lib/services/nutritionCalculation'
import { useSettingsStore } from '@/stores/settingsStore'

/**
 * Hook to calculate nutrition for a single meal.
 */
export function useMealNutrition(meal: Meal | null) {
  const [nutrition, setNutrition] = useState<Nutrition | null>(null)

  useEffect(() => {
    if (!meal) {
      setNutrition(null)
      return
    }
    const result = nutritionCalculationService.calculateMealNutrition(meal)
    setNutrition(result)
  }, [meal?.id, meal?.items])

  return nutrition
}

/**
 * Hook to calculate daily nutrition for a given date.
 */
export function useDailyNutrition(dateIso: string) {
  const [nutrition, setNutrition] = useState<Nutrition | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchDailyNutrition = async () => {
      setLoading(true)
      try {
        const result = await nutritionCalculationService.calculateDailyNutrition(dateIso)
        setNutrition(result)
      } finally {
        setLoading(false)
      }
    }
    fetchDailyNutrition()
  }, [dateIso])

  return { nutrition, loading }
}

/**
 * Hook to get nutrition progress/status against targets.
 */
export function useNutritionProgress(nutrition: Nutrition | null, targets?: NutritionTargets) {
  const settingsStore = useSettingsStore()
  const [status, setStatus] = useState<NutritionStatus | null>(null)

  useEffect(() => {
    if (!nutrition) {
      setStatus(null)
      return
    }

    // Use provided targets or fetch from settings
    let targetToUse = targets
    if (!targetToUse && settingsStore.settings) {
      targetToUse = settingsStore.settings.nutritionTargets
    }

    const result = nutritionCalculationService.calculateProgress(nutrition, targetToUse)
    setStatus(result)
  }, [nutrition, targets, settingsStore.settings?.nutritionTargets])

  return status
}

/**
 * Hook to get daily nutrition progress for a given date.
 */
export function useDailyNutritionProgress(dateIso: string) {
  const { nutrition, loading } = useDailyNutrition(dateIso)
  const status = useNutritionProgress(nutrition)

  return { nutrition, status, loading }
}

/**
 * Hook to get nutrition status strings.
 */
export function useNutritionStatus(status: NutritionStatus | null) {
  const [statusStrings, setStatusStrings] = useState<Record<string, string> | null>(null)

  useEffect(() => {
    if (!status) {
      setStatusStrings(null)
      return
    }
    const result = nutritionCalculationService.getStatus(status)
    setStatusStrings(result)
  }, [status])

  return statusStrings
}
