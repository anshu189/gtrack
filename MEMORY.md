# GTrak — Project Memory File (handoff to any LLM / Claude)

**Version:** 2.0.0
**Last updated:** 2026-10-28 (after commit `9a14457` "Basic UI/UX Polish", branch `v2`)
**Read order:** this file → `AGENTS.md` (rules, kept current) → the code. If this file and the code disagree, **the code wins**. The four files in `docs/` and the audit in `design-audit/` are older background, not current truth.

---

## 1. What GTrak is

GTrak ("Growth Tracker for G's") is a **mobile-first nutrition + fitness + habit tracker** web app. Built for one owner (Neo), now open to a capped number of accounts. Log everything for the day in one place with minimal taps:

- **Nutrition** — build meals from individual foods, instant macro math.
- **Fitness** — daily workout (Push / Pull / Legs / Rest), bodyweight, water.
- **Habits** — tretinoin on a configurable schedule, daily notes.
- **Review** — History (any past day, editable) and Stats (7/30/90-day trends).
- **Data ownership** — per-user export / import / reset in Settings. No telemetry.

The Respect/Trust score from v1 has been **removed** (no store, repo or UI remains).

---

## 2. App flow and screens

`App.tsx` gates in three steps:
1. **Not signed in → `Login`** (`src/pages/Login.tsx`): email + password sign-in, sign-up (with display name), password reset, Google sign-in (`GoogleSignInButton`), a "Remember me" checkbox (local vs session persistence via `setRememberMe` in `lib/firebase.ts`), and a seats-remaining line read from `meta/seats`.
2. **Signed in, profile incomplete → `Onboarding`**: four questions (age + gender, weight, height, goal) written to `settings.profile`. `completedAt` is stamped whether answered or skipped, so it never reappears. Editable later in Settings only.
3. **Otherwise → `AppShell`** with the 5-tab DS `TabBar`: Home `/` · Meals `/meals` · History `/history` · Stats `/analytics` · Settings `/settings`. Each tab opens scrolled to top.

### Dashboard (`src/pages/Dashboard.tsx`)
Date-scoped (Prev / date picker / Next; Next disabled on today). Sections in order: Daily summary → Nutrition → Today's meals (expandable) → Workout → Water intake → Tretinoin (only when `showsTretinoin` says so) → Weight → Daily notes. **Every tracker auto-saves on interaction** — the old "Submit daily log" button and buffered weight are gone.

### Meals (`src/pages/MealBuilder.tsx`)
Build meals for any date (future blocked). New meal (name required — Create disabled on empty) → draft → `AddItem` (`FoodPicker` → `QuantityPicker`) → items editable/removable → Save / Cancel. Saved meals via `MealCard` (add items, delete with undo via `UndoBanner`). **Edit Foods** toggles `FoodMacroEditor`. Macros printed by `MacroTiles` / `MacroInline` only.

### History (`src/pages/History.tsx`)
Read/edit/delete any past day via repositories directly. Edit mode buffers changes behind `hasChanges`; Save persists, Cancel reloads. Delete-day is two-step confirm. A day with a tretinoin entry always shows its card regardless of schedule.

### Stats (`src/pages/Analytics.tsx`)
7 / 30 / 90-day `SegmentedControl`. Daily calories (`ChartCard`), Macronutrients, Weight trend (`ChartCard`), Water intake, tretinoin adherence as the DS **`StreakCard`** (not a chart — see `AGENTS.md` for the dot rules), Summary (averages vs targets, workout split).

### Settings (`src/pages/Settings.tsx`)
Cards: Account (sign out) · Your profile · Nutrition targets · Tretinoin schedule (`auto` / `weekdays` via `WeekStrip` / `daily`) · Water goal · Export data · Import data · Reset app data.
- **Export / Import** cover 12 per-user collections **including `foods`, `categories`, `quantityPresets`, `nutritionSources`** (custom foods are backed up now). `deletedMeals` excluded.
- **Reset** requires typing `delete my data` (the old `godelete` password is gone). Wipes meals, history, favorites, workouts, waterLogs, weights, dailyNotes, tretinoinLogs, settings, deletedMeals. Spares foods/categories/presets/sources. Wiping settings also clears the profile, so onboarding returns.

