# GTrak – Architecture Document

**Version:** 1.1.0  
**Status:** Active  
**Framework:** React + Vite + TypeScript  
**Backend:** Firebase Firestore (cloud) + Anonymous Auth

---

# 1. Architecture Overview

## Purpose

This document defines **how GTrak is built**.

Unlike the PRD, which defines *what* the application should do, this document defines:

- Project structure
- Data flow
- State management
- Coding standards
- Component architecture
- Performance guidelines

Every implementation should follow this document.

---

# Architecture Principles

The project follows these principles:

- Mobile-first
- Cloud-backed (Firestore) with a local-first UI
- Component-driven
- Feature-based architecture
- Strong typing
- Reusable code
- High performance
- Easy maintenance

When multiple solutions exist, prefer:

**Simple > Clever**

---

# High-Level Architecture

```
User

↓

React Components

↓

Zustand Store

↓

Repository Layer

↓

Firebase Firestore
```

Each layer has a single responsibility.

---

# Layer Responsibilities

## UI Layer

Responsible for:

- Rendering
- User interaction
- Forms
- Navigation

Never performs business calculations.

---

## Store Layer

Responsible for:

- Global state
- App state
- UI state

Never contains database logic.

---

## Repository Layer

Responsible for:

- Reading data
- Writing data
- Database abstraction

Components never access Firestore directly.

---

## Database Layer

Responsible for:

- Cloud persistence (Firestore)
- Seeding built-in data
- Queries

Only repositories communicate with the database.

---

# Data Flow

Every feature follows the same flow.

```
User Action

↓

Component

↓

Store

↓

Repository

↓

Firestore

↓

Store Update

↓

UI Re-render
```

Data always flows in one direction.

---

# Project Goals

The architecture should support:

- 1000+ foods
- Years of history
- Unlimited meal entries
- Custom foods
- Future features

without requiring major refactoring.

---

# Project Philosophy

Build small reusable modules.

Avoid large components.

Avoid duplicated logic.

Keep business logic independent from UI.

If a module becomes difficult to understand,
it should probably be split into smaller modules.

---

# 2. Tech Stack & Project Structure

## Tech Stack

| Purpose | Technology |
|----------|------------|
| Framework | React + Vite |
| Language | TypeScript |
| Styling | Tailwind CSS |
| State Management | Zustand |
| Database | Firebase Firestore |
| Authentication | Firebase Anonymous Auth |
| Charts | Recharts |
| Search | Fuse.js |
| Forms | React Hook Form |
| Validation | Zod |
| Icons | Lucide React |
| Deployment | Vercel |

---

## Folder Structure

```
src/

components/
data/
hooks/
lib/
pages/
stores/
types/
```

Each folder has one responsibility.

---

## Folder Responsibilities

### components/

Reusable React components.

Structure:

```
components/

ui/          Generic UI primitives (Button, Card, etc.)
meal/        Meal builder components
nutrition/   Nutrition display components
tracking/    Workout, water, weight, notes, tretinoin, respect
dashboard/   Dashboard summary + progress cards
```

Feature components should remain inside their respective folders.

---

### data/

Static seed data (the single source of truth for the built-in dataset).

Examples:

- `builtInFoods.ts`
- `foodsSeed.ts`
- `categories.ts`
- `quantityPresets.ts`
- `nutritionSources.ts`
- `macroOverrides.ts`

No business logic.

---

### hooks/

Reusable custom hooks.

Examples:

- `useDebounce`
- `useFoodSearch`
- `useMealAutoComplete`
- `useNutrition`

Hooks should never render UI.

---

### lib/

Shared business logic.

```
lib/

firebase.ts        Firebase init + anonymous auth
seed.ts            Seeds built-in data when collections are empty
repositories/      One repository per domain
services/          nutritionCalculation, mealAutoCompletion
search/            foodSearch
utils/             cn, date, format, firestore, nutrition, tretinoin
```

