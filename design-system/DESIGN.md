# Gtrak — DESIGN.md

> Growth Tracker for G's. Source of truth for building Gtrak UI in code. Mirrors the Gtrak design system artifact.
> Stack: React 18 + Tailwind CSS v4. Font: Hanken Grotesk (OFL, woff2 400/500/600/700 in `fonts/`).
> v2 — values measured from the 3x Figma export (34 onboarding + home screens); items marked lossy come from the v1 marketing screenshots.

## 1. Principles
1. One question, one action — 34px title, one-line reason, centred answer UI, one pinned full-width CTA (disabled until answered).
2. Numbers are the hero — one big semibold figure per card; small label under it.
3. Monochrome chrome, coloured data — black text/selection, ink buttons, lavender-white (`surface-2`) quiet surfaces; colour only for macros, streak and the warm `accent`.
4. Flat onboarding (no shadows/borders on options), soft Home (white cards on `shadow-card`).
5. Encourage, don't scold — short, positive copy.

## 2. Tokens (CSS custom properties)
```css
:root {
  --black: #000000;
  --ink: #1c1a22;
  --ink-2: #767578;
  --ink-3: #9a999e;
  --ink-4: #cfcfcf;
  --on-ink: #ffffff;
  --on-ink-muted: #a09ea6;
  --canvas: #ffffff;
  --canvas-glow: #f0eae7;
  --canvas-glow-2: #e3e8e9;
  --surface: #ffffff;
  --surface-2: #f9f8fd;
  --fill-subtle: #f5f5f5;
  --fill: #f0eff4;
  --fill-strong: #ececec;
  --track: #e8e8e8;
  --ring-track: #eff1f7;
  --slider-track: #e0e0e0;
  --line: #ececec;
  --line-strong: #d8d8d8;
  --disabled: #bababc;
  --disabled-2: #c0bfc6;
  --protein: #dd6668;
  --carbs: #df9a65;
  --fat: #6596dd;
  --accent: var(--carbs);
  --tint-over: #fbf0ef;
  --success: #349470;
  --success-text: #3e8c6c;
  --success-soft: #eaf8ef;
  --streak: #f69716;
  --streak-soft: #fce298;
  --day-over: #bc6c70;
  --day-met: #8fce89;
  --avatar: #5ab0ce;
  --avatar-2: #84c8e0;
  --camera-tile: #222220;
  --glass: rgba(56, 56, 52, 0.72);
  --focus: var(--ink);
  --shadow-card: 0 4px 16px #1c1a220f;
  --shadow-float: 0 12px 32px #1c1a2217, 0 2px 8px #1c1a220a;
  --shadow-cta: 0 -24px 48px #0000000a;
  --shadow-focus: 0 0 0 2px #ffffff, 0 0 0 4px #1c1a22;
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 20px;
  --space-6: 24px;
  --space-gutter-home: 30px;
  --space-8: 32px;
  --space-10: 40px;
  --radius-xs: 8px;
  --radius-sm: 12px;
  --radius-md: 15px;
  --radius-lg: 20px;
  --radius-xl: 28px;
  --radius-pill: 9999px;
  --control-xl: 58px;
  --control-md: 48px;
  --control-sm: 36px;
  --option-row: 69px;
  --option-row-2: 90px;
  --input-height: 63px;
  --icon-button: 40px;
  --fab-size: 64px;
  --step-bar: 3px;
  --slider-bar: 4px;
  --ring-stroke: 12px;
  --switch-w: 51px;
  --font-ui: "Hanken Grotesk", -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
}
```

