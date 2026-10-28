Gtrak — *Growth Tracker for G's* — is a calm, monochrome health tracker: pure black type on white, a lavender-white for every quiet surface, big semibold numbers, soft rounded cards, and colour spent only on data. It should feel like a premium iOS utility: quiet chrome, one obvious action, progress you can read at a glance.

## Principles

1. **One question, one action.** Onboarding asks one thing per screen: a 34px title, a one-line reason, the answer UI centred, and a single full-width `Continue` pinned at the bottom — disabled until answered.
2. **Numbers are the hero.** Every data screen leads with one big figure (`stat-xl`, `stat-lg`, `stat-md`) and a small label under it.
3. **Monochrome chrome, coloured data.** Text and selections are `black`; buttons and the FAB are `ink`; quiet surfaces are `surface-2`. Colour appears only where it encodes something: `protein`, `carbs`, `fat`, `streak`, and the warm `accent` for ratings and highlighted numbers.
4. **Flat in onboarding, soft on Home.** Option cards and inputs have no shadow or border — just `surface-2`. Home cards are white on `shadow-card`.
5. **Encourage, don't scold.** Copy is short and positive; social proof and projections sell the plan.

## Content fundamentals

- **Voice:** friendly coach, second person. Titles are questions or promises: "Choose your Gender", "What is your desired weight?", "Gain twice as much weight with Gtrak vs on your own".
- **Subtitles** give the reason in one line: "This will be used to calibrate your custom plan."
- **Casing:** Title Case for short titles and buttons ("Choose your Gender", "Continue", "Get Started"); sentence case for longer titles and body.
- **Numbers:** one decimal for weight ("77.0 kg", "1.0 kg"), integers for calories ("2583"), grams attached ("184g"), macro order Protein → Carbs → Fats (Home cards) or Calories, Carbs, Protein, Fats (plan).
- **Highlight** the key number in a statement with `accent`: "Gaining **6 kg** is a realistic target."
- **Emoji:** not in UI copy.

## Colour

- Page: `canvas` (white). Home adds a top glow — `canvas-glow-2` (cool, left) and `canvas-glow` (warm, right) fading to white by ~200px.
- Quiet surfaces — option cards, list rows, inputs, back button, language pill, review card, plan container — are all `surface-2` (#f9f8fd). Selected option cards are solid `black` with white text.
- Text: `black` for everything that matters; `ink-2` for review text and secondary lines; `ink-3` only for placeholders and optional helper lines (fails 4.5:1); `ink-4` for the inactive side of a pair ("Metric").
- Primary buttons, Yes/No and the FAB are `ink` (#1c1a22); Get Started, paywall and Apple sign-in are `black`. Disabled CTA: `disabled`; disabled inline Submit: `disabled-2`.
- Tracks: `track` for step bars and switches, `ring-track` behind every ring, `slider-track` for sliders.
- Macros: `protein` red, `carbs` amber, `fat` blue — rings, icons, labels. The setup bar runs `protein` → `fat`. `accent` (= `carbs`) is for stars, laurels and highlighted numbers.

## Type

- **Hanken Grotesk** (OFL, bundled as woff2 400/500/600/700). The source's font measures within 1.5% of Hanken's widths and matches its letterforms; it is the closest open match, not a confirmed identity.
- Weight 600 for every title and number (the source never goes heavier); 500 for option labels and captions; 400 for running text.
- Scale: `stat-xl` 44 · `large-title` 34/38 · `stat-lg` 34 · `stat-md` 20 · `title-2` 20 · `headline`/`btn-label`/`option`/`body` 17 · `callout` 16 · `subhead` 15 (inputs) · `chip`/`label` 14 · `footnote` 13 · `caption` 12.
- Leading is tight: 38 on 34, 19 on 17 body.

## Space, shape, elevation

- Gutters: onboarding content 24 (`space-6`); pinned CTA 16 (`space-4`); Home 30 (`space-gutter-home`). Cards and options stack 12 apart (`space-3`). Title → subtitle 20 (`space-5`).
- Radii: `radius-pill` for every control, bar and the back button; `radius-md` (15) for option cards, rows, inputs and review cards; `radius-sm` (12) for inner plan cards; `radius-lg` (20) for Home cards and the plan container; `radius-xs` (8) for the wheel selection.
- Sizes: CTA `control-xl` 58; option rows `option-row` 69 / `option-row-2` 90; input `input-height` 63; back button `icon-button` 40; FAB `fab-size` 64; step bar 3; slider 4 with a 27 thumb; switch 51×31.
- Elevation: none in onboarding except `shadow-cta` (the upward fade above the pinned CTA). Home: `shadow-card` for cards, `shadow-float` for the FAB and slider thumb.

## Layout patterns

- **Onboarding step** (`OnboardingLayout`): `StepHeader` (back + progress + optional `EN` pill) centred at 86pt; title cap at 121pt; subtitle 20 below; answer UI centred in the remaining space; `ContinueBar` with the CTA at 744–802pt.
- **Answer UIs:** `OptionGroup` for single choice; `UnitSwitch` + `WheelPicker` for height/weight/birthday; `RulerPicker` for target weight; `SpeedSlider` for pace; `YesNo` for binary questions; `TextField` with an inline Submit for codes.
- **Persuasion screens:** centred statement with an `accent` number, comparison or projection chart, `RatingCard` + `ReviewCard` for social proof.
- **Plan reveal:** `SetupProgress` while computing, then check icon + "Congratulations your custom plan is ready!", a `soft` chip with the projection, and `PlanSummary`.
- **Home:** logo row with streak chip, `WeekStrip` (letters), `CalorieCard`, three `MacroCard`s with `PageDots`, "Recently uploaded", `NoticeCard`, `TabBar` bar + `Fab`.

## States and motion

- Press: scale 0.97 in 150ms ease-out. Selected option: instant swap to `black`. Step bar and rings animate width/offset over 500–600ms ease-out. Disabled CTA → enabled swaps `disabled` for `ink`.
- Focus (keyboard, added for web): `shadow-focus` — 2px white gap then 2px ink.

## Iconography

- Line icons on a 24px grid, 2px round strokes, `currentColor`; filled glyphs for the flame, macro marks, star, pencil and check-circle. 18–20 in controls, 24 in the tab bar, 13–16 inline.
- The `Icon` set is a **substitute** drawn for this system: the Figma export holds raster screenshots only, so the source's icons, its animal speed illustrations, laurels and third-party brand logos (Apple, Google, Instagram, TikTok…) could not be extracted and were not redrawn. Supply licensed files to replace them; keep the icon names.

## Logo

No logo supplied yet. Set the wordmark "Gtrak" in `large-title` weight 600 `black`; do not draw a placeholder mark.

## Accessibility notes

Kept exact from the source and flagged: `ink-3` 2.83:1, `ink-4` 1.56:1, `carbs`/`accent` 2.35:1, `fat` 3.02:1, `protein` 3.4:1, `streak` 2.24:1, `ink-2` on `surface-2` 4.33:1, white on `avatar` 2.46:1. Never let these carry meaning alone; always print the label beside the colour.