This folder contains the application's core logic.

---

### pages/

Top-level screens.

Examples:

- Dashboard
- MealBuilder
- History
- Analytics
- Settings

Pages compose components.

Pages should contain very little business logic.

---

### stores/

Global Zustand stores, one per domain.

Examples:

- mealStore
- foodStore
- historyStore
- settingsStore
- waterStore, weightStore, workoutStore
- tretinoinStore, respectStore
- dailyNoteStore, favoriteStore
- categoryStore, quantityPresetStore, nutritionSourceStore

Each store should manage only one domain.

---

### types/

Shared TypeScript models.

Examples:

- food.ts
- meal.ts
- history.ts
- nutrition.ts
- settings.ts
- tretinoin.ts
- respect.ts
- water.ts, weight.ts, workout.ts, dailyNote.ts

Every shared model belongs here.

---

## Naming Conventions

Components

```
MealCard.tsx
```

Hooks

```
useNutrition.ts
```

Stores

```
mealStore.ts
```

Repositories

```
foodRepository.ts
```

Types

```
food.ts
```

Utilities

```
nutrition.ts
```

Use descriptive names.

Avoid abbreviations.

---

## Import Rules

Prefer alias imports.

Good

```ts
import MealCard from "@/components/meal/MealCard";
```

Avoid

```ts
../../../components/meal/MealCard
```

Relative imports are acceptable only within the same folder.

---

## Module Boundaries

Each module owns its own logic.

Example

Meal module

- Components
- Hooks
- Utilities
- Types (if not shared)

Other modules should communicate through shared stores or repositories.

Never import deeply into another feature's internals.

---

## Dependency Direction

Dependencies should always flow downward.

```
Pages

↓

Components

↓

Store

↓

Repository

↓

Firestore
```

Lower layers must never import higher layers.

Example:

Firestore ❌ imports Store

Store ❌ imports Components

Component ❌ imports Firestore

---

## Code Organization Rules

Each file should have one clear responsibility.

If a component grows beyond ~250–300 lines, consider splitting it.

Keep files focused and easy to understand.

---

# 3. State Management

GTrak uses **Zustand** for global state management.

## Principles

- One store per domain.
- Keep stores focused.
- Business logic belongs in services/repositories when possible.
- UI state stays local unless shared across pages.

---

## Stores

### mealStore

Responsible for:

- Meals for the selected date
- Meal items
- Saving/updating/deleting meals

---

### foodStore

Responsible for:

- Food database
- Search state
- Favorites
- Recent foods

---

### historyStore

Responsible for:

- Daily logs
- Weight history
- Water history
- Workout history

---

### settingsStore

Responsible for:

- User preferences
- Nutrition targets
- Water goal
- Theme

---

### trackingStores

Separate stores for:

- tretinoinStore
- respectStore
- waterStore
- weightStore
- workoutStore
- dailyNoteStore

---

## Store Rules

Stores should:

- expose state
- expose actions
- never contain UI components

Good

```ts
addMealItem()
removeMealItem()
updateQuantity()
```

Bad

```ts
renderMealCard()
```

---

## Local State

Use React state for:

- Dialog visibility
- Expanded accordions
- Input focus
- Temporary form values
- Unsaved edit-mode buffers (e.g. `respectPatch` in History)

Do not move temporary UI state into Zustand.

---

## State Flow

```
User Action

↓

Component

↓

Store Action

↓

Repository

↓

Firestore

↓

Store Update

↓

UI Update
```

Stores should never communicate directly with each other.

Communication should happen through shared services or repositories.

---

# 4. Database Design

GTrak persists all data to **Firebase Firestore** using **anonymous authentication**.

On startup, `App.tsx` runs `ensureSignedIn()` (anonymous sign-in) then `seedIfEmpty()`.

---

## Firestore Collections

