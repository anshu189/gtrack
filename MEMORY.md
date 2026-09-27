# GTrak — Project Memory File (handoff to any LLM / Claude)

**Version:** 1.2.0
**Last updated:** 2026-09-24
**Repo:** the companion GitHub repo (provided alongside this file) is the code truth. This file is the *context* truth — read it first, then explore the repo. If this file and the code ever disagree, **the app code wins**.

---

## 1. App purpose (what GTrak is)

GTrak ("Growth Tracker for G's", see `src/App.tsx`) is a **mobile-first nutrition + fitness + habit tracker** as a web app. One person (owner: Neo) uses it daily to log everything in one place with minimal taps:

- **Nutrition** — dynamically build meals from individual foods, instant macro math.
- **Fitness** — daily workout (Push / Pull / Legs / Rest), bodyweight trend, water intake.
- **Habits & accountability** — tretinoin every-3rd-night schedule, daily notes, and a Respect/Trust accountability score.
- **Review** — History (any past day, editable) and Analytics (7/30/90-day Recharts trends).
- **Data ownership** — export / import / password-protected reset in Settings. No telemetry, no analytics collection, anonymous auth only.

Routes (all inside `AppShell` + 5-tab `BottomNavigation`): `/` Dashboard · `/meals` MealBuilder · `/history` History · `/analytics` Analytics · `/settings` Settings.

---

## 2. Functionality (what each part does)

### Dashboard (`src/pages/Dashboard.tsx`) — the daily operating screen
Date-scoped (Prev / Today / Next pills + Astryx `DateInput`; Next disabled on today via `isToday`). Sections in fixed order: Daily Summary → Nutrition → Today's Meals (expandable) → Workout → Water Intake → Tretinoin (only on scheduled nights) → Weight → Respect/Trust Score → Daily Notes → **Submit daily log** (`size="lg"`, flushes pending weight, resets inputs, toast). Title is `text-xl`; "Daily summary" `text-base`, "Overview of today's activity" `text-sm`.

### Meals (`src/pages/MealBuilder.tsx`)
Build meals for any date (past allowed, future blocked). Flow: **New Meal card** (name input → Create) → draft meal → `AddItem` (`FoodPicker` → `QuantityPicker`) → items editable inline (quantity/unit) or removable → Save (create vs update via `cleanForFirestore`) / Cancel. Saved meals listed via `MealCard` (add-more-items, delete with 24h undo via `UndoBanner`). Top-right **Edit Foods** toggles `FoodMacroEditor`. Date pills: Prev / center pill (formatted date, opens Astryx calendar) / Next (disabled on today).
**Rules enforced:** meal **cannot be created without a name** — Create button is disabled on empty/whitespace input and `handleCreateMeal` returns early on empty trim (no more silent `'Meal'` fallback).

### History (`src/pages/History.tsx`)
Read/edit/delete any past day. Loads via repositories directly (not stores). Edit mode buffers changes (`editWorkout/Weight/Unit/Notes/NoteContent`, `respectPatch`, `waterChanged`) behind `hasChanges` gating; Save persists, Cancel reloads. Delete-entire-day is two-step confirm. Meal deletes only in edit mode + undo.

### Analytics (`src/pages/Analytics.tsx`)
Recharts over 7/30/90d, loaded on range change only: daily-calories line + target, macros line, weight trend, water bars (non-zero days only), tretinoin adherence bars, respect trend, summary grid (avg kcal/P/C/F vs targets, workout split).

### Settings (`src/pages/Settings.tsx`)
Targets (3300 kcal, 120P, 420C, 95F, 35 fiber, 2000 ml water; theme light/dark/system via `NumberInput` + buttons) → Save. **Export** (9 collections + settings → `gtrak-export-YYYY-MM-DD.json`) · **Import** (validates version, 490/batch `writeBatch`, preserves existing) · **Reset All Data** (password `godelete`, deletes 11 collections — see §6 for what survives).

