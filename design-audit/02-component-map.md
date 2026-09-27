# 02 — Component map: Gtrak app (old) → Gtrak DS

Fit key: **Exact** (DS component drops in) · **Adapt** (DS component + prop/content changes) · **Compose** (build from DS atoms) · **No match** (needs a new component following DS rules).

Effort: S ≤ half a day · M ≈ 1–2 days · L ≥ 3 days.

## `src/components/ui/` — primitives

| Old (Gtrak app) + path                 | Used on                      | New (Gtrak DS)                                                                            | Fit                                               | Visual deltas                                                                                                                                                                                                                                                                | Behaviour to preserve                     | Effort |
| -------------------------------------- | ---------------------------- | ----------------------------------------------------------------------------------------- | ------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------- | ------ |
| `ui/button.tsx` (5 variants × 3 sizes) | Analytics, History, Settings | `Button` (`primary`/`black`/`outline`/`secondary`/`ghost`)                                | **Adapt**                                         | **No radius → `radius-pill`**. Heights `px-4 py-2` → `lg` 58 / `md` 48. `bg-black` → `bg-ink`. Label `text-sm` → `btn-label` 17/600. Add `active:scale-[0.97]`, `shadow-focus`. `danger` variant has **no DS equivalent** — DS forbids colouring buttons with status colours | `disabled`, `onClick`, `type`             | M      |
| `ui/card.tsx`                          | Analytics, History, Settings | Home card recipe (`rounded-lg bg-surface shadow-card`) or row (`rounded-md bg-surface-2`) | **Compose**                                       | **Square → `radius-lg` (20)**. Border `slate-200`/`#24292D` → **no border**, `shadow-card` instead. Title `text-base` → `title-2` (20/600)                                                                                                                                   | `title`/`description` props, `forwardRef` | M      |
| `ui/app-shell.tsx`                     | App                          | `OnboardingLayout` is onboarding-only — Home needs a **new tab-root shell**               | **No match** → *Intentional addition to Gtrak DS* | `max-w-7xl` → centred ~420–480 column. Header bar → DS logo row + streak chip. `pb-24` → TabBar 88 + safe area                                                                                                                                                               | Fixed bottom nav, header slot             | M      |
| `ui/bottom-navigation.tsx` (5 items)   | App                          | `TabBar` variant `bar` + `Fab`                                                            | **Adapt**                                         | 5 tabs → **3 tabs + FAB**. Square 36px icon tiles → DS 24px icons, `caption` 12/500 labels, active black + filled, inactive `ink-2`. Add 64px `ink` FAB                                                                                                                      | `active`, `onClick` per item              | M      |
| `ui/page-container.tsx`                | all 5 pages                  | DS gutters (`px-[30px]` Home)                                                             | **Adapt**                                         | `max-w-7xl px-4 sm:px-6 lg:px-8` → fixed column + 30px Home gutter                                                                                                                                                                                                           | —                                         | S      |
| `ui/section.tsx`                       | **unused**                   | —                                                                                         | **Delete**                                        | Dead code                                                                                                                                                                                                                                                                    | —                                         | S      |
| `ui/typography.tsx`                    | **unused**                   | DS type utilities                                                                         | **Delete**                                        | Dead code; also has no dark colours                                                                                                                                                                                                                                          | —                                         | S      |

## `src/components/dashboard/`

| Old + path | Used on | New (Gtrak DS) | Fit | Visual deltas | Behaviour to preserve | Effort |
|---|---|---|---|---|---|---|
| `DailySummary.tsx` (2×2 stat grid) | Dashboard | `CalorieCard` + `MacroCard` ×3 | **Compose** | Four bordered boxes → one hero `CalorieCard` (`stat-xl` 44/600 + 108/12 ink ring) and three `MacroCard`s. "Workout"/"Water" have no DS home — move out of the hero | Meals count, calorie total, workout label, water total | L |
| `ProgressCard.tsx` | Dashboard | `MacroCard` (Home) / `ProgressBar` (linear) | **Adapt** | **Status colour law breaks:** `bg-green-500`/`bg-orange-500`/`bg-red-500`/`bg-black` by percentage ([ProgressCard.tsx:10-15](../src/components/dashboard/ProgressCard.tsx)) violates "colour only encodes data". Replace with macro colours + a ring | % maths, status words, `actual/target` | M |
| `ProgressCards.tsx` | Dashboard | grid wrapper | **Compose** | 3-across with `space-3`, `PageDots` beneath | — | S |