```
foods              Built-in + seeded foods (read-only at runtime)
categories         Food categories
quantityPresets    Quantity presets
nutritionSources   Nutrition data sources (IFCT 2017, USDA, FSSAI, Brand)

meals              Daily meal records (one doc per meal per date)
workouts           One workout per day
waterLogs          Water intake entries
weights            One weight entry per day
dailyNotes         One note per day

tretinoinLogs      Tretinoin application logs
respectLogs        Respect/Trust score logs (upserted per date)

deletedMeals       Soft-deleted meals for the 24h undo window
favorites          User favorite foods
settings           Single app settings document
```

---

## foods

Contains built-in foods.

Fields:

- id
- name
- category
- unit
- nutrition (per 100g / 100ml)
- measures (discrete measures with `gramsPerUnit` for conversion)
- aliases
- source

This collection is seeded from `src/data` and is read-only at runtime.

---

## meals

Daily meal records.

Fields:

- id
- date
- name
- items[] (foodId, name snapshot, gramsPerUnit, quantity, unit, nutrition)
- createdAt / updatedAt

Meal items snapshot the food name and `gramsPerUnit` so history stays stable even if the food database changes.

---

## tretinoinLogs

- id
- date
- applied (boolean)
- createdAt / updatedAt

The tracker surfaces on scheduled nights (every 3rd night from the last `applied = true` date).

---

## respectLogs

- id
- date
- didWhatSaid (number)
- excuse (number)
- flake (number)
- total (derived sum)
- createdAt / updatedAt

One log per date (upsert).

---

## settings

Contains application preferences.

Only one settings record should exist.

---

## Database Rules

- Use IDs instead of names for relationships.
- Never duplicate food nutrition in the database.
- Nutrition should be calculated, not stored redundantly.
- Validate data before saving.
- Strip `undefined` fields before any write via `cleanForFirestore()`.
- Use `??` (nullish) when reading optional numerics so zero values survive.

---

## Seeding

`seedIfEmpty()` seeds each collection only when it is empty:

- Categories
- Foods (builtInFoods + foodsSeed, with macroOverrides applied)
- Quantity presets
- Nutrition sources

---

## Backup Strategy

Settings provides:

- Export: downloads all user data as JSON.
- Import: reads a previously exported JSON file (existing data is preserved).
- Reset: clears all user data; requires the confirmation password `godelete`. Built-in foods remain.

---

## Data Ownership

All user data is owned by the user.

The application:

- requires no explicit login (anonymous auth only)
- provides export/import/reset
- does not collect analytics or telemetry

---

# 5. Repository Layer

The Repository Layer separates business logic from data storage.

Components and stores should never communicate directly with Firestore.

Instead, all database operations go through repositories.

---

## Responsibilities

Repositories are responsible for:

- Reading data
- Writing data
- Updating records
- Deleting records
- Validation
- Mapping database models

Repositories should not contain UI logic.

---

## Repositories

One repository per domain in `src/lib/repositories/`:

```
foodRepository.ts
mealRepository.ts
categoryRepository.ts
quantityPresetRepository.ts
nutritionSourceRepository.ts

historyRepository.ts
settingsRepository.ts
favoriteRepository.ts

waterRepository.ts
weightRepository.ts
workoutRepository.ts
dailyNoteRepository.ts

tretinoinRepository.ts
respectRepository.ts
```

---

## Repository Flow

```
Component

↓

Store

↓

Repository

↓

Firestore

↓

Repository

↓

Store

↓

UI
```

Repositories act as the single gateway to persistent data.

---

## Benefits

- Easy testing
- Cleaner stores
- Replaceable database layer
- Reduced duplicated logic

---

## Rules

Repositories:

✓ Read data

✓ Write data

✓ Validate data

✓ Transform data

Repositories must NOT:

✗ Render UI

✗ Manage component state

✗ Perform navigation

---

# 6. Component Architecture

Components should be small, reusable and predictable.

Prefer composition over large monolithic components.

---

## Component Categories

