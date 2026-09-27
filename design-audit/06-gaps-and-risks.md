# 06 — Gaps and risks

## A. What Gtrak DS does not cover

| Gap | Impact | Proposal |
|---|---|---|
| **Dark theme** | DS states outright: *"Dark theme: not present in the source"*, and `tokens.json` declares one theme (`light`). The app is dark-only today | Resolved by decision 1 — go light. Dark becomes a separate design project, not a port |
| **Desktop / responsive** | Every value measured at 393×852pt only. No breakpoints, no wide-screen guidance | Resolved by decision 2 — centred phone-width column. Every screen still needs checking at 1290px |
| **Date navigation** | DS has `WeekStrip` (7 days) and `WheelPicker` (birthday) but nothing for arbitrary date browsing. Gtrak is date-scoped on three screens | New component, DS rules. See the Astryx `DateInput` risk below |
| **Multi-line text** | No textarea. Daily notes need one | Extend `TextField`: `radius-md`, `surface-2`, `subhead` |
| **Gtrak's own domains** | No component for tretinoin, PPL workouts, water or daily notes | Compose from `SettingRow`, `SegmentedControl`, `Chip`, `ProgressRing` |
| **Error / warning colours** | No `error` or `warning` token. `TextField`'s error state borrows `protein` | Formalise `protein` as error; propose a `warning` token or reuse `streak` |
| **Undo affordance** | `NoticeCard` dismisses but carries no action | `NoticeCard` + `ghost` Button |
| **Logo** | *"No logo supplied yet."* Wordmark only | Set "Gtrak" in `large-title` 600. Do not draw a mark (explicit DS instruction) |
| **Icons, illustrations, brand logos** | The Figma export is raster-only, so the DS `Icon` set is a **substitute**; animal speed marks, laurels and Apple/Google logos were never extracted | Keep DS icon names so licensed originals can drop in. Keep the Google brand SVG as-is |
| **Streak** | DS gives streak prominent treatment (`StreakCard`, Home chip, `streak` colour) — Gtrak has no streak concept | Open question 3: build one, or leave the surface unused |
| **Meal photos** | `FoodLogCard` is built around a photo; Gtrak meals have none | Use the documented neutral placeholder, or drop the photo column |

## B. Lossy (v1) values still in the DS

The CHANGELOG marks these as estimated from compressed marketing images, not measured:

`success`, `success-text`, `success-soft`, `day-over`, `day-met`, `avatar`, `avatar-2`, `camera-tile`, `glass`, `on-ink-muted`, `fill`, `line-strong`, `streak-soft`, `title-1`, `radius-xl`, `control-md`, `label` size, `TabBar` `pill` variant, `WeekStrip` `rings` variant.

**Consequence for this project:** the weight chart (`success`), the segmented control track (`fill`) and the `WeekStrip` `rings` variant all sit on lossy values. Prefer the measured alternatives where a choice exists — `WeekStrip` `letters` over `rings`, `TabBar` `bar` over `pill`.

## C. Contrast pairs flagged by Gtrak DS

Carried from the source deliberately. Every one must be paired with a text label — the DS is explicit: *"Never let these carry meaning alone."*

| Token | Ratio | Where it bites in Gtrak |
|---|---|---|
| `ink-3` `#9a999e` | **2.83:1 — fails** | Placeholders, helper lines |
| `ink-4` `#cfcfcf` | **1.56:1** | Inactive unit label, far wheel rows — decorative only |
| `carbs` / `accent` `#df9a65` | **2.35:1 — fails for text** | Carbs ring **and** carbs numerals. Must print "Carbs" beside it |
| `fat` `#6596dd` | **3.02:1** | Fat ring/label |
| `protein` `#dd6668` | **3.4:1** | Protein ring/label, and the error state |
| `streak` `#f69716` | **2.24:1** | Icon/large only |
| `ink-2` on `surface-2` | **4.33:1** | Secondary text on lavender — **keep ≥15px** |
| white on `avatar` | **2.46:1 — fails** | Not used in Gtrak yet |
| `success-text` on `success-soft` | **3.71:1 — fails at 13px** | DS offers `#2f7a5c` (4.72:1) if you need AA |