### Trackers (`src/components/tracking/`)
| Feature | Store | Notes |
|---|---|---|
| Meals / foods | `mealStore`, `foodStore`, `favoriteStore`, `categoryStore`, `quantityPresetStore`, `nutritionSourceStore` | soft-delete to `deletedMeals`, undo |
| Workouts | `workoutStore` | one per day, upsert |
| Water | `waterStore` | quick-add chips 250/300/350/500/750 ml + custom |
| Weight | `weightStore` | one per day, auto-saves |
| Daily notes | `dailyNoteStore` | debounced auto-save |
| Tretinoin | `tretinoinStore` | schedule logic only in `lib/utils/tretinoin.ts` (`showsTretinoin`, `maxGapFor`, `tretinoinAdherence`) |

---

## 3. Architecture & conventions

**One-way data flow (mandatory):** `Component → Zustand store → Repository → Firestore → store → re-render`. Components never import Firestore, except Settings bulk export/import/reset. Stores hold `{data, loading, error}` + actions. Business math lives in `lib/services/` + `lib/utils/`, used through `hooks/`.

**Per-user paths:** every repository builds paths through `src/lib/paths.ts` — `userColl(name)` / `userDoc(name, id)` resolve to `users/{uid}/<name>`; `requireUid()` throws `NotAuthenticatedError` when signed out. Never build a Firestore path by hand.

**Per-domain pattern:** `types/x.ts` + `lib/repositories/xRepository.ts` + `stores/xStore.ts`, re-exported from barrel `index.ts` files. 14 repositories (incl. `userRepository`), plus `authStore` and `settingsStore`.

**Conventions:** `@/` imports · `PascalCase.tsx` components · `useX.ts` hooks · no `any` · every write through `cleanForFirestore()` · `??` not `||` for numerics so `0` survives · `formatNum` for display only · components under ~300 lines.

