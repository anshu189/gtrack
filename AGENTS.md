# AGENTS.md

Project-specific guidance for AI coding agents.

## Design system

GTrak's UI is built on **Gtrak DS** — a light, monochrome design system derived
from Cal AI. The system itself lives at `D:\Growth\App UI\Gtrak Design System\`
(README.md, DESIGN.md, tokens/tokens.json, components/docs/*.md, reference
screenshots). Read `DESIGN.md` before writing UI; it is the source of truth for
tokens, type scale, spacing, radii and component recipes.

A full audit of the app against the system lives in `design-audit/`.

**Astryx has been removed.** Ignore any older instruction mentioning
`npx astryx`, `@astryxdesign/*`, StyleX or the gothic theme — none of it is in
the project any more.

### Where things are

- `src/index.css` — the DS token set, the Hanken Grotesk `@font-face` rules, the
  Tailwind v4 `@theme inline` block, and the DS type utilities.
- `src/components/ds/` — the DS components. Import from `@/components/ds`.
- `public/fonts/` — Hanken Grotesk 400/500/600/700, self-hosted.

### Rules

1. **Light only.** Gtrak DS declares a single theme and has no dark variant.
   Never add `dark:` utilities — without a custom dark variant they fire off the
   OS preference and break the page.
2. **Tokens for every value.** No hex literals, no raw Tailwind palette classes
   (`slate-*`, `red-*`, …). Use `bg-surface-2`, `text-ink-2`, `text-protein`,
   `rounded-md`, `shadow-card` and friends.
3. **Monochrome chrome, coloured data.** Text and selections are `black`;
   buttons and the FAB are `ink`; quiet surfaces are `surface-2`. Colour appears
   only where it encodes something — `protein`, `carbs`, `fat`, `streak`,
   `accent`. Never let colour be the only signal: always print the label too.
4. **Type comes from the utilities**, not ad-hoc sizes: `stat-xl`, `large-title`,
   `title-1`, `title-2`, `stat-md`, `headline`, `btn-label`, `option`,
   `body-text`, `callout`, `subhead`, `chip-text`, `label-text`, `footnote`,
   `caption`. (`body`, `chip` and `label` are renamed to avoid collisions.)
   Weight 600 for titles and numbers, 500 for labels, 400 for running text.
5. **Radius by role**, not one global value: `rounded-pill` for controls,
   `rounded-md` (15) for rows and inputs, `rounded-lg` (20) for cards,
   `rounded-sm` (12) for inner cards.
6. **Numbers:** integers for calories (`2583`), one decimal for weight
   (`77.0 kg`), grams attached (`184g`). Macro order Protein → Carbs → Fats.
7. **Layout:** the app is a centred column capped at 480px — every DS value is
   measured at 393×852pt, so the phone layout holds at every width. Home gutter
   30px, cards 12px apart, sections 32px.
8. **Any flex child that is an input or select needs `min-w-0`**, or it refuses
   to shrink and overflows its container. This has bitten three times.
9. **Base resets belong in `@layer base`.** An unlayered `font: inherit` on
   controls beats every type utility and silently resizes all button and input
   text.

### Adding a component

If Gtrak DS has one, use it. If it does not, build it from DS atoms, follow the
DS rules, and write a comment saying it is an **intentional addition to Gtrak
DS** and why. Existing additions: `AppShell`, `TabBar` (5-tab), `TextArea`,
`TextLink`, `DatePicker`, `ChartCard`.

### Before finishing

Run `npm run build` (`tsc -b && vite build`, strict — unused code fails the
build). Then check the page in a browser: no element wider than its container,
no text the same colour as its background, no horizontal scroll.
