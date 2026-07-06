# GTrak – Architecture Document

**Version:** 1.0.0  
**Status:** Active  
**Framework:** React + Vite + TypeScript

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
- Offline-first
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

Dexie Database

↓

IndexedDB
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

Components never access Dexie directly.

---

## Database Layer

Responsible for:

- Persistent storage
- Versioning
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

Database

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
| UI Components | shadcn/ui |
| State Management | Zustand |
| Local Database | Dexie (IndexedDB) |
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

app/
assets/
components/
data/
hooks/
lib/
pages/
store/
styles/
types/
```

Each folder has one responsibility.

---

## Folder Responsibilities

### app/

Contains application bootstrap.

Examples:

- App.tsx
- Providers
- Router
- Global initialization

---

### assets/

Static assets.

Examples:

- Images
- Logos
- Icons
- Fonts

No application logic.

---

### components/

Reusable React components.

Structure:

```
components/

common/
ui/

dashboard/
meal/
nutrition/
history/
analytics/
settings/
```

Feature components should remain inside their respective folders.

---

### data/

Static application data.

Examples:

- Built-in food database
- Categories
- Quantity presets

No business logic.

---

### hooks/

Reusable custom hooks.

Examples:

- useDebounce
- useLocalStorage
- useSearch
- useNutrition

Hooks should never render UI.

---

### lib/

Shared business logic.

Examples:

- Nutrition Engine
- Search Engine
- Utility functions
- Constants
- Repository layer

This folder contains the application's core logic.

---

### pages/

Top-level screens.

Examples:

Dashboard

History

Analytics

Settings

Pages compose components.

Pages should contain very little business logic.

---

### store/

Global Zustand stores.

Examples:

Meal Store

History Store

Settings Store

Food Store

Each store should manage only one domain.

---

### styles/

Global styling.

Examples:

Tailwind overrides

Global styles

Theme variables

No component-specific CSS.

---

### types/

Shared TypeScript models.

Examples:

Food

Meal

History

Nutrition

Settings

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

Database
```

Lower layers must never import higher layers.

Example:

Database ❌ imports Store

Store ❌ imports Components

Component ❌ imports Database

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

## Planned Stores

### mealStore

Responsible for:

- Today's meals
- Meal items
- Meal completion
- Meal updates

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
- Theme
- Units

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

Database

↓

Store Update

↓

UI Update
```

Stores should never communicate directly with each other.

Communication should happen through shared services or repositories.

---

# 4. Database Design

GTrak stores all persistent data locally using **Dexie (IndexedDB)**.

No backend is required.

---

## Database Tables

Initial tables:

```
foods

customFoods

dailyLogs

settings
```

Future tables may include:

```
templates

favorites

analyticsCache
```

---

## foods

Contains built-in foods.

Fields:

- id
- name
- category
- unit
- nutritionPer100
- quantityOptions
- aliases
- source

This table is read-only.

---

## customFoods

Contains user-created foods.

Same structure as `foods`.

Users can:

- Add
- Edit
- Delete

---

## dailyLogs

One record per day.

Contains:

- Meals
- Nutrition totals
- Workout
- Water
- Weight
- Notes

Historical data should never be overwritten except when editing the same date.

---

## settings

Contains application preferences.

Examples:

- Nutrition targets
- Water goal
- Theme
- Measurement system

Only one settings record should exist.

---

## Database Rules

- Use IDs instead of names for relationships.
- Never duplicate food nutrition in the database.
- Nutrition should be calculated, not stored redundantly.
- Validate data before saving.

---

## Versioning

Dexie schema versions should be used for future migrations.

Never modify an existing schema without a migration plan.

---

## Backup Strategy

Export format:

- JSON (primary)
- CSV (selected datasets)

Import should validate the incoming data before writing it to the database.

---

## Data Ownership

All data belongs to the user.

The application:

- does not upload data
- does not collect analytics
- does not require login

User privacy is a core design principle.

---

# 5. Repository Layer

The Repository Layer separates business logic from data storage.

Components and stores should never communicate directly with Dexie.

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

## Planned Repositories

```
foodRepository.ts

mealRepository.ts

historyRepository.ts

settingsRepository.ts
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

Dexie

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
- Future cloud sync support
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

Generic reusable components.

Examples

```
Button

Card

Badge

Input

Dialog

Accordion

Progress

Select
```

These should never know anything about GTrak.

---

## Layout Components

Responsible for page structure.

Examples

```
AppShell

Header

BottomNavigation

PageContainer

Section
```

No business logic.

---

## Feature Components

Specific to GTrak.

Examples

```
MealCard

MealItem

NutritionCard

WorkoutCard

WaterCard

WeightCard

HistoryCard
```

Feature components may use stores and hooks.

---

## Page Components

Pages assemble feature components.

Examples

```
Dashboard

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

## File Structure

Example

```
MealCard/

MealCard.tsx

MealCardHeader.tsx

MealCardBody.tsx

MealCardFooter.tsx

hooks.ts

types.ts
```

Split large components into logical subcomponents.

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

## Custom Hooks

Reusable logic belongs in hooks.

Examples

```
useMeal()

useNutrition()

useSearch()

useHistory()

useWater()
```

Hooks should encapsulate behavior, not UI.

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

Quantity

↓

Nutrition Per 100 Units

↓

Meal Nutrition

↓

Daily Nutrition

↓

Dashboard
```