### Trackers (all in `src/components/tracking/`)
| Feature | Store | Notes |
|---|---|---|
| Meals/nutrition | `mealStore` (+`foodStore`, `favoriteStore`, `categoryStore`, `quantityPresetStore`, `nutritionSourceStore`) | soft-delete → `deletedMeals`, 24h undo |
| Workouts | `workoutStore` | one/day, upsert (`workout:{date}`) |
| Water | `waterStore` | quick-add **250 / 300 / 350 / 500 / 750 ml** + custom `NumberInput`; multiple logs/day summed |
| Weight | `weightStore` | one/day (`weight:{date}`); Dashboard buffers until Submit; Astryx `Table` history, rows `text-sm`, headers `text-xs` |
| Daily notes | `dailyNoteStore` | auto-save debounced 500 ms |
| Tretinoin | `tretinoinStore` | every-3rd-night from last applied (`lib/utils/tretinoin.ts`) |
| Respect/Trust | `respectStore` | factors Do-what-you-said ±1, Excuse ±1, Flake ±3; bar max 50, green/red |

---

## 3. Approach (architecture & conventions — follow these)

**One-way data flow (mandatory):**
`Component → Zustand store → Repository → Firestore → store update → re-render`.
Components never import Firestore (except Settings bulk export/import/reset). Stores hold `{data, loading, error}` + actions only — never DB logic or JSX. Business math lives in `lib/services/` + `lib/utils/`, consumed via `hooks/`.

**Per-domain pattern:** each domain = `types/x.ts` + `lib/repositories/xRepository.ts` + `stores/xStore.ts`, re-exported via barrel `index.ts` files. 14 repositories, 15 stores.

**Conventions:** `@/` alias imports · `PascalCase.tsx` components · `useX.ts` hooks · `xStore.ts` / `xRepository.ts` · lowercase `types/x.ts` · `calculateMealNutrition()`-style names · no `any` · `formatNum` for display only (max 2 decimals) · every write wrapped in `cleanForFirestore()` (strips `undefined`) · `??` (not `||`) when reading optional numerics so `0` survives · components < ~300 lines, pages compose with minimal logic.

**To add a feature:** `types/X.ts` → `repositories/XRepository.ts` (+ barrel) → `stores/XStore.ts` (+ barrel) → `components/<domain>/` → wire into page + route/`NAV_ITEMS` if needed.

---

## 4. Design system (gothic + Astryx — the app is truth, not old docs)

- **UI framework:** Astryx v0.4.3 (`@astryxdesign/core`, `@astryxdesign/theme-gothic`, `@astryxdesign/cli`) + Tailwind CSS v4 + `clsx`/`tailwind-merge` (`cn()`). StyleX is Astryx-internal only. `src/components/ui/` are hand-rolled wrappers (not real shadcn).
- **Setup (required):** `src/main.tsx` via `src/index.css` imports `@astryxdesign/core/reset.css` + `astryx.css`. Theme: `gothic` (`package.json` → `<Theme theme={gothicTheme}>` in `App.tsx`; `<html class="dark">` default).
- **Astryx workflow (AGENTS.md):** run everything as `npx astryx <cmd>` — `astryx build "<idea>"` first, `astryx template <name>`, `astryx component <Name>` for props. Tokens for every value; never override `--color-*` in `:root`.
- **Live dark tokens (`src/index.css`):** bg `#101314` · surface `#1a1d20` · border `#24292D` · text `#E8F1F6` · muted `#96A0AB` · accent `#a3b5d6` (periwinkle) · success `#b3c79a` (sage) · warning `#d3c490` (aged gold) · error `#c6a6a2` (dusty rose). Light theme exists but dark is the used theme.
- **Shape (user-mandated):** rounded corners everywhere — cards `rounded-xl`, inputs/buttons/items `rounded-lg` — flat, no shadows. (Old docs said "square"; that is obsolete.)
- **Type:** sentence-case section labels ("Water intake", "Respect/Trust score", "Daily notes", "Submit daily log"; "Do what you said", "Flake (ignored)"). Dashboard h1 `text-xl`; Nutrition % stats `text-lg`, completion stats `text-sm`; weight-table rows `text-sm`/headers `text-xs`.
- **Astryx components in use:** `Theme, Card, Button, Badge, ProgressBar, Grid, VStack, Text, DateInput, NumberInput, TextInput, TextArea, Table(/Header/HeaderCell/Body/Row/Cell)`. Progress displays (`WaterProgress`, `NutritionSummary`) use Astryx `ProgressBar` with real `label` props (a11y), not hand-rolled divs.
- **⚠️ Known gotcha — DateInput overlay:** the Meals center pill renders a custom button over a hidden Astryx `DateInput` overlay (`absolute inset-0 opacity-0`) and opens it via `dateInputRef.current?.click()`. **Never put `pointer-events-none` on that wrapper**: Astryx renders its calendar popover *inline* as a DOM child (no portal when ancestors are "safe"), and `pointer-events` is inherited — the whole calendar becomes visible-but-unclickable (dead month/year arrows, no selectable dates). The fix that works: overlay has no `pointer-events-none`, custom button sits above it (`relative z-10`) and receives the clicks. Keep this pattern if you touch the date pills.

