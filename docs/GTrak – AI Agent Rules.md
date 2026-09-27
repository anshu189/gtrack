# GTrak – Copilot Implementation Rules

**Version:** 1.2.0

This document defines how coding agents should contribute to the project.

Agents are implementation assistants, **not** the software architect.

Architecture decisions come from the project documentation.

---

# 1. Before Every Task

Before implementing any feature:

1. Read `PRD.md`
2. Read `ARCHITECTURE.md`
3. Read the Development Roadmap.
4. Follow existing patterns.
5. Implement only the requested feature.

Never redesign existing architecture.

---

# 2. Primary Responsibilities

Agents should:

- Write clean code.
- Follow existing architecture.
- Respect TypeScript types.
- Keep components reusable.
- Prefer composition.
- Keep implementations simple.

---

# 3. Never Do These

Never:

- Invent new architecture.
- Create unnecessary folders.
- Duplicate business logic.
- Use `any`.
- Ignore existing types.
- Add dependencies without approval.
- Mix UI with business logic.
- Write inline styles.
- Create monolithic components.
- Introduce breaking changes without explanation.

---

# 4. Component Rules

Components should:

- Have one responsibility.
- Remain reusable.
- Stay under ~300 lines where practical.
- Receive data via props or stores.
- Avoid heavy business logic.

Business logic belongs in:

- lib/
- hooks/
- repositories/

---

# 5. TypeScript Rules

Always:

- Use interfaces/types.
- Use strict typing.
- Export shared types.
- Avoid duplicate models.

Never:

```ts
any
```

unless explicitly approved.

Every `update()`/`create()` payload must be wrapped with `cleanForFirestore()` (see section 7) so `undefined` fields are never written to Firestore.

---

# 6. Zustand Rules

Global state only.

Use Zustand for:

- Meals
- History
- Foods
- Settings
- Tracking (tretinoin, respect, water, weight, workout, notes)

Do NOT use Zustand for:

- Dialog visibility
- Input focus
- Temporary form state
- Unsaved edit-mode buffers (use React state)

Use React state instead.

---

# 7. Database Rules

GTrak uses **Firebase Firestore** as its cloud database with **anonymous authentication**.

Never access Firestore directly from components.

Always use:

```
Repository

↓

Store

↓

Component
```

## Rules

- All Firestore writes must use `setDoc`/`updateDoc`/`addDoc` through a repository.
- Every write payload must be cleaned with `cleanForFirestore()` (from `src/lib/utils/firestore.ts`) to strip `undefined` values before persisting.
- Use `nullish coalescing` (`??`) instead of falsy checks (`||`) when reading optional numeric fields so legitimate zero values (e.g. `fiber: 0`) are not dropped.
- Repositories are the only code that imports `firebase/firestore`.

---

# 8. File Organization

Every new file must belong in an existing module.

```
src/
  components/     UI (feature + ui + tracking + meal + nutrition + dashboard)
  data/           Static seed data (foods, categories, presets)
  hooks/          Custom React hooks
  lib/
    repositories/ Firestore repositories (one per domain)
    services/     Business logic (nutrition, meal auto-completion)
    search/       Food search engine
    utils/        Helpers (cn, date, format, firestore, nutrition, tretinoin)
    firebase.ts   Firebase init + anonymous auth
    seed.ts       Seeds built-in data if collections are empty
  pages/          Top-level screens
  stores/         Zustand stores
  types/          Shared TypeScript models
```

Do not create random folders.

Keep related files together.

---

# 9. Naming

Components

```
MealCard.tsx
```

Hooks

```
useNutrition.ts
```

Repositories

```
foodRepository.ts
```

Stores

```
mealStore.ts
```

Functions

```
calculateMealNutrition()
```

Names should clearly describe purpose.

---

# 10. UI Rules

Follow the GTrak gothic design language (the live app is truth — see `src/index.css` and `MEMORY.md §4`).

GTrak uses **Astryx v0.4.3** (`@astryxdesign/core`, `@astryxdesign/theme-gothic`) plus Tailwind CSS v4:

- Discover before building: `npx astryx build "<idea>"`, `npx astryx template <name>`, `npx astryx component <Name>` for props (full workflow in `AGENTS.md`).
- Prefer Astryx components (ProgressBar, DateInput, Table, NumberInput, …) with real `label` props over hand-rolled elements.
- Tokens for every value (`--color-bg/surface/border/text/muted/accent/success/warning/error`); never override `--color-*` in `:root`.

Rounded, flat design:

- Rounded corners everywhere: cards `rounded-xl`, inputs/buttons/items `rounded-lg`.
- No shadows.
- Solid, flat colors only.
- Sentence-case labels ("Water intake", "Respect/Trust score", "Do what you said").

Palette (dark theme, the used theme):

- Background `#101314`, surface `#1a1d20`, borders `#24292D`, text `#E8F1F6`, muted `#96A0AB`.
- Accent `#a3b5d6` (periwinkle), success `#b3c79a` (sage), warning `#d3c490` (aged gold), error `#c6a6a2` (dusty rose).

Functional colors:

- Sage green: success / positive values
- Dusty rose: errors, negative values, and delete actions
- Aged gold: warnings

Avoid gradients, glassmorphism, neumorphism, decorative animations, and excessive borders.

## Known UI gotcha

Never put `pointer-events-none` on a wrapper around an Astryx `DateInput`: its calendar popover renders inline as a DOM child and inherits `pointer-events`, so the whole calendar becomes visible-but-unclickable (dead month/year arrows, no selectable dates). The working pattern (MealBuilder date pill) is an `absolute inset-0 opacity-0` overlay with no `pointer-events-none`, and the custom button above it (`relative z-10`) receiving the clicks.

---

# 11. Performance

Avoid:

- unnecessary renders
- duplicate calculations
- duplicate state
- unnecessary dependencies

Optimize only when necessary.

---

# 12. Pull Request Checklist

Every completed feature should satisfy:

✓ TypeScript passes (`npm run build` / `tsc -b` — strict: `noUnusedLocals`/`noUnusedParameters`, so unused imports/props fail Vercel deploys)

✓ Lint passes (`npm run lint`)

✓ Mobile responsive

✓ Architecture followed

✓ No duplicated code

✓ Reusable

✓ Accessible

✓ No console errors

---

# 13. Prompt Behaviour

When implementing a task:

Do exactly what was requested.

If information is missing:

- make the smallest reasonable assumption
- document the assumption

Do not redesign unrelated parts of the application.

---

# 14. Definition of Success

A successful implementation:

- follows PRD
- follows Architecture
- keeps code clean
- is easy to maintain
- is production ready

When in doubt,

prefer the simpler solution.

---

**End of Document**
