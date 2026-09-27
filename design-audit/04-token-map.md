# 04 — Token map: every hard-coded value → Gtrak DS token

175 hex occurrences (36 distinct), ~120 raw Tailwind palette classes, plus undefined variables. All of it resolves into the Gtrak DS token set.

## A. The namespace collision (must be solved first)

Both systems define `--color-*`, with **opposite meanings**:

| Variable | Gtrak app (old) | Gtrak DS | 
|---|---|---|
| `--color-bg` | `#101314` (near-black) | `canvas` `#ffffff` |
| `--color-surface` | `#1a1d20` (dark grey) | `surface` `#ffffff` |
| `--color-text` | `#E8F1F6` (near-white) | `black` `#000000` |
| `--color-border` | `#24292D` | `line` `#ececec` |
| `--color-muted` | `#96A0AB` | `ink-2` `#767578` |

**Rule:** delete the app's `:root` and `.dark` blocks ([src/index.css:13-53](../src/index.css)) wholesale and import the Gtrak DS token file. Do not attempt to alias one onto the other — the semantics differ (`surface` is the *dark card* in the app and the *white card* in the DS), so aliasing would silently produce wrong results.

## B. Dark gothic palette → Gtrak DS

The app's entire palette inverts. `files` = how many source files carry the literal.

| Old (Gtrak app) | Files | Role today | New (Gtrak DS) | Note |
|---|---|---|---|---|
| `#101314` | 5 | page background | `canvas` `#ffffff` | Full inversion |
| `#1a1d20` | 6 | card surface | `surface` `#ffffff` + `shadow-card` | Border disappears, shadow replaces it |
| `#24292D` | 9 | borders | `line` `#ececec` *or drop entirely* | DS Home cards have **no border** |
| `#E8F1F6` | 10 | primary text | `black` `#000000` | |
| `#96A0AB` | 7 | muted text | `ink-2` `#767578` | Keep ≥15px on `surface-2` (4.33:1) |
| `#FDFDFD` | 7 | text (legacy, pre-gothic) | `black` `#000000` | Mostly `dark:text-[#FDFDFD]` leftovers |
| `#2D2D2D` | 4 | legacy border | `line` `#ececec` | |
| `#1F1F1F` | 2 | legacy input bg | `surface-2` `#f9f8fd` | |
| `#111111` | 2 | legacy bg | `canvas` `#ffffff` | |
| `#0c0c0c` | 2 | logo tile | `black` `#000000` | |
| `#2a2f34` | 1 | button hover | `fill-strong` `#ececec` | |
| `#333333` | 1 | primary-strong | `ink` `#1c1a22` | |
| `#cccccc` | 1 | primary-strong (dark) | `ink-4` `#cfcfcf` | Near-exact |
| `#a3b5d6` (+`33`) | 1 | gothic accent periwinkle | **No DS equivalent** | DS `accent` is warm `#df9a65`. The periwinkle identity is dropped — flag for sign-off |
| `#b3c79a` (+`33`) | 2 | gothic success sage | `success` `#349470` | DS value is lossy (v1) |
| `#c6a6a2` (+`33`) | 2 | gothic error dusty rose | `protein` `#dd6668` | DS has no dedicated error colour; `protein` is the red |
| `#d3c490` (+`33`) | 2 | gothic warning aged gold | `carbs` `#df9a65` / `streak` `#f69716` | DS has no warning role |
| `#c89aab` | 2 | stray pink | — | Unused role; delete |

## C. Light-theme leftovers → Gtrak DS

| Old | Files | New | Note |
|---|---|---|---|
| `#ffffff` | 1 | `canvas` / `surface` | Same value, now tokenised |
| `#000000` | 1 | `black` | Exact |
| `#e2e8f0` (slate-200) | 2 | `line` `#ececec` | |
| `#64748b` (slate-500) | 2 | `ink-2` `#767578` | |
| `#16a34a` | 2 | `success` `#349470` | |
| `#dc2626` | 2 | `protein` `#dd6668` | |
| `#ea580c` | 2 | `carbs` / `streak` | |
| `#2563eb`, `#7c3aed`, `#0ea5e9` | 1 each | Recharts series | Re-map to `protein` / `carbs` / `fat` |

**Excluded from tokenising:** `#4285F4`, `#34A853`, `#FBBC05`, `#EA4335` in [GoogleSignInButton.tsx](../src/components/auth/GoogleSignInButton.tsx) are Google's brand marks. Gtrak DS explicitly omits third-party logos — keep them literal.

## D. Tailwind palette classes → Gtrak DS

| Old class | Uses | New |
|---|---|---|
| `text-slate-950` | 32 | `text-black` |
| `text-slate-500` | 33 | `text-ink-2` |
| `border-slate-200` | 17 | `border-line` or remove |
| `text-slate-600` | 6 | `text-ink-2` |
| `bg-slate-50` | 5 | `bg-canvas` |
| `bg-slate-100` | 4 | `bg-surface-2` |
| `text-slate-700` | 2 | `text-black` |
| `text-slate-400` | 2 | `text-ink-3` |
| `text-red-400/600`, `border-red-400` | 9 | `text-protein` |
| `text-green-600`, `bg-green-500` | 3 | `text-success` |
| `bg-orange-500` | 1 | `bg-carbs` |
| `bg-red-500/600/700` | 3 | `bg-protein` (or `ink` — DS forbids status-coloured buttons) |
| `bg-neutral-800`, `text-neutral-700` | 3 | `bg-ink`, `text-ink-2` |
| `text-gray-500` | 1 | `text-ink-2` |

## E. Undefined variables — live defects