## `src/components/nutrition/`

| Old + path | Used on | New (Gtrak DS) | Fit | Visual deltas | Behaviour to preserve | Effort |
|---|---|---|---|---|---|---|
| `NutritionSummary.tsx` | Dashboard, History | `CalorieCard` + `MacroCard` ×3 (+ `MacroTile` in detail) | **Compose** | 4-up percentage boxes + 4 stacked bars → rings. **Uses undefined `--color-surface-alt` and `--color-text-muted`** ([NutritionSummary.tsx:63,88](../src/components/nutrition/NutritionSummary.tsx)) — currently renders with no background | `compact` mode, status strings, `??` target fallbacks | L |
| `MealNutritionCard.tsx` | MealBuilder | `MacroTile` ×3 | **Adapt** | Three across, `space-3`, order **Protein → Carbs → Fats**, tinted icon + label + value | per-meal totals | S |

## `src/components/tracking/`

| Old + path | Used on | New (Gtrak DS) | Fit | Visual deltas | Behaviour to preserve | Effort |
|---|---|---|---|---|---|---|
| `WaterProgress.tsx` | Dashboard | `ProgressRing` or `ProgressBar` | **Adapt** | Astryx `ProgressBar` → DS ring/bar on `ring-track`. Water has **no DS colour** — use `ink` (chrome), not an invented one | goal maths, `label` a11y | S |
| `WaterLogging.tsx` (chips 250/300/350/500/750 + custom) | Dashboard | `Chip` (`muted`) + `TextField` + `Button` | **Adapt** | Chips → `h-7 px-3 rounded-pill bg-track chip` 14/500. Custom input → `TextField` 63px `surface-2` with inline action | quick amounts, custom add | S |
| `WeightLogging.tsx` | Dashboard, History | `TextField` + `UnitSwitch` + note `Chip`s | **Adapt** | Native `<select>` for kg/lbs ([WeightLogging.tsx:81-93](../src/components/tracking/WeightLogging.tsx)) → DS `UnitSwitch` (22px semibold pair + `Switch`). Note preset chips already match the DS chip idea | controlled/uncontrolled dual mode, presets, Clear | M |
| `WeightHistory.tsx` (Astryx `Table`) | Dashboard | `WeightCard` + rows | **Compose** | Astryx `Table` must go with Astryx. Rows become `radius-md` `surface-2` list rows; values `headline` | Date / Weight / Change columns, `excludeDate` | M |
| `WorkoutCard.tsx`, `WorkoutLogging.tsx`, `WorkoutHistory.tsx` | Dashboard, History | `OptionGroup` / `SegmentedControl` + rows | **Adapt** | Push/Pull/Legs/Rest choice → `SegmentedControl` (2–5 options, white pill on `fill`) or `OptionCard`s | one workout per day, upsert | M |
| `DailyNoteEditor.tsx` | Dashboard, History | `TextField` (multi-line) | **No match** → *Intentional addition* | DS has no textarea. Extend `TextField` to multi-line keeping 15px radius, `surface-2`, `subhead` text | 500ms debounced auto-save | S |
| `TretinoinTracker.tsx` | Dashboard, History | `SettingRow` or `YesNo` | **Adapt** | Row + `Switch` (51×31, black when on) | every-3rd-night schedule | S |

## `src/components/meal/`