```
UI Components

↓

Layout Components

↓

Feature Components

↓

Page Components
```

---

## UI Components

Generic reusable components in `components/ui/`.

Examples

```
Button
Card
Section
Typography
AppShell
BottomNavigation
PageContainer
```

These should never know anything about GTrak.

---

## Feature Components

Specific to GTrak.

Examples

```
MealCard, MealItem, AddItem, FoodPicker, QuantityPicker, FoodMacroEditor, UndoBanner
NutritionSummary, MealNutritionCard
WorkoutCard, WorkoutLogging, WorkoutHistory
WaterLogging, WaterProgress
WeightLogging, WeightHistory
DailyNoteEditor
TretinoinTracker
RespectTracker
```

Feature components may use stores and hooks.

---

## Page Components

Pages assemble feature components.

Examples

```
Dashboard
MealBuilder
History
Analytics
Settings
```

Pages should contain very little logic.

---

## Component Communication

Preferred flow

```
Parent

↓

Props

↓

Child
```

Avoid deeply nested prop chains.

Use Zustand only when state is shared across multiple features.

---

## Component Rules

Each component should:

- Have one responsibility
- Be strongly typed
- Be reusable
- Avoid duplicated logic

---

## Component Size

Recommended limits

Simple UI

less than 150 lines

Feature Components

less than 300 lines

If larger,

consider splitting into multiple components.

---

## Business Logic

Business logic should never live directly inside JSX.

Good

```tsx
const nutrition = calculateMealNutrition(meal);
```

Bad

```tsx
{meal.items.reduce(...)}
```

Keep JSX focused on rendering.

---

## Rendering Rules

Render only what changes.

Avoid unnecessary re-renders.

Memoize expensive calculations where appropriate.

Do not optimize prematurely, but avoid obvious inefficiencies.

---

## Error Handling

Feature components should gracefully handle:

- Missing data
- Empty states
- Invalid IDs
- Loading failures

Never crash the page due to missing data.

---

# 7. Nutrition Engine

The Nutrition Engine is the core business logic of GTrak.

Its responsibility is to calculate nutrition from food selections.

It never stores calculated values permanently.

All nutrition values are derived on demand.

---

## Calculation Flow

```
Food

↓

Quantity + Unit

↓

Grams (via gramsPerUnit / measures)

↓

Nutrition Per 100g

↓

Meal Nutrition

↓

Daily Nutrition

↓

Dashboard
```

---

## Unit Conversion

- All nutrition is stored **per 100g / 100ml**.
- Non-weight units (piece, cup, tbsp, tsp, slice) are converted through the food's `measures` array.
- `computeGramsPerUnit(food, unit)` returns the conversion factor for a unit.
- `mealItemGrams(item)` returns the total grams for a meal item.
- Each meal item stores its resolved `gramsPerUnit` so history is stable.

Fallback defaults when a measure is unknown:

- piece = 50g
- cup = 240g
- tbsp = 15g
- tsp = 5g
- slice = 30g

---

## Calculation Rules

Every food contains nutrition values per 100g or 100ml.

When a quantity changes:

1. Recalculate the meal.
2. Update daily totals.
3. Update progress indicators.
4. Refresh the UI.

All updates should happen automatically.

---

## Calculation Priority

```
Food

↓

Meal

↓

Day

↓

History

↓

Analytics
```

Analytics should always use historical records, not raw meal items.

---

## Daily Nutrition

Daily nutrition contains:

- Calories
- Protein
- Carbohydrates
- Fat
- Fiber

Future nutrients can be added without changing the calculation flow.

---

## Targets

Targets are user configurable in Settings.

Examples

Calories

3300 kcal

Protein

120 g

Carbs

420 g

Fat

95 g

Fiber

35 g

---

## Status Logic

Every nutrient has one status.

```
Below Target → Incomplete
Equal Target → Complete
Above Target → Over Target
```

Status should update instantly.

---

## Calculation Principles

