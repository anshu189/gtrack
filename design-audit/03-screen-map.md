# 03 — Screen map

Per screen: the Gtrak DS layout pattern it becomes, its section order, copy rewrites, states, and the UX problems found in the old design.

Global frame (decision 2): a centred column capped at ~420–480px on any viewport, so every measured Gtrak DS value holds exactly. Home gutter **30px**, rows/cards **12px** apart, sections **32px** apart.

---

## 1. Login — `src/pages/Login.tsx`

**Pattern:** centred card on `canvas`. Closest DS relative is the auth screens described in `Button` (`black` for Get Started, `outline` for Google).

| Old element | New (Gtrak DS) |
|---|---|
| Logo tile + "Gtrak / Growth Tracker for G's" | Wordmark **"Gtrak"** in `large-title` 34/600 `black` (DS: no logo mark exists yet — do not draw one) |
| Card `rounded-xl border bg-surface` | `surface` card, `radius-lg`, `shadow-card` |
| "Welcome back" `text-base font-semibold` | `title-2` 20/26/600 |
| "Sign in to continue tracking." `text-sm` | `body` 17/19/400 `ink-2` |
| Astryx `TextInput` ×2–4 | `TextField` — 63px, `surface-2`, `radius-md`, `subhead` 15, `ink-3` placeholder |
| "Sign in" Astryx primary | `Button` `primary` — `ink`, 58px, `radius-pill`, `btn-label` 17/600, full width |
| Divider "or" | keep; rule in `line` |
| Google button | `Button` `outline` — white, **2px black border** (DS documents this variant as exactly this) |
| Error banner `border-error bg-error-muted` | `TextField` error state: `protein` border + ink message with a red dot |
| Notice banner | `Chip` `success` |
| "Limited to 50 accounts." `text-xs` | `caption` 12/15/500 `ink-2` |

**Copy rewrites** (DS voice: friendly coach, second person, Title Case for short titles/buttons):

