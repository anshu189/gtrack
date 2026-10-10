export type UnitSystem = 'metric' | 'imperial'

export interface NutritionTargets {
  calories?: number
  protein?: number
  carbs?: number
  fat?: number
  fiber?: number
}

export type Gender = 'male' | 'female' | 'other'

/**
 * Primary training goal. The set follows what the top trackers ask on
 * sign-up — Withings (lose weight / lose fat / gain muscle / gain weight /
 * stabilise), MacroFactor and Fitia (lose / maintain / gain) — widened with
 * the strength and health goals GTrak's workout log already supports.
 *
 * These ids are stored, so renaming one would orphan existing profiles. Change
 * the label in GOAL_OPTIONS instead.
 */
export type GoalId =
  | 'lose-fat'
  | 'gain-weight'
  | 'lean-mass'
  | 'build-strength'
  | 'maintain'
  | 'improve-health'

/**
 * What the four-step sign-up asks for. Stored on the user's settings document
 * so it rides along with the existing settings read, write, export and import
 * rather than needing a collection of its own.
 *
 * Heights are centimetres and weights kilograms, always — the app's default
 * unit system is metric and storing one canonical unit keeps conversion out of
 * the database.
 */
export interface PersonalProfile {
  age?: number
  gender?: Gender
  heightCm?: number
  weightKg?: number
  goal?: GoalId
  /**
   * Set once sign-up has been seen through, whether answered or skipped.
   * Its presence is what stops the flow reappearing.
   */
  completedAt?: string
  /** True when the user chose to skip rather than answer. */
  skipped?: boolean
}

export interface UserSettings {
  id?: string
  unitSystem: UnitSystem
  locale?: string
  theme?: 'light' | 'dark' | 'system'
  nutritionTargets?: NutritionTargets
  waterGoalMl?: number
  profile?: PersonalProfile
  createdAt?: string
  updatedAt?: string
}