- No duplicated calculations.
- Use shared utility functions.
- Round values only for display (`formatNum` — max 2 decimals, trailing zeros stripped).
- Keep internal precision.

---

# 8. Food Database & Search

The Food Database is the single source of truth for every food in GTrak.

All food selections originate from this database.

---

## Food Structure

Each food should contain:

- ID
- Name
- Category
- Unit
- Nutrition Per 100
- Measures (with gramsPerUnit for non-weight units)
- Aliases
- Source

---

## Categories

Seeded categories include:

- Fruits
- Vegetables
- Leafy Vegetables
- Grains
- Rice
- Pulses
- Beans
- Dairy
- Eggs
- Chicken
- Fish
- Nuts
- Seeds
- Oils
- Beverages
- Others

Categories are sorted alphabetically.

Foods within each category are also sorted alphabetically.

---

## Search

Food search is:

- Instant
- Fuzzy (Fuse.js)
- Case insensitive

Supported searches:

```
milk → Milk
mlk → Milk
chk → Chicken
```

---

## Food Sources

Nutrition data source priority:

1. IFCT 2017 (ICMR–NIN)
2. Brand labels
3. USDA (only if Indian data is unavailable)
4. FSSAI

Every food stores its data source.

---

## Macro Overrides

`src/data/macroOverrides.ts` lets specific foods override seeded macro values at seed time.

Overrides are applied once during seeding.

---

## Data Rules

- IDs are immutable.
- Food names should be unique within their source.
- Nutrition values must never be negative.
- Categories must always exist.

---

# 9. UI & Design System

The UI should feel like a professional productivity application.

Avoid unnecessary visual decoration.

Data should always be the primary focus.

---

## Design Principles

The interface should be:

- Clean
- Minimal
- Consistent
- Readable
- Fast

Every screen should feel familiar.

---

## Design Language

Fully square, flat design:

- No rounded corners (except the brand "G" mark).
- No shadows.
- No opacity.
- Solid, flat colors only.

---

## Color Palette

Light theme

- Background: white
- Border: `#e2e8f0`
- Text: black
- Muted: `#64748b`

Dark theme

- Background: `#111111`
- Surface: `#1F1F1F`
- Border: `#2D2D2D`
- Text: `#FDFDFD`
- Muted: `#888888`

Functional

- Green: success / positive
- Red: errors, negative values, delete actions
- Orange: warnings

There is **no blue** in the application.

Avoid using colors for decoration.

Every color should communicate information.

---

## Border Radius

None.

Everything is square.

---

## Shadows

None.

Borders define components, not shadows.

---

## Typography

Use clear hierarchy.

Levels

Display

↓

Heading

↓

Subheading

↓

Body

↓

Caption

Avoid unnecessary font weights.

---

## Cards

Every feature is presented inside a card (`components/ui/card.tsx`).

Cards have consistent padding and borders.

---

## Buttons

Button types

Primary

Secondary

Outline

Ghost

Danger

Icon

Every button style lives in a single reusable `Button` component.

Delete actions use red text.

---

## Icons

Use Lucide React.

Icons should enhance readability.

Avoid decorative icons.

---

## Empty States

Every empty state should help the user.

Examples

No meals → "Add your first food."

No notes → "No notes for today."

No analytics → "Track a few days to see trends."

---

## Responsive Design

Primary breakpoint

Mobile

Secondary

Tablet

Desktop should scale naturally from mobile.

Do not design desktop-first.

---

## Accessibility

- Touch targets minimum 44px
- Readable contrast
- Visible focus states
- Semantic HTML
- Keyboard support where appropriate

---

# 10. Coding Standards

Consistency is more important than personal preference.

---

## General Rules

- TypeScript only
- Functional components only
- Strong typing
- No `any`
- No duplicated logic
- Small reusable functions

---

## Functions

Prefer

```
calculateMealNutrition()
```

Avoid

```
calc()
```

Function names should explain what they do.

---

## Comments

