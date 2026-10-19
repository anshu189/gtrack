# AGENTS.md

Project-specific guidance for AI coding agents.

## Design system

GTrak's UI is built on **Gtrak DS** — a light, monochrome design system derived
from Cal AI. The system itself lives at `D:\Growth\App UI\Gtrak Design System\`
(README.md, DESIGN.md, tokens/tokens.json, components/docs/*.md, reference
screenshots). Read `DESIGN.md` before writing UI; it is the source of truth for
tokens, type scale, spacing, radii and component recipes.

A full audit of the app against the system lives in `design-audit/`.

**Astryx has been removed.** Ignore any older instruction mentioning
`npx astryx`, `@astryxdesign/*`, StyleX or the gothic theme — none of it is in
the project any more.

### Where things are

- `src/index.css` — the DS token set, the Hanken Grotesk `@font-face` rules, the
  Tailwind v4 `@theme inline` block, and the DS type utilities.
- `src/components/ds/` — the DS components. Import from `@/components/ds`.
- `public/fonts/` — Hanken Grotesk 400/500/600/700, self-hosted.

**Icons come from `Icon`, not an icon library.** `src/components/ds/Icon.tsx`
carries the DS's own 24x24 set verbatim plus a short list of app additions
drawn to the same recipe (2px round stroke, `currentColor`). `lucide-react` is
no longer imported anywhere. Need a glyph the set lacks? Add it to `ICONS` under
the "Gtrak app additions" heading rather than reaching for another library.

### Rules

1. **Light only.** Gtrak DS declares a single theme and has no dark variant.
   Never add `dark:` utilities — without a custom dark variant they fire off the
   OS preference and break the page.
2. **Tokens for every value.** No hex literals, no raw Tailwind palette classes
   (`slate-*`, `red-*`, …). Use `bg-surface-2`, `text-ink-2`, `text-protein`,
   `rounded-md`, `shadow-card` and friends.
3. **Monochrome chrome, coloured data.** Text and selections are `black`;
   buttons and the FAB are `ink`; quiet surfaces are `surface-2`. Colour appears
   only where it encodes something — `protein`, `carbs`, `fat`, `streak`,
   `accent`. Never let colour be the only signal: always print the label too.
4. **Type comes from the utilities**, not ad-hoc sizes: `stat-xl`, `large-title`,
   `title-1`, `title-2`, `stat-md`, `headline`, `btn-label`, `option`,
   `body-text`, `callout`, `subhead`, `chip-text`, `label-text`, `footnote`,
   `caption`. (`body`, `chip` and `label` are renamed to avoid collisions.)
   Weight 600 for titles and numbers, 500 for labels, 400 for running text.
5. **Radius by role**, not one global value: `rounded-pill` for controls,
   `rounded-md` (15) for rows and inputs, `rounded-lg` (20) for cards,
   `rounded-sm` (12) for inner cards.
6. **Numbers:** integers for calories (`2583`), one decimal for weight
   (`77.0 kg`), grams attached (`184g`). Macro order Protein → Carbs → Fats.
   Macros are printed by `MacroTiles` (three tiles across, meal-detail) or
   `MacroInline` (dense list rows) — never by hand-written coloured spans, which
   is how the order and the units drifted apart before.
7. **Layout:** the app is a centred column capped at 480px — every DS value is
   measured at 393×852pt, so the phone layout holds at every width. Home gutter
   30px, cards 12px apart, sections 32px.
8. **Any flex child that is an input or select needs `min-w-0`**, or it refuses
   to shrink and overflows its container. This has bitten three times.
9. **Base resets belong in `@layer base`.** An unlayered `font: inherit` on
   controls beats every type utility and silently resizes all button and input
   text.

### Adding a component

If Gtrak DS has one, use it. If it does not, build it from DS atoms, follow the
DS rules, and write a comment saying it is an **intentional addition to Gtrak
DS** and why. Existing additions: `AppShell`, `TabBar` (5-tab pill),
`TextArea`, `TextLink`, `SelectField`, `DatePicker`, `ChartCard`,
`ScrollToTop`, plus the app glyphs in `Icon`.

Ported from the DS and available now: `Icon`, `MacroTile` / `MacroTiles` /
`MacroInline`, `OptionCard` / `OptionGroup`, `StepHeader`, `ContinueBar`,
`OnboardingLayout`, `RulerPicker`, `WeekStrip`, `StreakCard`. Check
`src/components/ds/index.ts` before building anything — several of these existed in the DS long before the app grew
its own copy, and the copies are what caused the drift.

### First-run questions

`src/pages/Onboarding.tsx` asks four questions once (age and gender, weight,
height, goal) and writes them to `settings.profile`. `App.tsx` gates on
`isProfileComplete`, which is just `profile.completedAt`; that stamp is written
whether the user answered or skipped, so the flow never reappears. Everything is
editable afterwards from the Settings tab only.

Two rules here:

- **Never write the onboarding weight into `weights`.** It is a starting figure
  on the profile. Writing it would overwrite today's real entry.
- **`saveProfile` reads the current settings first**, because the repository
  writes the whole document. Saving a profile must not drop the nutrition
  targets. Option sets live in `src/lib/utils/profile.ts`, shared by both
  screens; the stored `GoalId` values are ids, so rename labels, never ids.

### Tretinoin schedule

Which days the tretinoin switch appears on is `settings.tretinoinSchedule`,
chosen in the Settings tab. `showsTretinoin(date, schedule, lastApplied)` in
`src/lib/utils/tretinoin.ts` is the only thing that decides it — Dashboard and
History both call it, so they can never disagree. Three modes:

- `auto` — the original rule, every third night counted from the last
  application, and visible before the first application because there is
  nothing to count from yet. This is the default, so an account with no
  schedule saved behaves exactly as it did before the setting existed.
- `weekdays` — the days picked on the `WeekStrip`, repeating weekly.
- `daily` — every day.

Changing the schedule never touches a saved log. A day that already has an
entry still shows its card in History whatever the schedule says, so history
stays readable.

Analytics shows adherence as the DS `StreakCard`, not a chart. The streak is
consecutive applications no further apart than `maxGapFor(schedule)` and has to
reach today, otherwise it has lapsed.

The card's seven dots run **Sunday to Saturday**, like every other weekday row
in the app — never reorder them. The *window* behind them is the seven days
ending today rather than the current calendar week: a calendar week shows
almost nothing on a Monday, so an application made the previous Thursday had no
cell to fill while the figure underneath still counted it. Seven consecutive
days hold one of each weekday, so each lands on its own column and the dots and
the figure cover the same days. Four states, because colour alone cannot
carry four meanings: `done` (filled `streak` + check), `missed` (grey fill,
a past scheduled day), `pending` (dashed `streak` ring — due, night not over)
and `off` (grey dashed — never asked for). Every dot also spells its state out
for a screen reader. An application on an unscheduled day still fills its dot,
so `tretinoinAdherence` returns `offSchedule` and the sentence names it —
otherwise two filled dots sit above the words "applied on 1".

### Before finishing

Run `npm run build` (`tsc -b && vite build`, strict — unused code fails the
build). Then check the page in a browser: no element wider than its container,
no text the same colour as its background, no horizontal scroll.
