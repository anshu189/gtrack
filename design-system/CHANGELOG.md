# Gtrak design system — changelog

## v2.1 — 2026-09-27 · WheelPicker motion
- `WheelPicker` rebuilt on the motion model of @ncdai/react-wheel-picker v1.2.3 (MIT; see THIRD_PARTY_NOTICES.md). It is now a 3D cylinder (20 slots × 18°, 30px rows) with a centre "lens" pill, drag with momentum (velocity cap 30 rows/s, deceleration 30 rows/s², ease-out-cubic landing), 30% overscroll with spring-back, mouse wheel at one row per 100 ms, click-to-row, ↑/↓/Home/End, type-ahead and optional infinite looping.
- New `WheelPickerGroup` holds the shared 3D stage and moves focus between columns with ←/→.
- Checked by driving the reference and Gtrak with the same drag, fling, hold-and-release, wheel, click and overscroll inputs. Position traces agree within 0.25 rows at every sample point and land on the same value.

## v2 — 2026-09-24 · re-measured from the Figma export

Source: `Onboarding on Cal AI (iOS).svg` — 34 lossless screenshots at 3x (1179×2556 px = 393×852 pt). Every value below was measured on those pixels; v1 values came from compressed marketing images.

### Font
| | v1 | v2 |
|---|---|---|
| Family | Inter (guess for SF Pro) | **Hanken Grotesk**. It matches the source's letterforms, and text widths are within 1.5% at the measured sizes. It is the closest open font; the source's actual font is not confirmed. The woff2 files (400/500/600/700, OFL) are bundled. |
| Title / number weight | 700 | **600**. The stroke widths match 600 exactly. |

### Type scale (px)
| Style | v1 | v2 |
|---|---|---|
| large-title | 32/38 · 700 | **34/38 · 600** (cap height 23.7pt) |
| stat-xl | 40/44 · 700 | **44/48 · 600** ("2583", "18%") |
| stat-lg | 32/36 · 700 | **34/38 · 600** ("77.0 kg") |
| title-2 | 18/24 | **20/26** |
| body / button / option label | 16 | **17** (body line height 19) |
| new | — | `option` 17/500, `callout` 16, `subhead` 15 (inputs), `chip` 14, `label` 14 |
| caption | 12 | 12 (now also used for tab labels) |

### Colour
| Token | v1 | v2 |
|---|---|---|
| **black** (new) | — | `#000000`: all text and the selected option card |
| ink | #1c1a22 | #1c1a22 (confirmed; buttons and FAB) |
| ink-2 | #707070 | **#767578** |
| ink-3 | #949494 | **#9a999e** (placeholders) |
| ink-4 (new) | — | #cfcfcf (inactive "Metric" label) |
| surface-2 | #f8f8fc | **#f9f8fd** (option cards, inputs, back button, review card) |
| canvas | #f8f8f8 | **#ffffff**, with a cool/warm top glow on Home (#e3e8e9 / #f0eae7) |
| track | #e8e8ec | **#e8e8e8** |
| ring-track (new) | — | #eff1f7 |
| slider-track, disabled, disabled-2, tint-over, accent (new) | — | #e0e0e0, #bababc, #c0bfc6, #fbf0ef, alias of carbs |
| protein | #dc6a6a | **#dd6668** |
| carbs | #da9c66 | **#df9a65** |
| fat | #6897da | **#6596dd** |
| streak | #e89838 | **#f69716** |

### Spacing, radius, sizes
| | v1 | v2 |
|---|---|---|
| Screen gutter | 20 | **24** onboarding · **16** pinned CTA · **30** Home |
| radius-md | 16 | **15** (option cards, inputs; measured 14.4–15.6) |
| Primary CTA height | 56 | **58** |
| Back button | 44 | **40** |
| FAB | 60 | **64** |
| New | — | option row 69 / 90, input 63, step bar 3, slider 4 with a 27 thumb |

### Components
- **Updated:** Button (new `black` and `outline` variants; disabled grey; 58 default), IconButton (40, lavender), Fab (64), Switch (black when on), TextField (63px lavender, inline Submit), Chip (`lang`, `muted`, `soft`), ProgressRing (`ring-track`), TabBar (`bar` variant, 3 tabs), WeekStrip (`letters` variant), CalorieCard (calories left), MacroCard (grams left), ActionBar.
- **New (17):** OnboardingLayout, StepHeader, OptionGroup, OptionCard, UnitSwitch, WheelPicker, RulerPicker, SpeedSlider, YesNo, ContinueBar, RatingCard, ReviewCard, SetupProgress, PlanSummary, PlanMacroCard, Stars, NoticeCard.
- **Icons:** 13 more hand-drawn substitutes (settings, pencil, bell, star, check-circle, speed marks, …). The export contains raster images only, so none of the source's icons, illustrations or brand logos could be extracted.

### Still from v1 (lossy)
The success, day-ring, avatar, camera and glass colours; `title-1`; `radius-xl`; `control-md`. These screens aren't in the Figma set.
