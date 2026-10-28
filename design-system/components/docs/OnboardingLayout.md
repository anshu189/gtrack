# OnboardingLayout

A full onboarding step at 393×852: `StepHeader`, title + subtitle, centred content, and a pinned `ContinueBar`.

- **Consumer provides:** `step`, `total`, `title`, `subtitle`, `children` (the question UI), `cta`, `ctaDisabled`, `onContinue`, `onBack`, optional `trailing`.
- Measured layout: header centre at 86pt, title cap at 121pt, 24pt gutters, CTA 744–802pt.
- Keep `ctaDisabled` true until the user has answered.