---

## Calculation Rules

Every food contains nutrition values per 100g, 100ml or per piece.

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

Never calculate analytics directly from meal items.

Analytics should always use historical daily summaries.

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

Targets are user configurable.

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
Below Target

↓

Incomplete
```

```
Equal Target

↓

Complete
```

```
Above Target

↓

Over Target
```

Status should update instantly.

---

## Calculation Principles

- No duplicated calculations.
- Use shared utility functions.
- Round values only for display.
- Keep internal precision.

---

## Future Support

The engine should easily support:

- Micronutrients
- Custom nutrients
- Recipes
- Supplement tracking

without architectural changes.

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
- Quantity Options
- Search Keywords
- Aliases
- Source

---

## Categories

Initial categories include:

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

Categories should be sorted alphabetically.

Foods within each category should also be sorted alphabetically.

---

## Search

Food search should be:

- Instant
- Fuzzy
- Case insensitive

Supported searches:

```
milk

↓

Milk
```

```
mlk

↓

Milk
```

```
chk

↓

Chicken
```

---

## Quantity Options

Every food owns its quantity options.

Examples

Egg

```
1
2
3
4
5
6
```

Milk

```
100ml
150ml
200ml
250ml
300ml
```

Rice

```
100g
150g
200g
250g
300g
350g
400g
```

The UI should never display invalid quantities.

---

## Food Sources

Nutrition data should primarily come from:

- ICMR–NIN Indian Food Composition Tables
- FSSAI
- USDA (only if Indian data is unavailable)

Every food should store its data source.

---

## Custom Foods

Custom foods should use the exact same model as built-in foods.

The rest of the application should not distinguish between them.

---

## Future Expansion

The database should support:

- Regional Indian foods
- International foods
- Recipes
- Packaged products
- Barcode products
- User-created foods

without requiring schema changes.

---

## Search Optimization

Initialize the search index once during application startup.

Rebuild the index only when:

- Custom food added
- Custom food edited
- Custom food deleted

Avoid rebuilding on every search.

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

## Color Palette

Primary

- Blue

Neutral

- White
- Black
- Gray

Functional

- Green (Success)
- Red (Error)
- Orange (Warning)

Avoid using colors for decoration.

Every color should communicate information.

---

## Border Radius

Use subtle rounded corners.

Avoid overly rounded ("pill") components unless required.

---

## Shadows

Keep shadows minimal.

Borders should define components instead of shadows.

---

## Spacing

Use a consistent spacing scale.

Example

```
4
8
12
16
20
24
32
40
48
```

Avoid arbitrary spacing values.

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

Every feature is presented inside a card.

Examples

- Meal Card
- Nutrition Card
- History Card
- Analytics Card
- Settings Card

Cards should have consistent:

- Padding
- Borders
- Radius
- Header spacing

---

## Buttons

Button types

Primary

Secondary

Outline

Ghost

Danger

Icon

Every button style should have a single reusable component.

---

## Icons

Use Lucide React.

Icons should enhance readability.

Avoid decorative icons.

---

## Animations

Animations should communicate state.

Examples

Accordion expand

Dialog open

Success feedback

Avoid decorative animations.

Target duration

100–150ms

---

## Empty States

Every empty state should help the user.

Examples

No history

↓

"Start tracking today."

No meals

↓

"Add your first food."

No analytics

↓

"Track a few days to see trends."

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

Touch targets

Minimum 44px

Readable contrast

Visible focus states

Semantic HTML

Keyboard support where appropriate

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

## Naming

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

Constants

```
FOOD_CATEGORIES
```

Use descriptive names.

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

## Components

Each component should have one responsibility.

If a component exceeds ~300 lines,

consider splitting it.

---

## Hooks

Custom hooks should encapsulate reusable logic.

Hooks should not render UI.

---

## Comments

Write comments only when they explain intent.

Avoid commenting obvious code.

Good

```ts
// Calculate nutrition before persisting to history
```

Bad

```ts
// Increment i
i++
```

---

## Imports

Order imports consistently.

1.

React

2.

Third-party libraries

3.

Internal modules

4.

Types

5.

Styles

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

The application should remain smooth even with years of user data.

---

## Performance Goals

Initial Load

- Under 2 seconds

Food Search

- Under 100ms

Meal Update

- Instant

Navigation

- Instant

Charts

- Smooth rendering

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

Rebuild only when:

- Custom food added
- Custom food edited
- Custom food deleted

Never rebuild during every search.

---

## Database

Only query the data required.

Avoid loading unnecessary records.

Cache frequently accessed data when appropriate.

---

## Charts

Load chart data only when Analytics is opened.

Do not compute analytics on every Dashboard render.

---

## Bundle Size

Keep dependencies minimal.

Avoid introducing libraries for problems already solved by the current stack.

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

This section defines how GTrak is developed and released.

---

## Development Process

Every feature follows this sequence:

1.

Requirements

↓

2.

Architecture

↓

3.

Implementation

↓

4.

Review

↓

5.

Testing

↓

6.

Merge

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

No environment variables are required for the MVP.

If introduced later, they should never contain sensitive user data.

---

## Versioning

Use Semantic Versioning.

Examples

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
- Offline-first
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