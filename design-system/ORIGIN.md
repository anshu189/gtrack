# Gtrak DS — vendored copy

This folder is the **only** design system GTrak uses. Every font, colour, size,
radius, shadow, component recipe and content rule comes from here. Nothing
else — no other DS, UI kit, icon library or palette.

- **Published:** https://claude.ai/artifact/D4Whn6HYLyjsG3gwuJGfVw (Gtrak DS v2.1, last change 2026-09-27)
- **Working copy:** `D:\Growth\App UI\Gtrak Design System\`
- **Copied here:** 2026-10-28. Checked byte-for-byte against the published
  artifact: `tokens.json`, `bundle.css`, `bundle.js`, `index.d.ts`, `README.md`
  and all four fonts are identical.

Do not edit these files to suit the app. If the system changes, update it at
the source and copy it in again.

## What is where

| Need | File |
|---|---|
| The rules — principles, colour roles, type scale, spacing, radii, elevation, recipes, states, content | `DESIGN.md` |
| The brand voice and look in prose | `README.md` |
| Every token value, machine-readable | `tokens/tokens.json` |
| Tokens as CSS custom properties | `tokens/tokens.css` |
| Tailwind v4 `@theme` block + type utilities | `tokens/tailwind-theme.css` |
| One spec per component (props, sizes, states) | `components/docs/<Name>.md` |
| Component prop types | `components/dist/index.d.ts` |
| Reference implementation (port from this, don't import it) | `components/src/index.jsx`, `icons.jsx`, `wheel.jsx` |
| Compiled reference CSS / JS | `components/dist/bundle.css`, `bundle.js` |
| Visual board of every token and component (open in a browser) | `gtrak-board.html` |
| Source screens the values were measured from | `reference/screenshots/` |
| What changed between versions | `CHANGELOG.md` |

**Fonts** are not duplicated here: the same four Hanken Grotesk woff2 files
(400/500/600/700) live in `public/fonts/` and are identical to the DS copies.
`build-scripts/` from the source folder is not copied (it only builds the
board).

## How the app maps onto it

- Tokens, `@font-face` rules, the `@theme inline` block and the type utilities
  are in `src/index.css`. Colour, spacing, radius and shadow values match
  `tokens.css` exactly.
- Three type utilities are renamed in the app to avoid clashing with Tailwind:
  `body` → `body-text`, `chip` → `chip-text`, `label` → `label-text`.
- Ported components live in `src/components/ds/`. Intentional additions
  (`AppShell`, `TabBar` 5-tab pill, `TextArea`, `TextLink`, `SelectField`,
  `DatePicker`, `ChartCard`, `ScrollToTop`, `Checkbox`, app icon glyphs) are
  listed in `AGENTS.md`.

## Known places the app does not match yet (2026-10-28)

1. **Type scale is 2px small at the top.** `src/index.css` has `stat-xl`
   42/46, `large-title` 32/36, `stat-lg` 32/36, `title-1` 22/28, `stat-md`
   18/22, `title-2` 18/24. DS: 44/48, 34/38, 34/38, 24/30, 20/24, 20/26. No
   recorded reason; it has been this way since the DS migration (`b4d423e`).
2. **Logo.** DS: wordmark "Gtrak" in `large-title`, no placeholder mark. The
   app header (`src/App.tsx`) draws a black tile with three dots.
3. **Casing.** DS: Title Case for short titles and buttons. The app uses
   sentence case ("Daily summary", "Water intake").