| Variable | Files | Status | Fix |
|---|---|---|---|
| `--color-surface-alt` | **6** — `DeleteItemButton`, `FoodMacroEditor`, `FoodPicker`, `MealCard`, `NutritionSummary`, `MealBuilder` | **Never defined.** Renders with no background | → `surface-2` `#f9f8fd` |
| `--color-text-muted` | 1 — `NutritionSummary` | **Never defined.** Colour falls back to inherit | → `ink-2` `#767578` |

## F. Typography

| Old | New (Gtrak DS) |
|---|---|
| **Poppins** 300–700, Google Fonts CDN ([index.html:9](../index.html)) | **Hanken Grotesk** 400/500/600/700, bundled woff2 — self-hosted, no CDN request |
| Inter fallback | `-apple-system, BlinkMacSystemFont, system-ui, sans-serif` |

| Old utility | Uses | New | Size change |
|---|---|---|---|
| `text-sm` | **124** | `body` 17/19/400 or `chip` 14 | 14 → 17 for body |
| `text-xs` | 59 | `caption` 12/15/500 or `footnote` 13 | ~same |
| `text-base` | 18 | `headline` 17/22/600 | |
| `text-md` | **12** | `title-2` 20/26/600 | **`text-md` is not a Tailwind class — these 12 currently do nothing.** Most Dashboard section headings are affected |
| `text-lg` | 10 | `title-2` 20 | |
| `text-xl` | 10 | `large-title` 34 or `title-2` 20 | Page titles → 34/600 |
| `text-2xl` | 3 | `large-title` 34/38/600 | |
| `text-3xl` | 1 | `large-title` 34 | |
| `text-[11px]` | 10 | `caption` 12 | |
| `text-[10px]` | 5 | `caption` 12 | Below DS minimum |
| `text-[12px]` | 2 | `caption` 12 | |

**Weight law:** 600 for every title and number (DS never goes heavier — drop `font-bold`); 500 for option labels and captions; 400 for running text.

## G. Shape

| Old | Uses | New |
|---|---|---|
| `rounded-lg` (Tailwind 8px) | **80** | Depends on role: `radius-md` 15 rows/inputs, `radius-lg` 20 Home cards, `radius-pill` controls |
| `rounded-full` | 6 | `radius-pill` |
| `rounded-md` | 3 | `radius-md` 15 |
| `rounded-sm`, `rounded` | 4 | `radius-sm` 12 |
| `rounded-xl` | 1 | `radius-lg` 20 |
| *(no radius)* — `ui/card.tsx`, `ui/button.tsx` | 2 components | `radius-lg` / `radius-pill` |

A blanket find-and-replace of `rounded-lg` would be **wrong** — the DS assigns radius by component role, not by one global value.

## H. Spacing

The app uses ad-hoc Tailwind spacing. Gtrak DS is measured:

| Context | Old | New |
|---|---|---|
| Page gutter | `px-4 sm:px-6 lg:px-8` | Home `30px`; onboarding `24px`; pinned CTA `16px` |
| Card stack gap | `gap-3` / `space-y-6` mixed | `space-3` (12) between cards and rows |
| Title → subtitle | ad-hoc | `space-5` (20) |
| Section gap | `mb-6` | `space-8` (32) |
| Card padding | `p-4` / `p-5` | `space-5` (20) large cards, `space-4` (16) rows |

## I. Elevation

App is flat everywhere (borders only). DS:

| Use | Token |
|---|---|
| Home cards | `shadow-card` `0 4px 16px #1c1a220f` |
| FAB, slider thumb, floating | `shadow-float` |
| Above pinned CTA | `shadow-cta` |
| Keyboard focus | `shadow-focus` — **the app has no focus styling at all today** |

## J. Arbitrary pixel values

| Old | Uses | New |
|---|---|---|
| `[5px]` | 12 | logo dots — keep (brand mark) |
| `[11px]` | 10 | → `caption` 12 |
| `[10px]` | 5 | → `caption` 12 |
| `[6px]`, `[12px]` | 4 | → `space-2` / `space-3` |

## K. Icons

App uses lucide-react for navigation only. Gtrak DS ships 43 hand-drawn 24px glyphs on `currentColor`.

| Old (lucide) | New (DS `Icon`) | Note |
|---|---|---|
| `Home` | `home` | Tab |
| `BarChart3` | `chart` / `progress` | Tab |
| `Settings2` | `settings` | Tab |
| `UtensilsCrossed` | — | Tab being removed; FAB takes logging |
| `Clock` | `clock` | History merging into Progress |
| — | `flame` | **New** — calorie ring + streak |
| — | `plus` | **New** — FAB |
| — | macro marks | **New** — protein/carbs/fat |

**Decision needed:** keep lucide (consistent, maintained, but not the DS's drawings) or adopt the DS `Icon` set (matches the system, but the DS states these are substitutes for un-extractable originals). Recommendation: adopt the DS set so icon weight matches the 2px-round-stroke rule, and keep the names so licensed originals can drop in later.

## L. Values with no sensible Gtrak DS token

| Value | Where | Proposal |
|---|---|---|
| Periwinkle `#a3b5d6` | gothic accent | **Drop.** DS `accent` is warm. Dropping it is the biggest single identity change — needs your sign-off |
| Warning role | `#d3c490` | **No DS warning colour exists.** Propose adding `warning` to Gtrak DS, or reuse `streak` `#f69716` |
| Error role | `#c6a6a2` | DS has no error token; `TextField` error state uses `protein`. Propose formalising `protein` as the error colour |
| Water colour | `WaterProgress` | DS has no water/hydration colour. Use `ink` (chrome) rather than invent one |
| Dark-mode anything | everywhere | Out of scope by decision |
