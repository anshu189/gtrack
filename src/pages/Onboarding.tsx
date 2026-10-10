import { useMemo, useState } from 'react'
import {
  OnboardingLayout,
  OptionGroup,
  RulerPicker,
  WheelPicker,
} from '@/components/ds'
import {
  AGE_RANGE,
  GENDER_OPTIONS,
  GOAL_OPTIONS,
  HEIGHT_RANGE_CM,
  WEIGHT_RANGE_KG,
} from '@/lib/utils/profile'
import { useSettingsStore } from '@/stores/settingsStore'
import type { Gender, GoalId, PersonalProfile } from '@/types'

/**
 * First-run sign-up questions: age and gender, weight, height, goal.
 *
 * Shown once. Answers land on the user's settings document under `profile`
 * and are editable afterwards from the Settings tab only — the flow never
 * reappears, because `completedAt` is written whether the questions were
 * answered or skipped.
 *
 * Nothing else is written. The weight given here is a starting figure on the
 * profile, not a weight log: writing it into `weights` would overwrite today's
 * entry for anyone who already has one.
 */
const TOTAL_STEPS = 4

const Onboarding = () => {
  const saveProfile = useSettingsStore((s) => s.saveProfile)
  const existing = useSettingsStore((s) => s.settings?.profile)

  const [step, setStep] = useState(1)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [gender, setGender] = useState<Gender | null>(existing?.gender ?? null)
  const [age, setAge] = useState(existing?.age ?? AGE_RANGE.default)
  const [weightKg, setWeightKg] = useState(existing?.weightKg ?? WEIGHT_RANGE_KG.default)
  const [heightCm, setHeightCm] = useState(existing?.heightCm ?? HEIGHT_RANGE_CM.default)
  const [goal, setGoal] = useState<GoalId | null>(existing?.goal ?? null)

  const ageOptions = useMemo(
    () => Array.from({ length: AGE_RANGE.max - AGE_RANGE.min + 1 }, (_, i) => AGE_RANGE.min + i),
    [],
  )

  const finish = async (patch: Partial<PersonalProfile>) => {
    setSaving(true)
    setError(null)
    try {
      await saveProfile({ ...patch, completedAt: new Date().toISOString() })
      // The store now holds a completed profile, so App stops rendering this
      // flow and the Dashboard takes over. No navigation needed.
    } catch {
      setError('Could not save your details. Please check your connection and try again.')
      setSaving(false)
    }
  }

  const handleComplete = () =>
    finish({ gender: gender ?? undefined, age, weightKg, heightCm, goal: goal ?? undefined })

  const handleSkip = () => finish({ skipped: true })

  const back = step > 1 ? () => setStep((s) => s - 1) : undefined
  const next = () => setStep((s) => s + 1)

  const common = {
    total: TOTAL_STEPS,
    onBack: back,
    ctaLoading: saving,
    secondary: step === 1 ? 'Skip for now' : undefined,
    onSecondary: step === 1 ? handleSkip : undefined,
  }

  const errorNote = error && (
    <p role="alert" className="mt-4 text-center footnote text-protein">
      {error}
    </p>
  )

  if (step === 1) {
    return (
      <OnboardingLayout
        {...common}
        step={1}
        title="Tell us about you"
        subtitle="This calibrates your targets. You can change it any time in Settings."
        ctaDisabled={!gender}
        onContinue={next}
      >
        <div className="flex flex-col gap-8">
          <div className="flex flex-col gap-3">
            <p className="footnote text-ink-2">Gender</p>
            <OptionGroup
              label="Gender"
              options={GENDER_OPTIONS}
              value={gender}
              onChange={setGender}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <p className="footnote text-ink-2">Age</p>
            {/* The wheel takes its width from the consumer, as in the DS. */}
            <div className="flex items-center justify-center gap-3 rounded-md bg-surface-2 py-3">
              <WheelPicker
                label="Age"
                options={ageOptions}
                value={age}
                onChange={setAge}
                format={(v) => String(v)}
                className="w-16"
              />
              <span className="footnote text-ink-2">years</span>
            </div>
          </div>
        </div>
        {errorNote}
      </OnboardingLayout>
    )
  }

  if (step === 2) {
    return (
      <OnboardingLayout
        {...common}
        step={2}
        title="What do you weigh?"
        subtitle="Your starting point, so progress has something to measure against."
        onContinue={next}
      >
        <RulerPicker
          label="Current weight"
          value={weightKg}
          onChange={setWeightKg}
          min={WEIGHT_RANGE_KG.min}
          max={WEIGHT_RANGE_KG.max}
          step={0.1}
          unit="kg"
        />
        {errorNote}
      </OnboardingLayout>
    )
  }

  if (step === 3) {
    return (
      <OnboardingLayout
        {...common}
        step={3}
        title="How tall are you?"
        subtitle="Used alongside your weight to size your daily targets."
        onContinue={next}
      >
        <RulerPicker
          label="Height"
          value={heightCm}
          onChange={setHeightCm}
          min={HEIGHT_RANGE_CM.min}
          max={HEIGHT_RANGE_CM.max}
          step={1}
          decimals={0}
          unit="cm"
        />
        {errorNote}
      </OnboardingLayout>
    )
  }

  return (
    <OnboardingLayout
      {...common}
      step={4}
      title="What are you after?"
      subtitle="Pick the one that matters most right now."
      cta={saving ? 'Saving…' : 'Finish'}
      ctaDisabled={!goal || saving}
      onContinue={handleComplete}
    >
      <OptionGroup label="Primary goal" options={GOAL_OPTIONS} value={goal} onChange={setGoal} />
      {errorNote}
    </OnboardingLayout>
  )
}

export default Onboarding