| Old + path | Used on | New (Gtrak DS) | Fit | Visual deltas | Behaviour to preserve | Effort |
|---|---|---|---|---|---|---|
| `MealCard.tsx` | MealBuilder | `FoodLogCard` | **Adapt** | Row with photo, name, time, calories, macros. **Gtrak meals have no images** — use the documented neutral placeholder. Uses undefined `--color-surface-alt` | expand, add-items, delete + undo | M |
| `MealItem.tsx` | MealBuilder | `IngredientRow` | **Exact** | name • calories left, amount right | inline edit/remove | S |
| `FoodPicker.tsx` (222 lines) | AddItem | `TextField` + `OptionGroup`/rows | **Compose** | Search field → `TextField` 63px with `search` icon; results → `radius-md` `surface-2` rows. Uses undefined `--color-surface-alt` | Fuse.js search, 180ms debounce, favourites, create-custom | L |
| `QuantityPicker.tsx` | AddItem | `Stepper` + `WheelPicker` (optional) | **Adapt** | Quantity + unit. DS `Stepper` is an outline pill with ±; `WheelPicker` is available if you want the iOS feel | unit conversion via `measures[].grams` | M |
| `AddItem.tsx` | MealBuilder | composition | **Compose** | Two-step picker flow | flow order | S |
| `FoodMacroEditor.tsx` (295 lines) | MealBuilder | `TextField` ×5 + `PlanMacroCard` | **Compose** | Largest single component. Per-100g macro fields → `TextField`s with unit suffixes. Uses undefined `--color-surface-alt` | direct `foodRepository.update()`, validation | L |
| `UndoBanner.tsx` | MealBuilder | `NoticeCard` | **Adapt** | White, `shadow-card`, `ink-2` footnote, close button. Needs an action affordance — DS `NoticeCard` only has dismiss | 24h undo window | S |
| `DeleteItemButton.tsx` | meal components | `IconButton` (`ghost`) | **Exact** | 40px round, `surface-2`. Uses undefined `--color-surface-alt` | confirm-then-delete | S |

## `src/components/auth/`

| Old + path | Used on | New (Gtrak DS) | Fit | Visual deltas | Behaviour to preserve | Effort |
|---|---|---|---|---|---|---|
| `GoogleSignInButton.tsx` | Login | `Button` variant `outline` | **Exact** | DS documents `outline` as exactly "Sign in with Google" — white, 2px black border, 58px pill. Keep the brand SVG (DS omits third-party logos by design) | popup + redirect fallback | S |

## Astryx components to replace

| Astryx | Used in | Gtrak DS replacement | Risk |
|---|---|---|---|
| `Card` | Dashboard, MealBuilder, Login, Settings | Home card recipe | Low |
| `Button` | Dashboard, MealBuilder, Login, tracking | `Button` | Low |
| `ProgressBar` | WaterProgress, NutritionSummary | `ProgressBar` / `ProgressRing` | Low |
| `TextInput` / `NumberInput` / `TextArea` | Login, Settings, tracking, meal | `TextField` (+ multi-line addition) | Medium |
| `Table` | WeightHistory | DS rows | Medium |
| `DateInput` | Dashboard, MealBuilder | **No DS equivalent** | **High** — see `06` |
| `Badge`, `Text`, `Grid`, `VStack` | scattered | `Chip`, type utilities, flex/grid | Low |

## Components needed that Gtrak DS does not have

Each follows DS rules (pill controls, `surface-2` quiet surfaces, 600-weight numbers, colour only for data) and should be proposed back to Gtrak DS.

| Proposed | Why | Built from |
|---|---|---|
| `AppShell` (tab-root) | DS only specifies `OnboardingLayout`; Home/Progress/Settings need a documented frame | header row + content + `TabBar` + `Fab` |
| `TextArea` | Daily notes need multi-line; DS has none | `TextField` at `radius-md`, `surface-2`, `subhead` |
| `DatePicker` / date pills | Dashboard, MealBuilder and History are all date-scoped; DS has `WeekStrip` (7 days only) and `WheelPicker` (birthday) but no arbitrary date navigation | `WeekStrip` + `IconButton` prev/next, or `WheelPicker` |
| `WorkoutSelector` | PPL/Rest is Gtrak-specific | `SegmentedControl` or `OptionGroup` |
| `UndoBanner` | DS `NoticeCard` dismisses but carries no action | `NoticeCard` + `Button` `ghost` |
