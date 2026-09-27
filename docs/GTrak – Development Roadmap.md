# GTrak – Development Roadmap

**Version:** 1.2.0

This roadmap tracks the development progress of GTrak.

Status

- ☐ Not Started
- 🚧 In Progress
- ☑ Completed
- ⏸ On Hold

---

# Phase 1 — Foundation

## Project Setup

☑ Vite + React + TypeScript

☑ Tailwind CSS

☑ Zustand

☑ Firebase (Firestore + Anonymous Auth)

☑ Project Structure

☑ Documentation

Dependencies

None

---

## Design System

☑ Theme (light + dark)

☑ Typography

☑ Layout

☑ Cards

☑ Buttons

☑ Navigation (5-tab bottom nav)

Dependencies

Project Setup

---

# Phase 2 — Core Architecture

## Domain Models

☑ Food Types

☑ Meal Types

☑ Nutrition Types

☑ History Types

☑ Settings Types

☑ Tracking Types (water, weight, workout, notes)

☑ Tretinoin Types

☑ Respect Types

Dependencies

Foundation

---

## Database

☑ Firebase Firestore Setup

☑ Database Initialization

☑ Seeding Built-in Foods

☑ Seeding Categories / Presets / Sources

☑ Seeding Macro Overrides

Dependencies

Domain Models

---

## Repository Layer

☑ Food Repository

☑ Meal Repository

☑ History Repository

☑ Settings Repository

☑ Water / Weight / Workout / DailyNote Repositories

☑ Tretinoin Repository

☑ Respect Repository

☑ cleanForFirestore utility (strips undefined before writes)

Dependencies

Database

---

## State Management

☑ mealStore

☑ foodStore

☑ historyStore

☑ settingsStore

☑ waterStore / weightStore / workoutStore / dailyNoteStore

☑ tretinoinStore / respectStore

Dependencies

Repositories

---

# Phase 3 — Food System

## Food Database

☑ Categories

☑ Foods (IFCT 2017 + USDA + FSSAI)

☑ Quantity Presets

☑ Nutrition Sources

Dependencies

Repositories

---

## Search

☑ Fuzzy Search

☑ Category Filter

☑ Recent Foods

☑ Favorites

Dependencies

Food Database

---

## Custom Foods

☑ Food Macro Editor (create / edit nutrition values)

Dependencies

Food Database

---

# Phase 4 — Meal Builder

## Meal Components

☑ Meal Card

☑ Meal Item

☑ Food Picker

☑ Quantity Picker

☑ Add Item

☑ Delete Item

Dependencies

Food Database

Search

---

## Meal Logic

☑ Create Meals

☑ Update Meals

☑ Delete Meals (with 24h undo)

☑ Auto Completion

☑ Unit-aware calculation (gramsPerUnit / measures)

☑ Date navigator (build meals for any date)

Dependencies

Meal Components

---

# Phase 5 — Nutrition Engine

## Calculations

☑ Meal Nutrition

☑ Daily Nutrition

☑ Progress

☑ Status

Dependencies

Meal Builder

---

## Dashboard

☑ Daily Summary

☑ Nutrition Summary

☑ Progress Cards

Dependencies

Nutrition Engine

---

# Phase 6 — Tracking

## Workout

☑ Workout Card

☑ Workout Logging

☑ Workout History

---

## Water

☑ Water Logging

☑ Water Goal

☑ Progress

---

## Weight

☑ Daily Weight

☑ Weight History

☑ Trends

---

## Notes

☑ Daily Notes

Dependencies

Dashboard

---

## Tretinoin

☑ Tretinoin Tracker (every 3rd night schedule)

☑ History integration (editable in edit mode)

---

## Respect/Trust Score

☑ Respect Tracker (3 factors: Do What You Said / Excuse / Flake)

☑ Progress bar (max 50)

☑ Dashboard editable counters

☑ History edit-mode editing with buffered save/cancel

---

# Phase 7 — History

☑ Daily History

☑ History Details

☑ Edit History (edit mode with Save/Cancel)

☑ Delete History

☑ Undo Banner (24h soft-delete window)

☑ Expanded food items

☑ Tretinoin + Respect display

Dependencies

Tracking

---

# Phase 8 — Analytics

☑ Weight Chart

☑ Nutrition Charts

☑ Water Trends

☑ Workout Trends

☑ Weekly Summary

☑ Monthly Summary

☑ Tretinoin Adherence chart

☑ Respect/Trust Score trend chart

Dependencies

History

---

# Phase 9 — Settings

☑ Nutrition Targets

☑ Water Goal

☑ Theme

☑ Import

☑ Export

☑ Reset (password-protected, clears user data)