**To add a feature:** type → repository (+barrel) → store (+barrel) → component → wire into page (+ `NAV_ITEMS` in `App.tsx` if it's a tab).

---

## 4. Design system — Gtrak DS (full rules in `AGENTS.md`)

- **Gtrak DS**: light, monochrome, derived from Cal AI. Source of truth: `D:\Growth\App UI\Gtrak Design System\DESIGN.md`. Astryx, StyleX, the gothic theme and dark mode are **all gone**.
- Tokens + Hanken Grotesk `@font-face` + type utilities in `src/index.css`; components in `src/components/ds/` (import from `@/components/ds`); icons from DS `Icon` only.
- **`lucide-react` is still listed in `package.json` but imported nowhere** — safe to remove.
- `DEFAULT_SETTINGS` in `src/lib/seed.ts` still writes `theme: 'dark'`; the field is unused leftover.
- Key rules: light only (no `dark:`), tokens only, monochrome chrome with colour only for data, type from utilities, radius by role, macros P→C→F via `MacroTiles`/`MacroInline`, 480px centred column, `min-w-0` on flex inputs, base resets in `@layer base`.

---

## 5. Backend — Firebase (`projectId: gs-gtrak`)

- **Auth:** Email/password + Google. **Anonymous auth is disabled.** Config hardcoded in `src/lib/firebase.ts` — never change it.
- **Sign-in flow (`authStore.init`):** `observeAuth` → `userRepository.claimSeat(uid)` (transaction: creates `users/{uid}` and increments `meta/seats.count` for a new user; returning users keep their seat) → `provisionUser(uid)` (seeds that user's categories, foods, presets, sources, settings; each step no-ops if non-empty) → `markProvisioned`. On `SeatsFullError` / `SeatsMissingError` the new auth user is discarded and a message shown.
- **Seats:** `meta/seats {count, limit}`, default limit 50. Create it once with `node scripts/init-seats.mjs [--limit N]` (idempotent). Raising the limit is a console-only edit.
- **`firestore.rules`** (in repo, paste into the console manually): owner-only access to `users/{uid}/**`; profile creation only in the same commit that takes one seat; `meta/seats` publicly readable, count may only go up by one; profiles never client-deleted; **all legacy top-level collections locked**.
- **Collections (all under `users/{uid}/`):** foods, meals, deletedMeals, history, settings (doc `settings:default`), categories, quantityPresets, nutritionSources, favorites, workouts, waterLogs, weights, dailyNotes, tretinoinLogs.
- **Migration:** `scripts/migrate-to-user.mjs --uid <uid> [--apply]` copied the old global collections into one user (dry run by default, never deletes, writes a local backup first).
- **Backups:** `backups/` is gitignored except its README. `scripts/backup-firestore.mjs` still signs in anonymously, so it **no longer works**; in-app Settings → Export is the current backup path.

**Unverified (repo can't tell):** whether the current `firestore.rules` are live in the console, and whether the migration was run with `--apply` for the owner's uid.

---

## 6. Food data (important)

- `Food` (`src/types/food.ts`): nutrition stored **per 100 g/ml**; non-weight units convert through `measures[].grams` (`mealItemGrams()` / `computeGramsPerUnit()` in `lib/utils/nutrition.ts`; fallbacks piece 50 / cup 240 / tbsp 15 / tsp 5 / slice 30). Meal items snapshot `name` + `gramsPerUnit` so history stays stable.
- Seeds (`src/data/foodsSeed.ts` ~130 foods, `builtInFoods.ts`, `macroOverrides.ts`, categories, presets, sources) are **only the initial data for a new user**. Code changes never rewrite anyone's `foods`.
- Live truth = `users/{uid}/foods`. Custom foods: `foodRepository.createCustom()` → `food:custom:{uuid}`. Macro edits: `FoodMacroEditor` → `foodRepository.update()`.
- Foods are lost only if a user's `foods` collection is emptied (next sign-in reseeds defaults), the Firebase config changes, or docs are deleted. Export first before anything risky.

---

## 7. Stack & build

React 19 · Vite 8 · TypeScript ~6.0 strict (`noUnusedLocals`/`noUnusedParameters` — unused code **fails the build**) · Tailwind v4 · Zustand · Recharts · Fuse.js · React Hook Form + Zod · react-router 7 · Firebase 12.
**Build:** `npm run build` (`tsc -b && vite build`) — always run before pushing; Vercel runs it on deploy. **Lint:** `npm run lint` (oxlint). Bundle chunk-size warning is known.
**Git:** work happens on `v2`; `main` is the PR/deploy target.

---

## 8. Changelog since v1.2.0

| Date | Commit | Change |
|---|---|---|
| 2026-09-28 | `1633434` | Login/sign-up wall: multi-user auth (email + Google), per-user `users/{uid}` paths, seats cap, `firestore.rules`, migration + seat scripts; Respect/Trust removed |
| 2026-09-28 | `b4d423e` | Astryx/gothic → Gtrak DS (light, Hanken Grotesk, `components/ds/`); design audit in `design-audit/` |
| 2026-10-11 | `e831c94` | Onboarding (4 questions), `Icon` set (lucide dropped), `MacroTiles`, `RulerPicker`, `OptionCard`, `SelectField`; Dashboard auto-save; `scripts/set-serving-defaults.mjs` |
| 2026-10-19 | `dd03a4e` | Tretinoin schedule setting (`auto`/`weekdays`/`daily`), `WeekStrip`, `StreakCard` in Stats |
| 2026-10-24 | `9a14457` | Login polish: Remember me (`Checkbox`), seats-remaining line, Google button tweaks |

## 9. Rules for the next model

1. Read this file, then `AGENTS.md`. Follow Gtrak DS; never reintroduce Astryx, dark mode or another icon library.
2. Data flow is law; build paths only through `lib/paths.ts`; wrap writes in `cleanForFirestore()`; read numerics with `??`.
3. Never write the onboarding weight into `weights`; `saveProfile` must read settings first so targets survive.
4. Tretinoin visibility comes only from `showsTretinoin()`.
5. Never change `src/lib/firebase.ts` config, never loosen `firestore.rules`, never run Reset/Delete-day or touch `meta/seats` unless asked.
6. Run `npm run build` and check the page in a browser before finishing.