| Old | New |
|---|---|
| "Welcome back" | "Welcome back" ✓ |
| "Sign in to continue tracking." | "Pick up where you left off." |
| "Create your account" | "Create Your Account" |
| "Your log stays private to you." | "Your log stays private to you." ✓ |
| "At least 8 characters" | "At least 8 characters" ✓ |
| "All seats are full. Please wait for next round." | "All seats are full right now. We'll open more soon." *(DS: encourage, don't scold)* |
| "Limited to 50 accounts." | "Limited to 50 accounts." ✓ |

**States:** loading → `Button` `isLoading`; error → inline under the field, not a page banner; disabled → `disabled` `#bababc` until the form is answerable (DS rule).

**UX issues found → fix**
- **Three competing actions** (Sign in, Google, Create an account) with no hierarchy. DS: one primary. → Sign in stays `primary` `ink`; Google becomes `outline`; "Create an account" becomes a `ghost` text action.
- Submit is **not wired to Enter** — there is no `<form>`, so keyboard submit does nothing. → Wrap in a form.
- Password field has no reveal toggle. → Add trailing `IconButton` `ghost`.
- No focus styling anywhere. → `shadow-focus`.

---

## 2. Dashboard → **Home** — `src/pages/Dashboard.tsx` (504 lines)

**Pattern:** DS tab-root Home. This is the biggest change in the project: ~10 stacked cards become a focused hero + a demoted tail.

**New section order** (DS Home, `README.md:49`):

| # | New (Gtrak DS) | From old |
|---|---|---|
| 1 | Logo row + streak chip | `:213` title row — *streak doesn't exist yet (open question)* |
| 2 | `WeekStrip` `letters` — 7 day tiles, 30px gutter | replaces Prev/Today/Next pills `:226` |
| 3 | **`CalorieCard`** — `stat-xl` 44/600 + 108/12 `ink` ring, `radius-lg`, `shadow-card` | Daily summary `:270` + Nutrition `:296` |
| 4 | **Three `MacroCard`s** + `PageDots` — `stat-md` 20/600 grams left, 68/6 rings in `protein`/`carbs`/`fat` | Nutrition progress bars `:320` |
| 5 | **"Recently uploaded"** `title-2` + `FoodLogCard` rows | Today's meals `:357` |
| 6 | `NoticeCard` (optional) | Errors `:258` |
| 7 | `TabBar` `bar` + `Fab` | bottom nav |

**Demoted off Home** — Workout `:418`, Water `:436`, Tretinoin `:452`, Weight `:463`, Daily notes `:485`, Submit `:491`. These have no place on a DS Home and are the subject of open question 2.

**Copy rewrites:**

| Old | New |
|---|---|
| "Dashboard" (`text-lg font-bold`) | Wordmark "Gtrak" + streak chip (DS Home has no page title) |
| "Daily summary" / "Overview of today's activity" | *removed* — the hero number is the summary |
| "Today's meals" | "Recently uploaded" |
| "Water intake" | "Water" |
| "Submit daily log" | *removed* — DS logs continuously; no batch submit |
| `2150 kcal` | **`2150`** `stat-xl`, "Calories left" `caption` beneath |
| `P: 120g · C: 420g · F: 95g` | Macro order **Protein → Carbs → Fats**, "184g" with unit attached |

**States:** loading → skeleton cards, not a full-page "Loading..."; empty → "No meals yet" with the FAB as the obvious next step; error → `NoticeCard`, dismissible.

**UX issues found → fix**
- **~8 primary actions on one screen** (Submit, log water ×6, log weight, toggle workout, toggle tretinoin). DS allows one. → FAB owns logging; the rest move to detail screens.
- **"Submit daily log" is a false model.** Everything else auto-saves; only weight buffers. Users can't tell what's saved. → Remove the batch submit, save weight on change like everything else.
- **`text-md` on six section headings does nothing** (`:359`, `:420`, `:454`, `:465`, `:487` …) — they render at inherited size. → `title-2`.
- **Percentage boxes and progress bars duplicate the same data** (`:300` and `:320`). → One ring per macro.
- **Tap targets:** the date pills and quick-add chips are `py-1.5` ≈ 30px, under the 40px minimum. → `radius-pill` chips at `h-7` in rows with 44px hit areas, or DS `Chip` sizing.
- **Colour carries meaning alone** in `ProgressCard` (green/orange/red by %). Fails the DS accessibility rule. → Macro colour + always-visible label and number.

---

## 3. MealBuilder → **Log food** — `src/pages/MealBuilder.tsx`

**Pattern:** pushed screen with `ScreenHeader` `nav` (back + centred `headline` + trailing action), reached from the **FAB**, not a tab.

| Old element | New (Gtrak DS) |
|---|---|
| "Meal Builder" `text-lg font-bold` `:144` | `ScreenHeader` `nav`, title "Log Food", `headline` 17/600 |
| "Edit Foods" toggle | trailing `IconButton` `ghost` (pencil) |
| Date pills `:162` | `WeekStrip` or DS date control (see `02` — needs an addition) |
| "New Meal" card `:212` | `TextField` 63px + inline action pill (DS: "the inline action is `disabled-2` until there is input, then black") — matches the existing name-required rule exactly |
| Draft meal card `:234` | `surface-2` container, `radius-md` |
| `MealItem` rows | `IngredientRow` — name • calories left, amount right |
| `AddItem` → `FoodPicker` → `QuantityPicker` | `TextField` search → `radius-md` rows → `Stepper` |
| "Meals" list `:322` | `FoodLogCard` rows |
| `UndoBanner` | `NoticeCard` + `ghost` action |

**Copy:** "New Meal" → "Name Your Meal"; "Meal Builder" → "Log Food"; "Edit Foods" → "Edit Foods" ✓; "Create" → "Create"; "Add item" → "Add Food".

**States:** empty → "No meals yet today"; the Create button stays disabled until the name is non-empty (**preserve** — this is existing validated behaviour); loading → inline spinner on the row.

**UX issues found → fix**
- Future dates are blocked but the Next pill only *looks* disabled — no explanation. → Disabled state + tooltip.
- Two different edit affordances (inline edit vs Edit Foods mode) are easy to confuse. → One pencil, one mode.
- `FoodPicker` search has no empty-result state beyond a bare list. → "No foods found · Create *name*" as a primary row.

---

## 4. History → merged into **Progress** — `src/pages/History.tsx` (602 lines)

**Pattern:** tab-root with `ScreenHeader` `large`, then date navigation and a day detail.

| Old element | New (Gtrak DS) |
|---|---|
| Page title | `ScreenHeader` `large` — `large-title` 34/600 "Progress" |
| Date pills | `WeekStrip` `letters` |
| Meals / Workout / Water / Weight / Notes / Tretinoin cards | `radius-lg` `surface` cards, `shadow-card`, `title-2` headings |
| Edit / Save / Cancel | one `primary` `Button` in a `ContinueBar` when dirty |
| Delete day (two-step) | `Button` `secondary` + typed confirmation, matching the Settings reset pattern |

**UX issues found → fix**
- **602 lines and three modes** (view / edit / delete-confirm) on one screen. → Edit becomes an explicit mode with a pinned Save, per DS's one-action rule.
- Save is only enabled via `hasChanges`, but there's no visual signal *what* changed. → Mark changed rows.
- The delete-day confirm is a bare two-step with no typed phrase, unlike the Settings reset. → Align both on type-to-confirm.

---

## 5. Analytics → **Progress** (charts) — `src/pages/Analytics.tsx`

**Pattern:** tab-root, `ScreenHeader` `large`, `SegmentedControl` for range, `WeightChartCard` for the trend.

| Old element | New (Gtrak DS) |
|---|---|
| 7/30/90 range buttons | `SegmentedControl` — track `fill`, selected lifts to a white pill with `shadow-card` |
| Recharts line/bar cards | `WeightChartCard` pattern: title, goal chip, interactive line, range control, encouragement banner |
| Chart colours `#2563eb`, `#7c3aed`, `#0ea5e9` | `protein` / `carbs` / `fat`; weight line `success` up to the selected point, `ink` after |
| Summary grid | `MacroTile` row + `CalorieTile` |
| Axis labels `#64748b` | `ink-2`, `caption` 12 |

**UX issues found → fix**
- Charts render even with one data point, producing a flat misleading line. → Empty state until ≥3 points.
- No tooltip/selection; the DS chart is interactive (hover/drag/arrow keys). → Adopt `WeightChartCard` interaction.
- Fixed Y domain risk — DS notes its reference implementation hardcodes 120–140 and says to **compute the domain from real data**.

---

## 6. Settings — `src/pages/Settings.tsx` (400 lines)

**Pattern:** tab-root, `ScreenHeader` `large`, `SettingRow` list on `surface-2`.

| Old element | New (Gtrak DS) |
|---|---|
| "Settings" `text-2xl font-semibold` | `large-title` 34/38/600 |
| Account card | `surface-2` rows — name `headline`, email `body` `ink-2` |
| Nutrition targets — 5 `NumberInput`s | `PlanSummary` — "Daily recommendation" container on `surface-2` with a 2×2 `PlanMacroCard` grid (Calories, Carbs, Protein, Fats), each with a ring and a pencil |
| Water goal | `PlanMacroCard` or `TextField` with `ml` suffix |
| Theme light/dark/system | **Removed** — decision 1 makes the app light-only |
| Save Settings | `Button` `primary` in a `ContinueBar` |
| Export / Import | `SettingRow`s with `secondary` buttons |
| Reset (type-to-confirm) | `TextField` + `Button` — keep the typed phrase, restyle only |
| Sign out | `Button` `ghost`, `ink-2` |

**Copy:** Title Case is already inconsistent here ("Nutrition Targets", "Export Data" vs "Sign out"). DS: Title Case for short titles and buttons. → "Nutrition Targets", "Water Goal", "Export Data", "Import Data", "Reset Application", "Sign Out".

**UX issues found → fix**
- Five bare number inputs give no sense of whether the targets are sensible. → `PlanMacroCard`s with rings show each target in proportion.
- The theme switcher disappears; make sure nothing else depends on `settings.theme` before removing.
- Reset and Export sit at the same visual weight though one is destructive. → Reset in its own section, `secondary` button, typed confirm retained.