Dependencies

History

---

# Phase 10 — Polish

☑ Performance Optimization

☐ Accessibility

☑ Empty States

☑ Loading States

☑ Error Handling

☐ Responsive Testing

☑ Final Refactoring

Dependencies

Everything

---

# Phase 11 — UI/UX Refinement

The objective of this phase is **not to redesign the application**, but to refine the existing implementation into a polished, production-quality experience without changing the underlying architecture or business logic.

## Visual Refinement

☑ Improve visual hierarchy

☑ Standardize spacing and padding

☑ Refine typography

☑ Improve card consistency

☑ Improve icon consistency

☑ Improve color consistency

☑ Improve dashboard layout

☑ Improve meal card layout

☑ Improve nutrition panel layout

☑ Improve history layout

☑ Improve analytics layout

☑ Improve settings layout

---

## User Experience

☑ Reduce unnecessary user interactions

☑ Improve navigation flow

☑ Improve food picker experience

☑ Improve quantity selector experience

☑ Improve form interactions

☑ Improve touch targets

☐ Improve keyboard behaviour

☐ Improve scrolling experience

☐ Improve accessibility

---

## States & Feedback

☑ Improve loading states

☑ Improve empty states

☑ Improve error states

☑ Improve success feedback

☐ Improve validation feedback

---

## Motion

☐ Refine accordion animations

☐ Refine dialog animations

☐ Refine page transitions

☐ Add subtle micro-interactions

☐ Improve progress animations

---

## Responsive Review

☐ Small Mobile

☐ Large Mobile

☐ Tablet

☐ Desktop

---

## Final Design Review

☐ UI consistency audit

☐ UX consistency audit

☐ Accessibility review

☐ Final production design approval

Dependencies

Phase 10 — Polish

---

# Phase 12 — Infrastructure

## Firebase Migration

☑ Firestore repositories (replaced Dexie)

☑ Anonymous authentication

☑ Seeding pipeline (`seedIfEmpty`)

☑ `cleanForFirestore` write sanitization

☑ Vercel production deployment

---

# Phase 13 — Gothic Refinement + Hardening (v1.2.0)

UI is source-of-truth over older "square design" doc text (superseded in v1.2.0).

## Design System Adoption

☑ Astryx v0.4.3 + gothic theme (`core`, `theme-gothic`, CLI workflow in `AGENTS.md`)

☑ Rounded corners everywhere (cards `rounded-xl`, inputs/buttons/items `rounded-lg`)

☑ Gothic dark tokens live in `src/index.css` (bg `#101314`, surface `#1a1d20`, border `#24292D`, text `#E8F1F6`, muted `#96A0AB`, accent `#a3b5d6`, success `#b3c79a`, warning `#d3c490`, error `#c6a6a2`)

☑ Sentence-case labels (Water intake, Respect/Trust score, Daily notes, Submit daily log)

☑ Astryx `ProgressBar` for water + nutrition summaries (real `label` props)

☑ Astryx `Table` for weight history (rows `text-sm`, headers `text-xs`)

☑ Dashboard font tuning (h1 `text-xl`, Daily summary `text-base`) + Submit button `size="lg"`

---

## MealBuilder Redesign

☑ Gothic redesign (header + Edit Foods, Prev/date/Next pills, New Meal card, inline edit section, meals list)

☑ Per-item Remove / Edit with inline `QuantityPicker` (Save/Cancel)

☑ Meal name required (Create disabled on empty input + handler guard; no silent `'Meal'` fallback)

☑ Date pill opens Astryx calendar via hidden `DateInput` overlay (no `pointer-events-none` — see gotcha below)

---

## Tracking Tweaks

☑ Water quick-add: 250 / 300 / 350 / 500 / 750 ml

---

## Build Hardening

☑ Strict `tsc -b && vite build` green (fixed duplicate declarations, missing `QuantityPicker` import, restored `isToday`, removed unused `Button` import / `onDelete` prop — Vercel `TS6133`)

☑ Known gotcha recorded: never wrap Astryx `DateInput` in `pointer-events-none` (inline popover inherits it → visible-but-unclickable calendar)

---

## Docs

☑ `MEMORY.md` handoff file (purpose, functionality, approach, design system, scalability, services, food data, changelog, guardrails)

☑ All docs bumped to v1.2.0 (app-as-truth: rounded gothic, Astryx stack, writable `foods`, backup gap documented)

Dependencies

Everything

---

# Development Rules

For every completed feature:

- Update this roadmap.
- Update documentation if architecture changes.
- Ensure the build passes.
- Verify mobile responsiveness.
- Commit with a meaningful Git message.

---

**End of Roadmap**
