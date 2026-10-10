import type { IconName } from '@/components/ds'
import type { Gender, GoalId, PersonalProfile } from '@/types'

/**
 * The option sets behind the sign-up questions and the Settings profile card.
 * One source for both, so a label can never drift between the two screens.
 */
export const GENDER_OPTIONS: { value: Gender; label: string }[] = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
]

export const GOAL_OPTIONS: {
  value: GoalId
  label: string
  description: string
  icon: IconName
}[] = [
  { value: 'lose-fat', label: 'Lose Fat', description: 'Cut body fat, hold on to muscle', icon: 'flame' },
  { value: 'gain-weight', label: 'Gain Weight', description: 'Eat in surplus to add size', icon: 'arrow-up' },
  { value: 'lean-mass', label: 'Lean Mass Gain', description: 'Build muscle with minimal fat', icon: 'dumbbell' },
  { value: 'build-strength', label: 'Build Strength', description: 'Train heavy, fuel to match', icon: 'bolt' },
  { value: 'maintain', label: 'Maintain Weight', description: 'Hold where you are, stay consistent', icon: 'target' },
  { value: 'improve-health', label: 'Improve Health', description: 'Better habits, steadier energy', icon: 'heart' },
]

/** Ranges for the sign-up pickers. Wide enough to cover any adult user. */
export const AGE_RANGE = { min: 13, max: 100, default: 25 }
export const WEIGHT_RANGE_KG = { min: 30, max: 200, default: 70 }
export const HEIGHT_RANGE_CM = { min: 120, max: 220, default: 170 }

export function genderLabel(value?: Gender) {
  return GENDER_OPTIONS.find((o) => o.value === value)?.label
}

export function goalLabel(value?: GoalId) {
  return GOAL_OPTIONS.find((o) => o.value === value)?.label
}

export function goalIcon(value?: GoalId): IconName | undefined {
  return GOAL_OPTIONS.find((o) => o.value === value)?.icon
}

/**
 * True once sign-up has been seen through. An existing account that predates
 * the flow has no `profile`, so it is asked once as well.
 */
export function isProfileComplete(profile?: PersonalProfile) {
  return Boolean(profile?.completedAt)
}
