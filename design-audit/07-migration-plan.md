# 07 — Migration plan

Phased so the app stays shippable at the end of every phase. There is **no test suite**, so every phase ends in explicit visual verification, and every phase is one branch off `v2`.

Ground rules for all phases:
- `npm run build` green before any phase is called done (strict TS fails Vercel).
- Never push to `main` until a phase is verified.
- One phase per branch; roll back = abandon the branch.
- No repository, store or type signature changes — presentation only.

---

## Phase 0 — Foundations (no visual regressions yet)

Wire Gtrak DS's foundation in without touching a single screen.

**Files touched**
- `src/index.css` — replace the `:root`/`.dark` blocks ([:13-53](../src/index.css)) with the DS token set; add `@theme inline`; add the four `@font-face` rules
- `index.html` — remove the Google Fonts link ([:7-9](../index.html)); **remove `class="dark"`** ([:2](../index.html))
- `public/fonts/` — copy the four `HankenGrotesk-*.woff2` files from Gtrak DS
- `src/lib/utils/cn.ts` — unchanged
- **New:** `design-system/` — the DS token CSS, vendored so it is version-pinned

**Effort:** S–M (half to one day)

**Verify:** app still builds and runs; text renders in Hanken Grotesk; every screen looks *wrong but functional* (dark classes now resolve against light tokens). This phase is deliberately ugly — that is the signal it worked.

**Roll back:** revert `index.css` + `index.html`.

> **Checkpoint with you before Phase 1.** This is the moment the app goes light.

---

## Phase 1 — Atoms behind adapters

Build DS atoms and swap them in *behind the existing component APIs*, so no screen has to change yet.

**Build:** `Button`, `IconButton`, `Chip`, `TextField`, `ProgressRing`, `ProgressBar`, `Switch`, `SegmentedControl`, `Stepper`, `Icon`.

**Adapter strategy:** `src/components/ui/button.tsx` keeps its current props (`variant: 'default' | 'secondary' | 'outline' | 'ghost' | 'danger'`, `size: 'sm' | 'md' | 'lg'`) and maps them internally to DS variants. Screens importing it get the new look with zero edits. Same for `card.tsx`.

| Old prop | Maps to DS |
|---|---|
| `variant="default"` | `primary` (`ink`) |
| `variant="secondary"` | `secondary` |
| `variant="outline"` | `outline` |
| `variant="ghost"` | `ghost` |
| `variant="danger"` | `secondary` — **DS forbids status-coloured buttons**; flag each use |
| `size="lg"` | 58px | 
| `size="md"` | 48px |
| `size="sm"` | 36px |

**Also in this phase:** fix `--color-surface-alt` (6 files) and `--color-text-muted` (1) by pointing them at `surface-2` / `ink-2`; delete `ui/section.tsx` and `ui/typography.tsx` (dead code).

**Files touched:** ~12 new component files, 2 adapters rewritten, 7 files with the undefined-var fix, 2 deletions.

**Effort:** M–L (3–5 days)

**Verify:** every screen at 393px and 1290px; buttons are pills at the right heights; inputs are 63px `surface-2`; screenshot each of the 6 screens before/after.

**Roll back:** adapters keep old implementations behind a flag for one phase.

---

## Phase 2 — Molecules and navigation

**Build:** `TabBar` (`bar`) + `Fab`, `ScreenHeader`, `WeekStrip` (`letters`), `CalorieCard`, `MacroCard`, `MacroTile`, `FoodLogCard`, `IngredientRow`, `SettingRow`, `NoticeCard`, `PlanSummary` + `PlanMacroCard`, `ContinueBar`, plus the new `AppShell`, `TextArea` and date control from `02`.

**Navigation change:** 5 tabs → 3 + FAB; `/meals` becomes a pushed `/log`; `/history` + `/analytics` merge into `/progress`; old routes kept as redirects.

**Files touched:** `src/App.tsx`, `src/components/ui/app-shell.tsx`, `bottom-navigation.tsx`, ~14 new components.

**Effort:** L (5–8 days)

**Verify:** navigate every route and redirect; FAB opens logging; back works from pushed screens; tab bar at both widths; **specifically re-test the date control's popover** against the `MEMORY.md` §4 gotcha.

**Roll back:** navigation is one commit — revert `App.tsx` and the shell.

---

## Phase 3 — Screen by screen, highest traffic first

One screen per branch, in this order:

| # | Screen | Why this order | Effort |
|---|---|---|---|
| 1 | **Home** (Dashboard) | Highest traffic, biggest visual payoff, proves the system | L |
| 2 | **Log food** (MealBuilder) | Second-highest traffic; the FAB's destination | L |
| 3 | **Settings** | Smallest risk, exercises `PlanSummary` + `SettingRow` | M |
| 4 | **Progress** (Analytics + History) | Largest merge, most new IA | L |
| 5 | **Login** | Lowest traffic, seen once | S |

Each screen follows its section in `03-screen-map.md`, including the copy rewrites.

**Verify per screen:** compare against `reference/screenshots/` and the `gtrak-board.html` component board; check both widths; confirm behaviour listed in "Behaviour to preserve" in `02`.

---

## Phase 4 — Cleanup

- Remove `@astryxdesign/core`, `@astryxdesign/theme-gothic`, `@astryxdesign/cli`, `@stylexjs/stylex` from `package.json`
- Remove Astryx CSS imports from `src/index.css`
- Delete the `astryx` key and script from `package.json`
- Update `AGENTS.md` — it is entirely Astryx workflow instructions and becomes wrong the moment Astryx goes
- Update `MEMORY.md` §4 (design system) and the four `docs/` files
- Grep for surviving hard-coded values; target **zero** hex literals outside the Google brand SVG
- Re-measure bundle size

**Effort:** M (2–3 days)

**Verify:** `npm run build` green; `grep -rE "#[0-9a-fA-F]{3,8}" src/` returns only the Google mark; full pass over all 6 screens; bundle size compared to the 1.68MB baseline.

---

## Sequencing summary

| Phase | Effort | Shippable at end? | Biggest risk |
|---|---|---|---|
| 0 — Foundations | S–M | Yes (ugly) | Theme inversion is visible immediately |
| 1 — Atoms | M–L | Yes | Adapter prop mismatches |
| 2 — Molecules + nav | L | Yes | `DateInput` replacement |
| 3 — Screens | L each | Yes per screen | Home IA decisions |
| 4 — Cleanup | M | Yes | Astryx removal surprises |

**Total: roughly 4–6 weeks of focused work.**

## Before Phase 0 starts

The seven open questions in `06 §G` are not all blocking, but these three are, because they change Phase 2 and 3 structure:

1. **Which three tabs** — blocks Phase 2 navigation
2. **Where the demoted Dashboard sections go** — blocks Phase 3 Home
3. **Whether "Submit daily log" is removed** — blocks Phase 3 Home

The rest (streak, icons, periwinkle, meal photos) can be decided during Phase 3 without reordering anything.
