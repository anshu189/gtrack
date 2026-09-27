# 00 — Summary

**Gtrak app (old)** = the current codebase (dark gothic, Astryx + hand-rolled UI).
**Gtrak DS** = the target design system at `D:\Growth\App UI\Gtrak Design System\` (light, Cal AI-derived, v2.1).

Analysis only. No Gtrak app code has been changed.

## Stack found

React 19.2 · Vite 8 · TypeScript ~6.0 (strict) · Tailwind CSS v4 · react-router 7 · Zustand 5 · Firebase · Recharts · Fuse.js · lucide-react. Styling is Tailwind + `cn()`, with **two component systems running in parallel**: Astryx v0.4.3 and a hand-rolled `src/components/ui/`.

## Counts

| | Gtrak app (old) | Gtrak DS |
|---|---|---|
| Screens / routes | 6 | — (patterns, not screens) |
| Reusable components | 30 | 48 |
| Themes | 1 (dark) | 1 (light) |
| Hard-coded hex occurrences | **175** across 36 distinct values | 0 (all tokenised) |
| Raw Tailwind palette classes | ~120 (`text-slate-500` ×33, `text-slate-950` ×32, `border-slate-200` ×17…) | 0 |
| Undefined CSS vars in use | **2** (`--color-surface-alt` in 6 files, `--color-text-muted` in 1) | — |
| Dead components | 2 (`ui/typography.tsx`, `ui/section.tsx`) | — |

## Fit score by area

| Area | Fit | Why |
|---|---|---|
| Colour | **Poor** | Inverted. Dark gothic vs light monochrome. Every surface flips. |
| Type | **Poor** | Poppins → Hanken Grotesk; app leans on `text-sm`, DS on 17px + 600-weight numbers. |
| Shape | **Partial** | App is `rounded-lg` (80 uses) but two core primitives are square; DS has a 5-step radius scale tied to component role. |
| Elevation | **Poor** | App is flat everywhere; DS uses `shadow-card` / `shadow-float` / `shadow-cta` deliberately. |
| Data display | **Poor** | App uses bars only; `ProgressRing` is the DS signature mark and does not exist in the app. |
| Layout / spacing | **Partial** | App uses ad-hoc Tailwind spacing; DS has measured gutters (24 / 16 / 30) and vertical rhythm. |
| Navigation | **Partial** | 5 flat tabs vs DS 3-tab `bar` (or 4-tab `pill`) + FAB. |
| Behaviour / data | **Good** | Stores, repositories and flows are sound and stay as they are. |
| Onboarding | **N/A** | App has none; 17 DS components serve it. Out of scope by decision. |

## ⚠️ SCOPE CORRECTION — supersedes parts of `03` and `05`

Confirmed after the first draft. Where these conflict with anything below or in `03`/`05`, **these win**:

1. **Keep all 5 tabs.** Dashboard · Meals · History · Analytics · Settings. History and Analytics are **not** merged. The DS `TabBar` `bar` variant is a 3-tab design — it gets adapted to 5 tabs as an *Intentional addition to Gtrak DS*.
2. **This is a restyle in place, not an IA change.** Every component stays on the screen it is on today, in the same position. Only colour, type, spacing, shape and elevation change. Where Gtrak DS has a better *equivalent control* for an existing job, swap the control (e.g. the weight entry becomes a DS `WheelPicker`/`RulerPicker`) — but the section stays exactly where it is on the Dashboard.
3. **"Submit daily log" is removed**, on the condition that **nothing is left unsaved** — weight must auto-save like every other tracker. Editing a past day continues to happen in the History tab.
4. **Astryx `DateInput`:** recreate the identical experience with Gtrak DS if achievable; if the recreation cannot match it, keep Astryx for that one component only.

Consequences: no Home re-architecture, no demoted sections, no FAB-owned logging, no route changes, no redirects. Phase 2's navigation work shrinks to restyling the existing 5-tab bar.

## Locked foundational decisions

| # | Decision | Chosen |
|---|---|---|
| 1 | Theme | **Go light, exactly as Gtrak DS.** No dark theme. |
| 2 | Responsive | **Centred phone-width column** (~420–480px) on desktop, so every measured DS value holds. |
| 3 | Components | **Retire Astryx** progressively behind adapters; Gtrak DS becomes the single system. |
| 4 | Onboarding | **Skipped** for now (~20 of 48 DS components in scope). |

## Top 10 highest-impact changes

1. **Invert the theme.** Light canvas, black type, `surface-2` lavender-white. Remove `<html class="dark">` ([index.html:2](../index.html)) and the entire `.dark` token block ([src/index.css:28-53](../src/index.css)).
2. **Swap the font.** Poppins (Google CDN) → bundled Hanken Grotesk 400/500/600/700; titles and every number at weight 600.
3. **Rebuild the token layer.** One namespace, DS values, `@theme inline`. Resolve the `--color-*` collision between the app and the DS.
4. **Introduce `ProgressRing`.** The DS's signature data mark. Calorie ring 108/12 ink; macro rings 68/6 on `ring-track`.
5. **Rebuild Dashboard as Home.** `WeekStrip` → `CalorieCard` → three `MacroCard`s + `PageDots` → "Recently uploaded" `FoodLogCard`s. Demote the long tail of trackers.
6. **Collapse 5 tabs to 3 + FAB.** Home · Progress · Settings, with the FAB owning "log food".
7. **Replace both Card implementations** with DS Home cards (`radius-lg`, `shadow-card`) and DS rows (`radius-md`, `surface-2`).
8. **Retire `ui/button.tsx` and Astryx `Button`** for the DS `Button` (pill, 58px, `ink` fill, one primary per screen).
9. **Purge 175 hard-coded hex values and ~120 palette classes** into DS tokens.
10. **Adopt the colour law:** monochrome chrome, colour only for data — `protein` / `carbs` / `fat` / `streak` / `accent`, always paired with a text label.

## Top risks

1. **Dark → light is a daily-habit change.** You use this app every day at night. Highest-visibility risk in the project; worth a preview before full commit.
2. **Astryx removal is load-bearing.** `DateInput` (with its documented popover gotcha), `NumberInput`, `TextInput`, `Table` and `ProgressBar` are used throughout. Each needs a DS replacement before Astryx can go.
3. **Gtrak DS has no desktop spec.** Mitigated by decision 2, but every screen must be re-checked at 1290px.
4. **Dashboard density vs DS philosophy.** The DS says one hero number and one action per screen; today's Dashboard has ~10 cards and ~8 actions. This is an information-architecture change, not a restyle.
5. **No component covers Gtrak's own domains.** Tretinoin, PPL workouts, daily notes and water have no DS equivalent and need deliberate, rule-following additions.
6. **Strict build.** `noUnusedLocals`/`noUnusedParameters` means every partially-migrated file must stay clean or Vercel fails.

## Open questions for you

1. **Which 3 tabs?** My proposal: Home (Dashboard) · Progress (Analytics + History merged) · Settings, with Meals moving behind the FAB. Needs your call.
2. **Does Dashboard lose its long tail?** Tretinoin, daily notes, workout and weight can't all sit on a DS Home. Move to a "Progress" or "Today" detail screen, or keep Home dense and accept the deviation?
3. **Streak.** The DS gives prominent `StreakCard`/streak chip treatment. Gtrak has no streak concept. Add one, or leave that DS surface unused?
4. **Recently uploaded.** `FoodLogCard` expects a meal photo. Gtrak meals have no images. Use the neutral placeholder, or drop the photo column?
5. **Icons.** The DS `Icon` set is explicitly a substitute (the Figma export was raster-only). Keep the substitutes, or supply licensed originals?

## Running checklist

- [x] Read Gtrak DS in full (README, DESIGN.md, tokens.json, 48 component docs, CHANGELOG, reference screenshots)
- [x] Inventory Gtrak app (old) — screens, components, stack → `01`
- [x] Foundational decisions agreed
- [x] `02-component-map.md` — 30 components mapped, 5 DS additions proposed
- [x] `03-screen-map.md` — all 6 screens, section by section, with copy rewrites
- [x] `04-token-map.md` — every hard-coded value mapped
- [x] `05-navigation-and-flows.md` — 5 tabs → 3 + FAB
- [x] `06-gaps-and-risks.md` — gaps, lossy values, contrast, risks
- [x] `07-migration-plan.md` — 5 phases, ~4–6 weeks

**Audit complete.** No Gtrak app code changed. Awaiting answers to the three blocking questions in `07` before Phase 0.
