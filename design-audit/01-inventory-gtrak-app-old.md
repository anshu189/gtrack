# 01 — Inventory: Gtrak app (old)

Everything currently in the codebase. Nothing here is a judgement; it is the "before" picture.

## Stack

| Aspect | Finding | Evidence |
|---|---|---|
| Framework | React 19.2 + Vite 8 + TypeScript ~6.0 | `package.json` |
| Routing | react-router-dom 7.18, flat routes, no nested layouts | `src/App.tsx:78-84` |
| Styling | Tailwind CSS v4 + `clsx`/`tailwind-merge` via `cn()` | `src/lib/utils/cn.ts` |
| Component library | **Two in parallel:** Astryx v0.4.3 (`@astryxdesign/core` + `@astryxdesign/theme-gothic`) and hand-rolled `src/components/ui/*` | `src/App.tsx:3-4`, `src/components/ui/` |
| Icon set | lucide-react 1.23 (nav only) + inline SVG (Google mark) | `src/App.tsx:15`, `src/components/auth/GoogleSignInButton.tsx:3` |
| Font | **Poppins**, Inter fallback, loaded from Google Fonts CDN | `index.html:9`, `src/index.css:63,71,80` |
| Dark mode | Class-based, `<html class="dark">` hardcoded as default; theme setting light/dark/system | `index.html:2`, `src/App.tsx:60-66` |
| i18n | None | — |
| State | Zustand 5, 16 stores | `src/stores/` |
| Charts | Recharts 3.9 | `src/pages/Analytics.tsx` |
| Search | Fuse.js 7.4 | `src/lib/search/foodSearch.ts` |
| Auth | Firebase email/password + Google, seat-capped | `src/lib/firebase.ts`, `src/stores/authStore.ts` |

**Counts:** 6 screens · 30 reusable components · 16 stores · 15 repositories · 175 hard-coded hex occurrences (36 distinct values).

## Screens / routes

| Route | File | Purpose |
|---|---|---|
| *(unauthenticated)* | `src/pages/Login.tsx` | Sign in / sign up / password reset, Google button, seat-cap message |
| `/` | `src/pages/Dashboard.tsx` (504 lines) | The daily operating screen — date-scoped log of everything |
| `/meals` | `src/pages/MealBuilder.tsx` (346) | Build and edit meals from foods for any date |
| `/history` | `src/pages/History.tsx` (602) | Read/edit/delete any past day |
| `/analytics` | `src/pages/Analytics.tsx` (320) | 7/30/90-day Recharts trends |
| `/settings` | `src/pages/Settings.tsx` (400) | Targets, theme, account, export/import/reset |

**No onboarding flow exists.** No paywall. No camera/scan. No social/groups.

### Dashboard section order (`src/pages/Dashboard.tsx`)
Title + date picker (`:213`) → Prev/Today/Next pills (`:226`) → error card (`:258`) → Daily summary (`:270`) → Nutrition (`:296`) → Today's meals (`:357`) → Workout (`:418`) → Water intake (`:436`) → Tretinoin, conditional (`:452`) → Weight (`:463`) → Daily notes (`:485`) → Submit daily log (`:491`).

### Modals / sheets / overlays
There are **none**. Every interaction is inline-expanding within the page. The only overlay-like elements are `UndoBanner` (`src/components/meal/UndoBanner.tsx`) and the Astryx `DateInput` calendar popover.

### States
- **Loading:** one full-screen "Loading..." (`src/App.tsx:38`); per-store `loading` booleans are largely unrendered.
- **Error:** a single aggregated error `Card` on Dashboard (`:258-266`); Login shows inline error/notice banners.
- **Empty:** ad-hoc inline text, e.g. "No nutrition data" (`NutritionSummary.tsx:31`).
- **Disabled:** native `disabled` + `opacity-50` (`src/components/ui/button.tsx:38`).

## Reusable components (30)

### `src/components/ui/` — hand-rolled primitives (7)
| File | Purpose | Note |
|---|---|---|
| `app-shell.tsx` | Page frame: header bar, content, fixed bottom nav | Bottom nav was desktop-hidden until this session |
| `bottom-navigation.tsx` | 5-item icon+label tab bar | |
| `button.tsx` | 5 variants × 3 sizes | **No border radius** |
| `card.tsx` | Bordered container with optional title/description | **No border radius** — square |
| `page-container.tsx` | `max-w-7xl` + responsive gutters | |
| `section.tsx` | Titled section wrapper | **Unused — dead code** |
| `typography.tsx` | Display/Heading/Subheading/Body/Caption | **Unused — dead code**, and no dark-mode colours |

### `src/components/dashboard/` (3)
`DailySummary.tsx` — 2×2 stat grid (Meals, Calories, Workout, Water) · `ProgressCard.tsx` — labelled bar with status word · `ProgressCards.tsx` — grid wrapper.

### `src/components/nutrition/` (2)
`NutritionSummary.tsx` — 4-up percentage boxes + 4 Astryx `ProgressBar`s + status strip · `MealNutritionCard.tsx` — per-meal macro readout.

### `src/components/meal/` (8)
`AddItem.tsx` · `DeleteItemButton.tsx` · `FoodMacroEditor.tsx` (295 lines) · `FoodPicker.tsx` (222) · `MealCard.tsx` · `MealItem.tsx` · `QuantityPicker.tsx` · `UndoBanner.tsx`.

### `src/components/tracking/` (9)
`DailyNoteEditor.tsx` · `TretinoinTracker.tsx` · `WaterLogging.tsx` (quick-add chips + custom) · `WaterProgress.tsx` · `WeightLogging.tsx` · `WeightHistory.tsx` (Astryx `Table`) · `WorkoutCard.tsx` · `WorkoutLogging.tsx` · `WorkoutHistory.tsx`.

### `src/components/auth/` (1)
`GoogleSignInButton.tsx` — Astryx `Button` + inline Google SVG.

## Astryx components in use
`Theme, Card, Button, Badge, ProgressBar, Grid, VStack, Text, DateInput, NumberInput, TextInput, TextArea, Table(/Header/HeaderCell/Body/Row/Cell)`.

## Navigation structure
Single-level. 5 tabs, no stack, no back behaviour, no deep links beyond the 5 paths. Tab bar is `position: fixed` at the bottom at every width (`src/components/ui/app-shell.tsx:24-28`).

`NAV_ITEMS` (`src/App.tsx:17-23`): Dashboard (`Home`), Meals (`UtensilsCrossed`), History (`Clock`), Analytics (`BarChart3`), Settings (`Settings2`).

## Key user flows
1. **Auth** — Login → seat claim → provisioning → Dashboard.
2. **Daily logging** — Dashboard, inline per-section, ending in one "Submit daily log".
3. **Meal building** — Meals → name → create → `FoodPicker` → `QuantityPicker` → save.
4. **Review** — History (date-scoped edit) and Analytics (range trends).
5. **Data ownership** — Settings → export / import / reset.