## 3. Tailwind v4 theme
Load the tokens above first, then:
```css
@import "tailwindcss";
@font-face { font-family: "Hanken Grotesk"; font-weight: 400; src: url(./fonts/HankenGrotesk-400.woff2) format("woff2"); }
@font-face { font-family: "Hanken Grotesk"; font-weight: 500; src: url(./fonts/HankenGrotesk-500.woff2) format("woff2"); }
@font-face { font-family: "Hanken Grotesk"; font-weight: 600; src: url(./fonts/HankenGrotesk-600.woff2) format("woff2"); }
@font-face { font-family: "Hanken Grotesk"; font-weight: 700; src: url(./fonts/HankenGrotesk-700.woff2) format("woff2"); }
@theme inline {
  --font-sans: var(--font-ui);
  --color-black: var(--black);
  --color-ink: var(--ink);
  --color-ink-2: var(--ink-2);
  --color-ink-3: var(--ink-3);
  --color-ink-4: var(--ink-4);
  --color-on-ink: var(--on-ink);
  --color-on-ink-muted: var(--on-ink-muted);
  --color-canvas: var(--canvas);
  --color-canvas-glow: var(--canvas-glow);
  --color-canvas-glow-2: var(--canvas-glow-2);
  --color-surface: var(--surface);
  --color-surface-2: var(--surface-2);
  --color-fill-subtle: var(--fill-subtle);
  --color-fill: var(--fill);
  --color-fill-strong: var(--fill-strong);
  --color-track: var(--track);
  --color-ring-track: var(--ring-track);
  --color-slider-track: var(--slider-track);
  --color-line: var(--line);
  --color-line-strong: var(--line-strong);
  --color-disabled: var(--disabled);
  --color-disabled-2: var(--disabled-2);
  --color-protein: var(--protein);
  --color-carbs: var(--carbs);
  --color-fat: var(--fat);
  --color-accent: var(--accent);
  --color-tint-over: var(--tint-over);
  --color-success: var(--success);
  --color-success-text: var(--success-text);
  --color-success-soft: var(--success-soft);
  --color-streak: var(--streak);
  --color-streak-soft: var(--streak-soft);
  --color-day-over: var(--day-over);
  --color-day-met: var(--day-met);
  --color-avatar: var(--avatar);
  --color-avatar-2: var(--avatar-2);
  --color-camera-tile: var(--camera-tile);
  --color-glass: var(--glass);
  --color-focus: var(--focus);
  --radius-xs: 8px;
  --radius-sm: 12px;
  --radius-md: 15px;
  --radius-lg: 20px;
  --radius-xl: 28px;
  --radius-pill: 9999px;
  --shadow-card: 0 4px 16px #1c1a220f;
  --shadow-float: 0 12px 32px #1c1a2217, 0 2px 8px #1c1a220a;
  --shadow-cta: 0 -24px 48px #0000000a;
  --shadow-focus: 0 0 0 2px #ffffff, 0 0 0 4px #1c1a22;
}
@utility stat-xl { font-size: 44px; line-height: 48px; font-weight: 600; }
@utility large-title { font-size: 34px; line-height: 38px; font-weight: 600; }
@utility stat-lg { font-size: 34px; line-height: 38px; font-weight: 600; }
@utility title-1 { font-size: 24px; line-height: 30px; font-weight: 600; }
@utility stat-md { font-size: 20px; line-height: 24px; font-weight: 600; }
@utility title-2 { font-size: 20px; line-height: 26px; font-weight: 600; }
@utility headline { font-size: 17px; line-height: 22px; font-weight: 600; }
@utility btn-label { font-size: 17px; line-height: 22px; font-weight: 600; }
@utility option { font-size: 17px; line-height: 22px; font-weight: 500; }
@utility body { font-size: 17px; line-height: 19px; font-weight: 400; }
@utility callout { font-size: 16px; line-height: 20px; font-weight: 400; }
@utility subhead { font-size: 15px; line-height: 20px; font-weight: 400; }
@utility chip { font-size: 14px; line-height: 18px; font-weight: 500; }
@utility label { font-size: 14px; line-height: 18px; font-weight: 400; }
@utility footnote { font-size: 13px; line-height: 16px; font-weight: 500; }
@utility caption { font-size: 12px; line-height: 15px; font-weight: 500; }
```
Utilities you get: `bg-ink`, `text-ink-2`, `bg-surface-2`, `border-line-strong`, `text-protein`, `rounded-lg`, `rounded-pill`, `shadow-card`, `shadow-float`, `shadow-focus`, and type utilities `stat-xl` … `tab-label`. Spacing uses Tailwind's default 4px scale (`p-4` = 16px = `space-4`).

