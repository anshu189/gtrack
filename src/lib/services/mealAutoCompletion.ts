import type { Meal } from '@/types'
import { mealRepository } from '@/lib/repositories'

export interface MealAutoCompletion {
  name: string
  frequency: number
  lastUsed: string
}

export class MealAutoCompletionService {
  /**
   * Get meal name suggestions based on history.
   * Returns meal names ranked by frequency and recency.
   */
  async getSuggestions(limit: number = 10): Promise<MealAutoCompletion[]> {
    const allMeals = await mealRepository.listAll()
    
    // Group by name and calculate frequency and last used date
    const nameMap = new Map<string, { frequency: number; lastUsed: string }>()
    
    allMeals.forEach((meal) => {
      const name = meal.name ?? 'Meal'
      const existing = nameMap.get(name)
      if (existing) {
        existing.frequency++
        // Update lastUsed if this meal is more recent
        if (meal.loggedAt > existing.lastUsed) {
          existing.lastUsed = meal.loggedAt
        }
      } else {
        nameMap.set(name, { frequency: 1, lastUsed: meal.loggedAt })
      }
    })

    // Convert to array and sort by frequency (desc) then by recency (desc)
    const suggestions = Array.from(nameMap.entries())
      .map(([name, data]) => ({
        name,
        frequency: data.frequency,
        lastUsed: data.lastUsed,
      }))
      .sort((a, b) => {
        if (b.frequency !== a.frequency) return b.frequency - a.frequency
        return b.lastUsed.localeCompare(a.lastUsed)
      })
      .slice(0, limit)

    return suggestions
  }

  /**
   * Get suggestions matching a prefix (for real-time search/autocomplete).
   */
  async getSuggestionsByPrefix(prefix: string, limit: number = 5): Promise<MealAutoCompletion[]> {
    const all = await this.getSuggestions(100)
    const lowerPrefix = prefix.toLowerCase()
    return all
      .filter((s) => s.name.toLowerCase().startsWith(lowerPrefix))
      .slice(0, limit)
  }

  /**
   * Get a meal template by name (returns the most recent meal with that name).
   * Useful for "duplicate meal" feature.
   */
  async getMealTemplate(name: string): Promise<Meal | undefined> {
    const allMeals = await mealRepository.listAll()
    return allMeals
      .filter((m) => (m.name ?? 'Meal') === name)
      .sort((a, b) => b.loggedAt.localeCompare(a.loggedAt))[0]
  }
}

export const mealAutoCompletionService = new MealAutoCompletionService()