Write comments only when they explain intent.

Avoid commenting obvious code.

---

## Imports

Order imports consistently.

1. React
2. Third-party libraries
3. Internal modules
4. Types
5. Styles

---

## Error Handling

Handle expected failures gracefully.

Never silently ignore errors.

Show meaningful messages when user action is required.

---

## Git Commits

Recommended format

```
feat: add meal builder
fix: nutrition rounding
refactor: split meal card
docs: update architecture
```

Keep commits focused.

---

## Code Reviews

Before merging any feature verify:

- TypeScript passes
- Build succeeds
- Lint passes
- No console errors
- Responsive
- No duplicated logic

---

# 11. Performance & Optimization

Performance is a core feature of GTrak.

---

## Performance Goals

Initial Load

Under 2 seconds

Food Search

Under 100ms

Meal Update

Instant

Navigation

Instant

Charts

Smooth rendering

---

## Rendering Rules

Only re-render components whose state has changed.

Avoid unnecessary renders.

Use:

- React.memo
- useMemo
- useCallback

only when profiling shows a measurable benefit.

Avoid premature optimization.

---

## Search

Initialize the search index once.

Never rebuild during every search.

---

## Charts

Load chart data only when Analytics is opened.

Do not compute analytics on every Dashboard render.

---

## Bundle Size

Keep dependencies minimal.

Before adding a dependency, evaluate whether native React or existing utilities are sufficient.

---

## Memory

Avoid storing duplicate data.

Derive values instead of persisting them whenever practical.

---

## Lazy Loading

Lazy load:

- Analytics
- History
- Settings

Dashboard should remain the fastest screen.

---

## Optimization Checklist

Before shipping a feature:

✓ No unnecessary re-renders

✓ No duplicated calculations

✓ No duplicated state

✓ Efficient queries

✓ No memory leaks

✓ Responsive on mobile

---

# 12. Development Workflow & Deployment

---

## Development Process

Every feature follows this sequence:

1. Requirements
2. Architecture
3. Implementation
4. Review
5. Testing
6. Merge

Never skip architecture.

---

## Feature Development

Each feature should:

- Solve one problem
- Remain modular
- Include TypeScript types
- Follow existing architecture

Avoid combining unrelated features into one implementation.

---

## Code Reviews

Before considering a feature complete:

- Build passes
- Lint passes
- No TypeScript errors
- Mobile layout verified
- Existing features unaffected

---

## Branch Strategy

Recommended:

```
main
feature/meal-builder
feature/nutrition-engine
feature/history
feature/analytics
```

Main should always remain deployable.

---

## Deployment

Platform

- GitHub
- Vercel

Deployment flow

```
Local Development

↓

Git Commit

↓

Push to GitHub

↓

Automatic Vercel Deployment
```

Every push to the main branch should create a production deployment.

---

## Environment

Firebase configuration lives in `src/lib/firebase.ts`.

No secrets or sensitive values should be added outside the Firebase config.

---

## Versioning

Use Semantic Versioning.

```
v1.0.0
v1.1.0
v1.2.3
v2.0.0
```

---

## Documentation

Keep documentation updated whenever:

- Architecture changes
- Folder structure changes
- Major feature added
- Data model changes

Documentation is part of the project, not an afterthought.

---

## Final Principles

Every implementation should satisfy these goals:

- Simple
- Fast
- Accurate
- Mobile-first
- Privacy-focused
- Maintainable
- Extensible

When making implementation decisions, choose the solution that best aligns with these principles.

---

## Architecture Completion Checklist

The Architecture Document now defines:

✓ Project architecture

✓ Folder structure

✓ State management

✓ Database design

✓ Repository layer

✓ Component architecture

✓ Nutrition engine

✓ Food database

✓ UI guidelines

✓ Coding standards

✓ Performance guidelines

✓ Development workflow

This document serves as the technical source of truth for GTrak.

---

**End of Architecture Document**