---

## 5. Scalability

Supports 1000+ foods, years of history, unlimited meals without refactoring: flat Firestore collections, per-domain repos/stores, derived-on-demand nutrition (nothing calculated is persisted except meal-item snapshots), Analytics loads on demand, search index built once (Fuse.js + 180 ms debounce). Bundle is large (~1.68 MB JS; chunk-size warning is known/pre-existing) — code-split with `import()` if it ever matters.

---

## 6. Frontend & backend services

**Frontend:** React 19 + Vite 8 + TypeScript ~6.0 (strict: `noUnusedLocals`, `noUnusedParameters` — unused imports/props **fail the build**) + Tailwind v4 + Recharts + Fuse.js + React Hook Form + Zod + lucide-react + react-router. Path alias `@/* → src/*` (`vite-tsconfig-paths`). **Build = `npm run build` = `tsc -b && vite build`. Always run it before pushing — Vercel runs it and fails on any TS error (exit 2).** Lint: `npm run lint` (oxlint). Deploy: GitHub → auto Vercel deploy on `main`. No PWA plugin/manifest/SW in repo (PRD still mentions PWA as future — leave as-is per owner).

**Backend:** Firebase Firestore + Anonymous Auth only. Config hardcoded in `src/lib/firebase.ts` (`projectId: gs-gtrak`). No `.env`, no `firestore.rules`/`firebase.json` in repo — treat rules as unknown/open; all collections are global/shared (no per-user namespacing). Boot: `ensureSignedIn()` → `seedIfEmpty()` → ready.

**Collection ↔ repo ↔ store map (all flat top-level collections):**
`foods`→foodRepository→foodStore · `meals`+`deletedMeals`→mealRepository→mealStore · `history`→historyRepository→historyStore · `settings` (doc `settings:default`)→settingsRepository→settingsStore · `categories`→categoryStore · `quantityPresets`→quantityPresetStore · `nutritionSources`→nutritionSourceStore · `favorites` (doc `fav:{foodId}`)→favoriteStore · `workouts` (`workout:{day}`)→workoutStore · `waterLogs`→waterStore · `weights`→weightStore · `dailyNotes`→dailyNoteStore · `tretinoinLogs`→tretinoinStore · `respectLogs`→respectStore.

**Destructive ops (never run casually):** Settings Reset (`godelete`) wipes 11 collections but **spares `foods`/`categories`/`quantityPresets`/`nutritionSources`** · History Delete-Day wipes that day's meals/workout/water/weight/note · `deletedMeals` auto-purge past midnight (undo = today only).

---

## 7. Food data (VERY IMPORTANT — read carefully)

