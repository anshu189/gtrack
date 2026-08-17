# GTrak – Copilot Implementation Rules

**Version:** 1.1.0

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

Follow the GTrak design language.

Fully **square** design:

- No rounded corners (except the brand "G" mark).
- No shadows.
- No opacity.
- Solid, flat colors only.

Palette:

- Light: white background, `#e2e8f0` borders, black text.
- Dark: `#111111` background, `#1F1F1F` surface, `#2D2D2D` borders, `#FDFDFD` text.

Functional colors:

- Green: success / positive values
- Red: errors, negative values, and delete actions
- Orange: warnings

There is **no blue** in the application. Do not introduce blue.

Avoid gradients, glassmorphism, neumorphism, decorative animations, and excessive borders.

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

✓ TypeScript passes (`npm run build` / `tsc -b`)

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
