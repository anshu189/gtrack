# 05 — Navigation and flows

> Rewritten after the scope correction in `00`. **Navigation structure does not change.** All 5 tabs stay, in the same order, with the same routes. This file now covers restyling the bar and the one behaviour change that was approved.

## Tab bar — restyle only

| | Old (Gtrak app) | New (Gtrak DS styling) |
|---|---|---|
| Tabs | 5: Dashboard · Meals · History · Analytics · Settings | **Same 5, same order, same routes** |
| Bar | `fixed`, custom, `bg-white dark:bg-[#101314]`, 1px top border | `surface` white, `shadow-float`, DS height |
| Icon container | 36px **square** tile, `bg-[#1a1d20]` when active | No tile — 24px DS icon, **filled** when active |
| Icon size | 16px (`h-4 w-4`) | **24px** (DS tab-bar spec) |
| Label | `text-[10px] font-medium` | `caption` 12/15/500 |
| Active | `bg-[#1a1d20] text-[#E8F1F6]` | `black` label + filled icon |
| Inactive | `text-[#96A0AB]` | `ink-2` `#767578` |
| Height | ~64px + `py-2` | 88px (DS `bar`) incl. safe area |

**Intentional addition to Gtrak DS:** the DS `TabBar` `bar` variant is specified for **three** tabs plus a FAB. Gtrak needs **five and no FAB**. The adaptation keeps every DS rule (24px icons, `caption` labels, black-filled active, `ink-2` inactive, white `surface` bar) and only changes the column count. Item width drops from the DS's `w-[76px]` to an even 5-way split. This should be proposed back to Gtrak DS as a `bar-5` variant.

**No FAB.** The DS puts logging behind a 64px `ink` FAB because its Home has no Meals tab. Gtrak keeps its Meals tab, so a FAB would be a second, competing route to the same action. Omitted deliberately.

## Routes — unchanged

`/` Dashboard · `/meals` MealBuilder · `/history` History · `/analytics` Analytics · `/settings` Settings. No redirects needed.

## Screen frame

`ScreenHeader` `large` (left-aligned `large-title` 34/38/600) replaces each page's ad-hoc `<h1>`. No `nav` variant is needed — there are no pushed screens; every screen is a tab root.

## Flows

### Auth — keep, restyle only
`Login → seat claim → provisionUser → Dashboard`. Built and verified this session. Presentation only.

### Daily logging — one approved behaviour change

**Old:** most trackers auto-save, but **weight buffers** in Dashboard state (`pendingWeight`, `pendingWeightUnit`, `pendingWeightNotes`) and only persists when "Submit daily log" is pressed.

**New:** weight auto-saves on change like everything else; **"Submit daily log" is removed**.

**Why this is safe:** the button's only remaining job is flushing the weight buffer. Everything else on the Dashboard already writes through on interaction — water on each quick-add, workout on select, tretinoin on toggle, notes on a 500 ms debounce.

**Implementation requirement (non-negotiable):** the weight write must be debounced, not fired per keystroke, or every digit typed becomes a Firestore write. Plan: 600 ms debounce on the weight/unit/notes triple, writing through `weightStore.save()` exactly as the Submit handler does today, plus a flush on blur and on date change so a value can never be stranded.

**Verification before removing the button:** type a weight, wait, navigate to another tab and back — the value must still be there. Then reload. Then check the History tab shows it for that day.

### Editing a past day — unchanged
History tab remains the place to edit any past day. This is what makes removing Submit safe: nothing becomes uneditable.

### Meal building — keep, restyle
`Meals tab → name → create → search food → quantity → save`. Meal-name-required validation preserved; the DS `TextField` inline action (`disabled-2` until input, then black) expresses it natively.

### Data ownership — keep, restyle
Settings → Export / Import / Reset, typed confirmation already implemented.

## Onboarding — out of scope

17 DS components serve onboarding only. Three are still built because the existing screens need them: `ContinueBar` (pinned save on History edit), `PlanSummary` + `PlanMacroCard` (the five nutrition targets in Settings), `NoticeCard` (errors, undo). `WheelPicker` and `RulerPicker` are **also built**, not for onboarding but because they are the DS's answer to weight entry — see `02`.

The remaining components stay unbuilt until you want a real onboarding flow.