- **Types:** `Food{id, name, category?, servingSize?, servingUnit?, measures?: FoodMeasure[{label,quantity,unit,grams?}], isCustom?, source?: IFCT|USDA|FSSAI|Brand|Custom, nutrition{calories,protein,carbs,fat,fiber?}, aliases?, tags?}` (`src/types/food.ts`). Nutrition stored **per 100 g/ml**; non-weight units convert via `measures[].grams` (`mealItemGrams()` / `computeGramsPerUnit()` in `lib/utils/nutrition.ts`; fallbacks piece 50 / cup 240 / tbsp 15 / tsp 5 / slice 30). Meal items snapshot `name` + `gramsPerUnit` so history is stable.
- **Seeds (initial source ONLY):** `src/data/foodsSeed.ts` (~130 foods, IFCT/USDA/Brand) + `builtInFoods.ts` (currently `[]`) + `macroOverrides.ts` (currently `{}`, applied at seed time only) + `categories.ts` / `quantityPresets.ts` / `nutritionSources.ts`. Seeder `src/lib/seed.ts` runs on every boot but each seeder **no-ops unless its collection is empty** (`limit(1)` check).
- **Live truth = Firestore `foods` collection.** Custom foods: `foodRepository.createCustom()` → `food:custom:{uuid}`, `isCustom:true, source:'Custom'` (created from `FoodPicker` → `AddItem`). Macro tweaks: `FoodMacroEditor` → `foodRepository.update()` (direct `updateDoc`, includes nutrition/measures/serving). The `gtrak:macroOverrides` localStorage key is only import/export staging, not the live path.
- **Answer to the owner's migration question:** custom foods + macro tweaks are **NOT lost** by cloning the repo, editing code in another LLM, or pushing — code changes never rewrite Firestore, and seed files have zero effect on a non-empty DB. They are lost **only if**: the `foods` collection is deleted/emptied (next boot reseeds seed-only data), the Firebase config is pointed at a new project (fresh empty DB), or docs are explicitly deleted.
- **⚠️ Backup gap:** Settings Export/Import covers only 9 collections + `settings` — **`foods` (incl. all custom foods + macro tweaks) is NOT exported**. Before any risky change, export `foods` from the Firestore console. There is no in-app full backup of food data.

---

## 8. Session changelog (what was built/fixed before this handoff)

1. Dashboard label casing → sentence case (Water intake, Respect/Trust score, Daily notes, Submit daily log); RespectTracker labels ("Do what you said", "Flake (ignored)").
2. Hardcoded colors → gothic theme tokens in RespectTracker, WaterProgress, NutritionSummary.
3. WaterProgress + NutritionSummary → Astryx `ProgressBar` with real `label` props (`isLabelHidden` for water); fixed TS errors (unused var, missing label).
4. WeightHistory → Astryx `Table` (children mode, Date/Weight/Change), rows `text-sm`, headers `text-xs`; Submit button `size="lg"`; Dashboard font tuning (h1 `text-xl`, Daily summary `text-base`, etc.); Nutrition % `text-lg` / completion `text-sm`.
5. MealBuilder gothic redesign (header + Edit Foods, Prev/date/Next pills, New Meal card, meal edit section, meals list); all meal components re-tokenized + rounded corners.
6. DateInput-behind-pill pattern + `pointer-events-none` bug (dead calendar) fixed via `relative z-10` button over a `pointer-events-none`-free overlay.
7. Per-item Remove/Edit in drafting meal (`editItemId`, inline `QuantityPicker`, Save/Cancel); duplicate-declaration build breaks fixed; missing `QuantityPicker` import fixed; `isToday` restore.
8. Meal-name-required validation (button disabled + handler guard).
9. Water quick-add: added 300ml.
10. Vercel `TS6133` fixes (unused `Button` import, unused `onDelete` prop removed from `MealItem`).
11. Docs v1.2.0: this memory file + 4 doc updates (rounded gothic is truth; Astryx in stack; foods writable; backup gap documented).

## 9. Handoff instructions for the next model

1. Read this file, then `AGENTS.md`, then the 4 docs in `docs/`.
2. Never override `--color-*` in `:root`; use tokens; rounded corners; sentence-case labels.
3. Data flow is law: Component → store → repository → Firestore. No Firestore imports in components (except Settings bulk ops). Wrap writes in `cleanForFirestore()`, read numerics with `??`.
4. Run `npm run build` before finishing anything — strict TS fails Vercel on unused code.
5. Never add `pointer-events-none` around an Astryx DateInput (§4 gotcha).
6. Never delete/empty `foods`, never change `src/lib/firebase.ts` config, never run Reset/Delete-Day unless asked — and warn that Settings Export does not back up `foods`.