## 4. Colour roles
| Token | Value | Use |
|---|---|---|
| `black` | `#000000` | All primary text in the app (titles, subtitles, option labels, numbers) and the SELECTED option card fill; also Get Started, paywall CTA and Sign in with Apple. 21:1 on surface, 19.9:1 on surface-2. |
| `ink` | `#1c1a22` | Primary button fill (Continue, Yes/No), FAB, tooltip, calorie ring progress. Measured #1c1a22–#1e1a24 on every CTA. White on it 17.2:1. |
| `ink-2` | `#767578` | Secondary text: review body, labels under stats ('Calories left' context), axis labels. 4.58:1 on surface, 4.33:1 on surface-2 (just under 4.5 — keep it ≥15px there). |
| `ink-3` | `#9a999e` | Placeholders ('Referral Code') and helper lines ('You can edit this anytime'). 2.83:1 on surface, 2.68:1 on surface-2 — FAILS 4.5:1; kept from source. Never the only carrier of meaning. |
| `ink-4` | `#cfcfcf` | Inactive side of a binary label pair ('Metric' when Imperial is on) and the farthest wheel-picker values. 1.56:1 — decorative; the active side is black. |
| `on-ink` | `#ffffff` | Text and icons on ink / black fills. 17.2:1 on ink, 21:1 on black. |
| `on-ink-muted` | `#a09ea6` | Secondary text on ink (tooltip date). 6.5:1 on ink. Lossy estimate. |
| `canvas` | `#ffffff` | Screen background: onboarding is pure white; home is white under a top glow. |
| `canvas-glow` | `#f0eae7` | Warm top-right stop of the home screen's top gradient (measured #f0eae7–#f3eae8), fading to canvas by ~200pt. |
| `canvas-glow-2` | `#e3e8e9` | Cool top-left stop of the home top gradient (measured #e1e5e6–#e3e8e9). |
| `surface` | `#ffffff` | Cards, sheets, tab bar, chips on photos, inner plan cards. |
| `surface-2` | `#f9f8fd` | The app's signature lavender-white: unselected option cards, list rows, back button, language pill, inputs, review card, 'Daily recommendation' container, notification card. |
| `fill-subtle` | `#f5f5f5` | Wheel-picker selection pill, quiet rows. |
| `fill` | `#f0eff4` | Segmented control track. Lossy. |
| `fill-strong` | `#ececec` | Active tab pill, pressed quiet surfaces. |
| `track` | `#e8e8e8` | Step progress-bar track, switch off state (#e9e9e9), rollover chip, ruler fill (#e3e3e3). |
| `ring-track` | `#eff1f7` | Track behind every progress ring (calories, macros, plan cards). Cool, very light. |
| `slider-track` | `#e0e0e0` | Unfilled part of the speed slider (4pt). |
| `line` | `#ececec` | Card hairlines and dividers (1px). Decorative. |
| `line-strong` | `#d8d8d8` | Stepper and light outline-button borders (1px). Lossy. Decorative. |
| `disabled` | `#bababc` | Disabled primary button fill (Continue before a choice). White label on it 1.94:1 — disabled, exempt. |
| `disabled-2` | `#c0bfc6` | Disabled inline button inside an input (Submit). |
| `protein` | `#dd6668` | Protein ring, icon and label; also 'Yesterday' text and the red end of the setup gradient. Measured #da6365–#e4666c. 3.4:1 on surface. |
| `carbs` | `#df9a65` | Carbs ring, icon and label. 2.35:1 on surface — FAILS for text; kept from source. Pair with the word 'Carbs'. |
| `fat` | `#6596dd` | Fat ring, icon and label; also highlighted numbers like '200 cals'. Measured #6493db–#6698df. 3.02:1 on surface. |
| `accent` | `{carbs}` | Warm highlight: rating stars, laurels, the '6 kg' in statements, goal markers. Alias of carbs (measured identical #e09a63). |
| `tint-over` | `#fbf0ef` | Header tint on the 'Yesterday' rollover card, behind protein-coloured text (3.03:1). |
| `success` | `#349470` | Weight chart line to the selected point, positive trend arrow. 3.74:1 on surface (large text / marks only). Lossy (v1 marketing screenshots). |
| `success-text` | `#3e8c6c` | Encouragement banner text on success-soft. 3.71:1 — FAILS 4.5:1 for its 13px size; kept from source. Darken to #2f7a5c (4.72:1) if you need AA. Lossy (v1 marketing screenshots). |
| `success-soft` | `#eaf8ef` | Encouragement banner fill. Lossy (v1 marketing screenshots). |
| `streak` | `#f69716` | Streak flame and count. Measured #f69716 on the home streak pill. 2.24:1 — icon/large only. |
| `streak-soft` | `#fce298` | Flame highlight / inner glow. Lossy. |
| `day-over` | `#bc6c70` | Week-strip ring for a day that went over the calorie goal. Lossy (v1 marketing screenshots). |
| `day-met` | `#8fce89` | Week-strip ring for a day within goal. 1.85:1 — decorative; the selected state also changes the tile fill. Lossy (v1 marketing screenshots). |
| `avatar` | `#5ab0ce` | Default initials avatar fill (gradient to avatar-2). White initials on it are 2.46:1 — FAILS; use ink initials or a darker fill for AA. Lossy (v1 marketing screenshots). |
| `avatar-2` | `#84c8e0` | Top-left stop of the initials avatar gradient. Lossy (v1 marketing screenshots). |
| `camera-tile` | `#222220` | Unselected camera mode tiles (Barcode, Food Label) on the live camera view. Lossy (v1 marketing screenshots). |
| `glass` | `rgba(56, 56, 52, 0.72)` | Circular buttons floating over photos (back, share, more, close, flash). Approximated from #484844 over imagery; pair with backdrop-filter: blur(20px). Lossy (v1 marketing screenshots). |
| `focus` | `{ink}` | Keyboard focus ring colour (added for web). 17:1 on surface. |

## 5. Type scale
| Style | Size / line | Weight | Tracking | Use |
|---|---|---|---|---|
| `stat-xl` | 44px / 48px | 600 | 0 | Hero numbers: calories left on Home, setup percentage ('18%'). Measured cap 30.7–32pt. |
| `large-title` | 34px / 38px | 600 | 0 | Screen titles, left-aligned in onboarding (centred on statement screens). Measured cap 23.7pt, line pitch 38.2pt. |
| `stat-lg` | 34px / 38px | 600 | 0 | Picked values above rulers/sliders ('1.0 kg', '77.0 kg'). |
| `title-1` | 24px / 30px | 600 | 0 | Metric values in dashboard cards. Lossy (not in Figma set). |
| `stat-md` | 20px / 24px | 600 | 0 | Macro amounts on macro cards; rating '4.8'. |
| `title-2` | 20px / 26px | 600 | 0 | Section and card titles ('Daily recommendation', 'You should gain:'). |
| `headline` | 17px / 22px | 600 | 0 | Column headers, emphasised values, nav titles. |
| `btn-label` | 17px / 22px | 600 | 0 | All button labels (measured width matches 600 exactly). |
| `option` | 17px / 22px | 500 | 0 | Option-card and list-row labels. |
| `body` | 17px / 19px | 400 | 0 | Subtitles under titles, review text, slider labels. Line pitch measured 19.2pt. |
| `callout` | 16px / 20px | 400 | 0 | Secondary lines under CTAs. |
| `subhead` | 15px / 20px | 400 | 0 | Input text and placeholders. |
| `chip` | 14px / 18px | 500 | 0 | Chips and pills. |
| `label` | 14px / 18px | 400 | 0 | Secondary values in rows and cards (amounts, '/goal' suffixes). Lossy size from v1. |
| `footnote` | 13px / 16px | 500 | 0 | Option-card subtitles, timestamps. |
| `caption` | 12px / 15px | 500 | 0 | Labels under stats on Home cards, tab labels. |

## 6. Spacing, radius, elevation
- Grid 4px. Onboarding gutter 24 (`px-6`); pinned CTA inset 16 (`px-4`); Home gutter 30 (`px-[30px]`). Options/cards 12 apart (`gap-3`). Title → subtitle 20.
- Onboarding vertical rhythm (393×852): header centre 86 · title cap 121 · CTA 744–802 · home indicator 840.
- Radius: pill for all controls/bars/back button; 15 option cards, rows, inputs, review card (`rounded-md`); 12 inner plan cards (`rounded-sm`); 20 Home cards + plan container (`rounded-lg`); 8 wheel selection (`rounded-xs`).
- Elevation: onboarding flat except the CTA fade (`shadow-cta`); Home cards `shadow-card`; FAB/thumb `shadow-float`.
- Sizes: CTA 58 · option 69 / 90 · input 63 · back 40 · FAB 64 · step bar 3 · slider 4 (thumb 27) · switch 51×31.

## 7. Component recipes (Tailwind)
| Component | Classes |
|---|---|
| Button · primary (Continue) | `h-[58px] w-full rounded-pill bg-ink text-on-ink btn-label hover:bg-ink/85 active:scale-[0.97] focus-visible:shadow-focus disabled:bg-disabled` |
| Button · black (Get Started, paywall) | `h-[58px] rounded-pill bg-black text-on-ink btn-label` |
| Button · outline (secondary auth) | `h-[58px] rounded-pill bg-surface border-2 border-black text-black btn-label` |
| Button · secondary / ghost | `h-12 px-6 rounded-pill bg-surface border border-line-strong · h-9 px-3 rounded-pill text-ink-2 hover:bg-fill-subtle` |
| Back button | `size-10 rounded-pill bg-surface-2 text-black grid place-items-center` |
| Step progress | `h-[3px] flex-1 rounded-pill bg-track > h-full rounded-pill bg-black` |
| Option card | `min-h-[69px] (90 with subtitle) w-full rounded-md px-4 bg-surface-2 text-black option · selected: bg-black text-on-ink` |
| Option icon disc | `size-9 rounded-pill bg-surface text-black grid place-items-center` |
| ContinueBar | `bg-[#fafafa] px-4 pt-4 pb-[50px] + 72px fade above (transparent → #f0f0f0)` |
| TextField | `h-[63px] rounded-md bg-surface-2 pl-4 pr-2 subhead placeholder:text-ink-3 focus-within:bg-surface focus-within:border-black · inline action h-9 px-4 rounded-pill bg-black (disabled bg-disabled-2)` |
| Switch | `h-[31px] w-[51px] rounded-pill bg-track (on: bg-black) · knob size-[27px] bg-surface shadow-float` |
| UnitSwitch labels | `text-[22px] leading-7 font-semibold · inactive text-ink-4` |
| WheelPicker | `3D ring: 20 slots × 18°, rows 30px, radius = 30/tan(18°); lens pill bg-fill-subtle rounded-xs; ring text #a2a2a2 17px; mask fade 20%/80%; motion: easeOutCubic, fling decel 30 rows/s², v cap 30, overscroll 0.3, wheel 1 row/100ms (port of @ncdai/react-wheel-picker, MIT)` |
| Slider | `track h-1 rounded-pill bg-slider-track, fill bg-black; thumb 27px bg-surface shadow-float` |
| Chip · lang / muted / soft | `h-7 px-3 rounded-[10px] bg-surface-2 caption · h-7 px-3 rounded-pill bg-track chip · h-11 px-5 rounded-pill bg-surface-2 option` |
| Review card | `rounded-md bg-surface-2 p-5 · quote body text-ink-2 · stars text-accent` |
| Plan container / card | `rounded-lg bg-surface-2 p-5 · inner rounded-sm bg-surface p-3 shadow-card, ring 66/5` |
| Home card | `rounded-lg bg-surface shadow-card · calorie ring 108/12 · macro ring 68/6 on ring-track` |
| TabBar (bar) | `h-[88px] bg-surface px-6 pt-3 · tab w-[76px] caption text-ink-2 · active text-black font-semibold · FAB size-16 bg-ink absolute -top-8 right-[30px]` |
| Setup bar | `h-2.5 rounded-pill bg-track > bg-linear-to-r from-protein to-fat` |

Components shipped in the bundle (`window.Gtrak` / `src/index.jsx`): `Button`, `IconButton`, `Fab`, `ReactionChip`, `TextField`, `Stepper`, `Switch`, `SegmentedControl`, `Chip`, `Avatar`, `ProgressRing`, `ProgressBar`, `PageDots`, `MacroTile`, `Icon`, `TabBar`, `ScreenHeader`, `WeekStrip`, `CameraControls`, `ActionBar`, `CalorieCard`, `MacroCard`, `CalorieTile`, `WeightCard`, `StreakCard`, `WeightChartCard`, `FoodLogCard`, `IngredientRow`, `SettingRow`, `FeedPost`, `OnboardingLayout`, `StepHeader`, `OptionGroup`, `OptionCard`, `UnitSwitch`, `WheelPicker`, `RulerPicker`, `SpeedSlider`, `YesNo`, `ContinueBar`, `RatingCard`, `ReviewCard`, `SetupProgress`, `PlanSummary`, `PlanMacroCard`, `Stars`, `NoticeCard`.

## 8. Interaction states
- Hover: darken fill ~10% or tint to `fill-subtle`. Press: `active:scale-[0.97]`, 150ms ease-out.
- Selected: white pill on a tinted track (segments, tabs, week days).
- Focus: `focus-visible:shadow-focus` (2px white gap + 2px ink ring). Never remove it.
- Motion: rings/bars 600ms `cubic-bezier(.2,.8,.2,1)`; switches 200ms; no bounce.

## 9. Content
- Friendly coach voice, second person. Titles are questions or promises; subtitles give the reason in one line.
- Title Case for short titles and buttons; sentence case for long titles and body. No emoji.
- `77.0 kg`, `1.0 kg`, `2583`, `184g`, `Gain 6 kg by October 13`. Highlight the key number in a statement with `accent`.
- Macro order on Home: Protein → Carbs → Fats. Plan grid: Calories, Carbs, Protein, Fats.

## 10. Accessibility flags (kept from source — do not use as the only signal)
`ink-3` 2.83:1 · `ink-4` 1.56:1 · `carbs`/`accent` 2.35:1 · `fat` 3.02:1 · `protein` 3.4:1 · `streak` 2.24:1 · `ink-2` on `surface-2` 4.33:1 · white on `avatar` 2.46:1.
Always print the label next to a colour; keep `black`/`ink` for anything a user must read.

## 11. Open items
- Logo: not supplied yet — use the wordmark "Gtrak" in `large-title`.
- Icons, animal speed illustrations, laurels and third-party logos: the Figma export is raster-only, so these are substitutes / omitted. Replace with licensed originals (keep icon names).
- Font: Hanken Grotesk matches the source's metrics within 1.5% but the source font is not confirmed.
- Dark theme: not present in the source.
- Lossy (v1) values still in use: success/day/avatar/camera/glass colours, `title-1`, `radius-xl`, `control-md`.