**How the redesigned app must compensate:** every macro number prints its label ("184g" + "Protein left"); no chart relies on line colour alone — the selected point shows a value; the disabled CTA stays `disabled` grey (exempt) but the enabled one is `ink` at 17.2:1.

This is a **net accessibility improvement** over today: the current `ProgressCard` encodes status purely as bar colour (green/orange/red) with no non-colour signal.

## D. Technical risks

| Risk | Severity | Detail | Mitigation |
|---|---|---|---|
| **Astryx `DateInput` removal** | **High** | Used on Dashboard and MealBuilder. `MEMORY.md` §4 documents a hard-won bug: the calendar popover renders inline (no portal) and dies under `pointer-events-none`. No DS equivalent exists | Build the DS date control **before** removing Astryx; keep the documented overlay pattern; test the popover explicitly |
| **Astryx reset + runtime theme** | Medium | `@astryxdesign/core/reset.css` and runtime style injection compete with DS tokens. The console already warns about runtime injection | Remove Astryx CSS imports only in the final phase, once no Astryx component remains |
| **Tailwind v4 `@theme inline`** | Medium | DS assumes a clean Tailwind v4 theme. The app layers `@layer` ordering, Astryx's `tailwind-theme.css` and its own `:root` | Rebuild `index.css` from the DS token file in Phase 0, verifying layer order |
| **Strict TS build** | Medium | `noUnusedLocals`/`noUnusedParameters` fail Vercel on any orphaned import mid-migration | Run `npm run build` at every step; never leave a half-migrated file |
| **Font swap changes every metric** | Medium | DS type sizes assume Hanken's widths (within 1.5% of the source). Poppins is wider | Swap the font in Phase 0, before any layout work, so all later sizing is measured against the real face |
| **Bundle size** | Low | ~1.68MB JS today with a known chunk warning. Removing Astryx + StyleX should **reduce** it; 4 woff2 files add ~64KB | Measure before/after; self-hosted fonts remove a CDN round-trip |
| **`--color-surface-alt` / `--color-text-muted`** | Low but live | Undefined in 7 files today — backgrounds render as nothing | Fixed for free during tokenisation |
| **Recharts vs DS charts** | Medium | DS `WeightChartCard` is a bespoke interactive chart, not Recharts. Reimplementing its hover/drag/arrow-key selection is real work | Keep Recharts, restyle to DS tokens; adopt the DS interaction model later |

## E. Product risks

1. **Dark → light on a daily-habit app.** The single most visible change. Recommend building Home light behind a flag or on a branch and living with it for a day before committing.
2. **Losing the batch "Submit daily log".** A real behaviour change, not styling. Needs explicit approval.
3. **Five tabs → three.** Meals moves behind the FAB and History merges into Progress. Muscle memory changes.
4. **Losing the gothic periwinkle identity.** `#a3b5d6` has no DS equivalent; the DS accent is warm. This is an identity decision, not a token swap.
5. **Dashboard density.** The DS Home cannot hold ten trackers. Something must move, and that is an IA decision only you can make.

## F. Things that must not break

Preserve exactly — list of what I'd have to touch:

- **Data flow** — Component → store → repository → Firestore. The redesign touches presentation only; no repository or store signature should change.
- **Auth + seat cap** — built and verified this session.
- **`cleanForFirestore()` on writes; `??` for optional numerics.**
- **Meal-name-required validation.**
- **24h meal undo.**
- **Tretinoin every-3rd-night maths.**
- **Type-to-confirm reset.**
- **Accessibility labels** — Astryx `ProgressBar`/`TextInput` carry real `label` props today; DS components must keep equivalents.

There are **no analytics events and no test IDs** in the codebase, so nothing is at risk there — and no test suite, which means **visual verification is the only safety net**. That shapes the migration plan.

## G. Decisions still needed from you

1. Which three tabs (proposal in `05`)?
2. Where do Workout / Water / Tretinoin / Notes / Weight live once Home is a DS Home?
3. Remove the batch "Submit daily log"?
4. Add a streak concept, or leave that DS surface unused?
5. Keep lucide icons or adopt the DS `Icon` set?
6. Accept losing the periwinkle accent?
7. `FoodLogCard` without photos — placeholder or no photo column?
