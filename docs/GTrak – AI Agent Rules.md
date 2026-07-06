# GTrak – Copilot Implementation Rules

**Version:** 1.0.0

This document defines how GitHub Copilot should contribute to the project.

Copilot is an implementation assistant, **not** the software architect.

Architecture decisions come from the project documentation.

---

# 1. Before Every Task

Before implementing any feature:

1. Read `PRD.md`
2. Read `ARCHITECTURE.md`
3. Follow existing patterns.
4. Implement only the requested feature.

Never redesign existing architecture.

---

# 2. Primary Responsibilities

Copilot should:

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

---

# 6. Zustand Rules

Global state only.

Use Zustand for:

- Meals
- History
- Foods
- Settings

Do NOT use Zustand for:

- Dialog visibility
- Input focus
- Temporary form state

Use React state instead.

---

# 7. Database Rules

Never access Dexie directly from components.

Always use:

```
Repository

↓

Store

↓

Component
```

---

# 8. File Organization

Every new file must belong in an existing module.

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

Use:

- White
- Black
- Blue

Minimal borders.

Minimal shadows.

No gradients.

No glassmorphism.

No decorative animations.

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

✓ TypeScript passes

✓ Build passes

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