
# GTrak – Product Requirements Document (PRD)

**Version:** 1.1.0  
**Status:** In Development  
**Owner:** Neo  
**Project Type:** Nutrition & Fitness Tracker  
**Platform:** Progressive Web Application (PWA)  
**Backend:** Firebase Firestore (cloud) + Anonymous Auth

---

# 1. Product Overview

## 1.1 Vision

GTrak is a lightweight nutrition and fitness tracker designed for people who want complete control over their meals, workouts, habits and progress without relying on bloated applications.

The application focuses on speed, simplicity and flexibility while maintaining accurate nutritional calculations using authentic food composition data.

Unlike traditional calorie trackers that force users into predefined meals, GTrak allows users to dynamically build each meal by selecting individual food items and quantities, resulting in more accurate tracking and a much better user experience.

---

## 1.2 Mission

Build the fastest, cleanest and most customizable nutrition tracker that:

- loads instantly
- requires zero manual login (anonymous auth)
- is installable as a PWA
- is mobile-first
- remains lightweight while supporting advanced tracking features
- keeps the user's data exportable, importable and resettable at any time

---

# 1.3 Product Philosophy

Every feature inside GTrak must follow these principles.

## Simplicity First

The UI should never overwhelm the user.

Every screen should have one primary purpose.

Avoid unnecessary animations, decorative elements or visual clutter.

---

## Data First

The application exists to present meaningful data.

The interface should prioritize:

- nutrition
- workouts
- habits
- progress
- trends

over decorative graphics.

---

## Mobile First

GTrak is designed primarily for phones.

Desktop support is secondary.

Every interaction should be optimized for thumb navigation.

---

## Speed First

Every interaction should update instantly.

No action should ever require manual calculation or a page reload.

---

## User Ownership

Users own their data.

Export and import are first-class features.

No analytics collection and no telemetry.

---

## Extensibility

Every feature should be designed so new functionality can be added without rewriting existing code.

Examples:

- new foods
- new meal types
- new analytics
- barcode scanner
- AI recommendations

---

# 1.4 Goals

Primary goals:

- Accurate nutrition tracking
- Fast meal logging
- Excellent mobile UX
- Long-term maintainability
- Lightweight application
- Production-quality codebase

---

# 1.5 Non Goals

The first version of GTrak will NOT include:

- Manual user accounts (anonymous auth only)
- Social features
- Community feed
- Chat
- Subscription system
- Advertisement system
- Payment integration
- Wearable integrations
- AI meal recognition

These may be considered in future versions but are intentionally excluded from the MVP.

---

# 1.6 Target Users

Primary audience:

- Gym enthusiasts
- Lean bulk users
- Fat loss users
- Athletes
- Calisthenics practitioners
- Students
- Anyone wanting precise nutrition tracking

---

## User Characteristics

Users generally:

- prepare their own meals
- want accurate nutrition
- dislike bloated calorie trackers
- prefer privacy
- want a quick way to log daily habits and accountability scores

---

# 1.7 Core Problem Statement

Existing nutrition trackers often suffer from one or more of the following:

- fixed meal structures
- poor customization
- slow interfaces
- excessive advertisements
- subscription paywalls
- cluttered interfaces
- no built-in habit or accountability tracking

GTrak solves these problems by providing a fast, customizable tracking experience that covers nutrition, workouts, body weight, hydration, habits (tretinoin) and accountability (respect score) in one place.

---

# 1.8 Success Criteria

The application should allow a user to:

- log a complete day's meals in under 2 minutes
- search any food within milliseconds
- instantly update nutrition totals
- log workout, water, weight, tretinoin and respect score in seconds
- export all personal data at any time

---

# 1.9 Product Identity

Name:

**GTrak**

Meaning:

Growth Tracker

Brand values:

- Simple
- Fast
- Accurate
- Private
- Lightweight
- Professional

---

# 1.10 Design Language

Visual style should remain consistent throughout the application.

Fully square, flat design:

- No rounded corners (except the brand "G" mark).
- No shadows.
- No opacity.
- Solid, flat colors.

Light theme:

- White background, `#e2e8f0` borders, black text.

Dark theme:

- `#111111` background, `#1F1F1F` surfaces, `#2D2D2D` borders, `#FDFDFD` text.

Functional colors:

- Green: success / positive values
- Red: errors, negative values, delete actions
- Orange: warnings

There is **no blue** in the application.

Avoid:

- gradients
- glassmorphism
- neumorphism
- shadows
- decorative illustrations

The interface should resemble a professional productivity tool rather than a social media application.

---

# 2. Product Objectives & Core Features

## 2.1 Product Objectives

GTrak is designed to solve one problem exceptionally well:

> Help users consistently track nutrition, workouts, body progress and daily habits with minimal effort.

To achieve this, every feature must contribute to at least one of the following objectives.

### O1. Fast Daily Logging

Users should be able to log an entire day's meals quickly without repeatedly entering the same information.

Target:

- Complete daily logging within 2–3 minutes.

---

### O2. Accurate Nutrition Tracking

Nutrition values should be calculated from individual food items rather than predefined meals.

This allows users to accurately track mixed meals and adjust quantities without manual calculations.

---

### O3. Flexible Meal Building

Meals should not be restricted to predefined templates.

Users must be able to:

- add unlimited food items
- remove food items
- edit quantities
- change foods at any time
- build meals for any past date

---

### O4. Long-Term Tracking

The application should encourage consistency by storing historical data including:

- meals
- workouts
- weight
- water intake
- daily notes
- tretinoin application
- respect/trust score

Analytics are generated from this data.

---

### O5. Habit & Accountability Tracking

Users should be able to track daily habits (tretinoin) and an accountability score (respect/trust score) alongside nutrition and fitness data.

---

# 2.2 Core Features (MVP)

The first release of GTrak focuses on the following core modules.

---

## Module 1 — Daily Meal Tracker

Purpose:

Allow users to build every meal dynamically using individual food items.

Capabilities:

- Unlimited food items per meal
- Dynamic quantity selection with unit conversion (g / ml / piece / cup / tbsp / tsp / slice)
- Instant nutrition calculation
- Edit or delete foods
- Food Macro Editor for custom food nutrition
- 24-hour undo on deleted meals

---

## Module 2 — Nutrition Dashboard

Purpose:

Provide a live overview of daily nutrition progress.

Tracked Nutrients:

- Calories
- Protein
- Carbohydrates
- Fat
- Fiber

Each nutrient displays:

- Current value
- Daily target
- Progress
- Status

Status Types:

- Incomplete
- Complete
- Over Target

---

## Module 3 — Workout Tracking

Track daily workout information.

Initial workout types:

- Push
- Pull
- Legs
- Rest

Future workout categories may be added without changing the existing data model.

---

## Module 4 — Hydration Tracking

Track total daily water intake.

Requirements:

- Quick logging
- Adjustable target
- Daily completion status

---

## Module 5 — Weight Tracking

Track bodyweight over time.

Capabilities:

- Daily entry
- Trend visualization
- Weekly comparison
- Monthly comparison

---

## Module 6 — Daily Notes

Allow users to store notes for each day.

Example:

- Energy level
- Recovery
- Mood
- Injuries
- General observations

---

## Module 7 — Tretinoin Tracking

Track daily tretinoin application.

Capabilities:

- Yes/No daily toggle
- Every-3rd-night schedule reminder (surfaces only on scheduled nights)
- History review (editable)
- Analytics adherence chart

---

## Module 8 — Respect/Trust Score

Track an accountability score using three factors.

Factors:

- Do What You Said (±1)
- Excuse (±1)
- Flake / Ignored (±3)

Total = sum of the three factors.

Display:

- Counter buttons (editable on Dashboard at all times)
- Progress bar (max 50, green when positive, red when negative)
- History edit-mode editing (changes buffered; saved on Save, discarded on Cancel)
- Analytics trend chart

---

# 2.3 Feature Priorities

Priority 1 (Critical)

- Meal Builder
- Nutrition Engine
- Food Search
- Daily Dashboard

These are required before the application can be considered usable.

---

Priority 2 (High)

- History
- Weight Tracking
- Water Tracking
- Workout Tracking

---

Priority 3 (Medium)

- Charts
- Analytics
- Food Favorites
- Tretinoin Tracking
- Respect/Trust Score

---

Priority 4 (Future)

- Barcode Scanner
- AI Meal Suggestions
- Cloud Backup (explicit)
- Wearable Integration
- Multi-device Sync

---

# 2.4 User Experience Goals

The application should feel:

- Fast
- Predictable
- Responsive
- Minimal
- Professional

Users should never wonder:

- where to tap
- how to save
- how to calculate nutrition

Everything should update automatically.

---

# 2.5 Functional Requirements

The application must:

- Support unlimited meal items.
- Allow editing any meal after saving.
- Calculate nutrition instantly.
- Support unit conversion through `gramsPerUnit` / measures.
- Persist all data to Firestore.
- Load previous sessions automatically.
- Export and import user data.
- Support custom foods via the Food Macro Editor.
- Track tretinoin and respect/trust score.

---

# 2.6 Non-Functional Requirements

Performance

- Initial load under 2 seconds.
- Meal update under 50ms.
- Food search under 100ms.
- Smooth scrolling on low-end Android devices.

Reliability

- No data loss after refresh.
- Safe storage.
- Graceful recovery from failures.

Maintainability

- Modular architecture.
- Strong typing.
- Reusable components.
- Minimal code duplication.

Accessibility

- Keyboard accessible where applicable.
- High color contrast.
- Large touch targets.
- Semantic HTML.

---

# 2.7 Definition of MVP

Version 1.0 of GTrak is considered complete when all of the following are functional:

- Dynamic meal builder
- Food database
- Nutrition engine
- Daily dashboard
- Workout logging
- Water tracking
- Weight tracking
- Daily history
- Charts / Analytics
- Export / Import
- Custom foods
- Tretinoin tracking
- Respect/Trust score
- PWA installation

---

# 3. User Experience & User Flows

This section defines how users interact with GTrak.

It focuses on reducing friction, minimizing taps, and ensuring every action is intuitive and fast.

---

# 3.1 UX Principles

Every interaction in GTrak should follow these principles.

## 1. Less Taps

Users should complete common actions using as few interactions as possible.

## 2. Zero Manual Calculations

The application performs all nutrition calculations automatically.

The user should never calculate:

- Calories
- Protein
- Carbohydrates
- Fat
- Fiber

## 3. Progressive Disclosure

Only display information when needed.

Example:

Meal collapsed → Meal Name, Meal Nutrition, Completion

Expand → Food Items, Add Item Button, Delete Item, Quantity Picker

## 4. Consistency

Every meal behaves exactly the same.

Every card follows the same interaction pattern.

Every action uses consistent terminology.

## 5. Instant Feedback

Every interaction immediately updates:

- Meal Nutrition
- Daily Nutrition
- Progress Bars
- Completion Status

---

# 3.2 Primary Navigation

The application uses Bottom Navigation.

Tabs (5):

- Dashboard
- Meals
- History
- Analytics
- Settings

The Dashboard is the default landing screen.

The active tab indicator is a square.

---

# 3.3 Dashboard

The Dashboard is the application's primary screen.

Order of sections:

1. Header

↓

2. Daily Summary

↓

3. Nutrition

↓

4. Today's Meals

↓

5. Workout

↓

6. Water Intake

↓

7. Tretinoin

↓

8. Weight

↓

9. Respect/Trust Score

↓

10. Daily Notes

This order should remain consistent.

---

# 3.4 Meal Flow

Example:

User opens the Meals tab.

↓

User taps "New Meal" or opens an existing meal.

↓

User selects Food.

↓

Quantity options update automatically (with unit conversion).

↓

User selects Quantity.

↓

Nutrition updates instantly.

↓

User taps Add Item.

↓

Another meal item appears.

↓

Repeat.

There is no limit on meal items.

---

# 3.5 Food Selection Flow

Food selection must be searchable.

Food Picker

↓

Search (fuzzy, Fuse.js)

↓

Categories

↓

Foods

Foods are sorted alphabetically inside each category.

---

# 3.6 Quantity Flow

Quantity options depend on the selected food.

Units:

- g
- ml
- piece
- cup
- tbsp
- tsp
- slice

Non-weight units convert to grams through the food's `measures` array (`gramsPerUnit`).

Users should never see invalid quantity options.

---

# 3.7 Daily Nutrition Flow

Every completed meal contributes to:

- Daily Calories
- Daily Protein
- Daily Carbs
- Daily Fat
- Daily Fiber

The Dashboard updates immediately after any change.

---

# 3.8 Status Indicators

Every tracked nutrient displays one status.

Incomplete

Current value is below target.

Complete

Current value exactly equals target.

Over Target

Current value exceeds target.

These indicators should be visually subtle and never dominate the interface.

---

# 3.9 History Flow

Users can review previous days.

Each history record displays:

- Nutrition
- Meals
- Workout
- Water
- Tretinoin
- Respect/Trust Score
- Weight
- Daily Notes

Edit mode:

- Editing enables interactive controls (workout, water, weight, notes, tretinoin, respect).
- Changes are buffered.
- "Save Changes" persists; "Cancel" discards and reloads original data.
- Delete buttons appear only in edit mode.

Deleting a meal moves it to a 24-hour undo window.

---

# 3.10 Weight Flow

Users may log bodyweight once per day.

If today's weight already exists, editing replaces the previous value.

Weight history is visualized in Analytics.

---

# 3.11 Water Tracking

Users can quickly log water intake.

Water contributes to:

- Today's completion
- Analytics
- History

---

# 3.12 Tretinoin Flow

Users toggle Yes/No for tretinoin application each day.

The tracker surfaces only on scheduled nights (every 3rd night from the last application).

History shows the toggle per day (editable in edit mode).

---

# 3.13 Respect/Trust Score Flow

Users update three counters throughout the day from the Dashboard:

- Do What You Said
- Excuse
- Flake

Each tap updates the total instantly.

Progress bar max is 50.

History edit mode allows adjusting past days (buffered, saved on Save).

---

# 3.14 Notes

Users can write optional notes.

Examples:

- Recovery
- Sleep
- Injury
- Mood
- Energy
- General observations

---

# 3.15 Error Prevention

The interface should prevent mistakes whenever possible.

Examples:

- Invalid quantities cannot be selected.
- Foods always belong to a valid category.
- Negative values are never accepted.
- Empty meals cannot be marked complete.

---

# 3.16 Empty States

The application should provide meaningful empty states.

Examples:

No meals logged → "Start by adding your first food."

No weight history → "Log today's weight to begin tracking."

No notes → "No notes for today."

---

# 3.17 Future User Flows

The architecture should support future additions without redesigning existing screens.

Examples:

- Meal Templates
- Copy Previous Day
- Duplicate Meal
- Barcode Scanner
- AI Suggestions
- Voice Logging

---

# 4. Feature Specifications

This section defines every core module of GTrak.

These specifications are the single source of truth for implementation.

---

# 4.1 Dashboard

## Purpose

The Dashboard is the application's home screen.

It provides a complete overview of today's progress without requiring navigation.

---

## Sections

The Dashboard contains the following sections in order.

1. Header
2. Daily Summary
3. Nutrition
4. Today's Meals
5. Workout
6. Water Intake
7. Tretinoin
8. Weight
9. Respect/Trust Score
10. Daily Notes

This order should remain consistent throughout the application.

---

## Daily Summary

Displays today's overview.

Includes:

- Current Date
- Meals Completed
- Calories Consumed
- Workout Status

---

## Nutrition Summary

Displays the following nutrients.

- Calories
- Protein
- Carbohydrates
- Fat
- Fiber

Each nutrient displays:

- Current Value
- Target Value
- Progress Indicator
- Status

---

# 4.2 Meal Builder

## Purpose

Allow users to construct every meal dynamically.

Meals are collections of food items.

Meals themselves never contain nutrition.

Nutrition is calculated from their food items.

---

## Meal Card

Each meal is displayed as a card.

Collapsed state displays:

- Meal Name
- Calories
- Protein
- Completion Status

Expanded state displays:

- Food Items
- Add Food Button
- Delete Food Button
- Meal Total

---

## Meal Item

Each meal item consists of:

Food Selector

↓

Quantity + Unit Selector

↓

Delete Button

---

## Add Food

Users may add unlimited food items.

Every new item starts as:

Food → "Select Food"

Quantity → Disabled

Once a food is selected, the quantity selector becomes active.

---

## Delete Food

Users may remove any food item.

Deletion is protected by a 24-hour undo banner.

---

## Completion

A meal is considered completed when:

- Every meal item has a valid food.
- Every meal item has a valid quantity.

No manual "Complete" button is required.

Completion is automatic.

---

## Date Navigator

Meals can be built for any date (past or present) via the date navigator.

---

# 4.3 Food Database

## Purpose

Provide a centralized repository of foods.

Every food in the application originates from this database.

---

## Food Properties

Every food contains:

- Name
- Category
- Unit
- Nutrition Per 100 Units
- Measures (gramsPerUnit conversion for non-weight units)
- Aliases
- Data Source

---

## Categories

Examples:

Fruits

Vegetables

Leafy Vegetables

Grains

Rice

Dairy

Eggs

Chicken

Fish

Pulses

Beans

Nuts

Seeds

Beverages

Oils

Others

Categories are sorted alphabetically.

Foods inside each category are also sorted alphabetically.

---

## Search

Users may search foods.

Search should support:

- Partial matches
- Misspellings
- Aliases

Example:

Typing "chk" should find Chicken.

Typing "mlk" should find Milk.

---

## Food Macro Editor

Users can create custom foods.

Capabilities:

- Enter name, category, unit
- Enter nutrition values per 100g
- Optionally select a serving quantity and unit
- Values are re-scaled to per-100g automatically
- The food's `measures` array is updated on save

---

# 4.4 Quantity System

Every food defines its own measures.

Units:

- g
- ml
- piece
- cup
- tbsp
- tsp
- slice

Users should never manually enter quantities.

Non-weight selections convert to grams for calculation.

---

# 4.5 Nutrition Engine

The Nutrition Engine is responsible for all calculations.

It receives:

Food

↓

Quantity + Unit

↓

Grams

↓

Returns

Calories

Protein

Carbs

Fat

Fiber

Meals never store nutrition directly.

Nutrition is always calculated.

---

## Calculation Rules

Nutrition is calculated using:

Nutrition Per 100g

×

Grams (converted from the selected quantity/unit)

Meal totals are calculated from all meal items.

Daily totals are calculated from all meals.

No duplicate calculations should exist.

---

# 4.6 Workout

Track one workout per day.

Workout Types:

- Push
- Pull
- Legs
- Rest

Future workout types should be supported without code changes.

---

# 4.7 Water

Track daily water intake.

Displays:

Current Intake

↓

Daily Goal

↓

Completion

Users may change their daily goal.

---

# 4.8 Weight

One bodyweight entry per day.

Users may edit today's weight.

Historical weights are preserved.

---

# 4.9 Notes

Each day supports one note.

There is no character limit for MVP.

Plain text only.

---

# 4.10 Tretinoin

One entry per day: applied (Yes/No).

Schedule: every 3rd night from the last applied date.

The tracker card appears on Dashboard only on scheduled nights.

---

# 4.11 Respect/Trust Score

Three counters updated through the day:

- Do What You Said (±1)
- Excuse (±1)
- Flake (±3)

Total = sum.

Progress bar max = 50.

Editable on Dashboard at all times.

Editable in History edit mode (buffered, saved on Save, discarded on Cancel).

---

# 4.12 History

History stores complete daily records.

Each record contains:

- Nutrition
- Meals
- Workout
- Water
- Tretinoin
- Respect/Trust Score
- Weight
- Daily Notes

History records are editable in edit mode.

Deleting a meal moves it to a 24-hour undo window.

---

# 4.13 Analytics

Analytics should visualize:

- Daily Calories
- Protein
- Carbs
- Fat
- Weight
- Water
- Workout Consistency
- Meal Consistency
- Tretinoin Adherence
- Respect/Trust Score Trend

Future analytics should reuse existing history data.

---

# 4.14 Settings

Settings include:

- Daily Nutrition Targets
- Water Goal
- Theme (light / dark / system)
- Export
- Import
- Reset Application (password-protected)

---

# 4.15 Performance Requirements

The application should remain responsive with:

- 500+ foods
- 5+ years of history
- Thousands of meal records

Users should never experience noticeable lag during normal operation.

---

# 4.16 Success Criteria

The feature implementation is considered complete when:

✓ Every meal updates instantly.

✓ Nutrition calculations are automatic.

✓ Dashboard updates without refresh.

✓ History is accurate.

✓ Analytics match history.

✓ Export / import works.

✓ No duplicated business logic exists.

---

# 5. Technical Constraints & Product Rules

This section defines the implementation rules for GTrak.

These rules are mandatory and must be followed throughout development.

---

# 5.1 Core Principles

Every technical decision should satisfy the following principles.

Priority order:

1. Simplicity
2. Performance
3. Maintainability
4. Extensibility
5. Visual Consistency

If two approaches solve the same problem, always choose the simpler one.

---

# 5.2 Mobile First

GTrak is designed primarily for mobile devices.

The interface should be optimized for:

- One-handed usage
- Touch interactions
- Small screens
- Portrait orientation

Desktop layouts are secondary.

---

# 5.3 Data Layer

GTrak persists data to Firebase Firestore using anonymous authentication.

All writes go through repositories and are sanitized with `cleanForFirestore()` (strips `undefined`).

Optional numeric fields must be read with `??` (nullish) so zero values are preserved.

---

# 5.4 Performance Requirements

Performance is a core feature.

Target metrics:

Initial Load

< 2 seconds

Food Search

< 100ms

Nutrition Update

< 50ms

Navigation

Instant

Animation Duration

100–150ms maximum

No feature should noticeably block the UI.

---

# 5.5 Data Integrity

The application must prevent invalid data.

Examples:

- Meal cannot contain invalid food.
- Quantity cannot exist without food.
- Negative nutrition values are impossible.
- Negative water values are impossible.
- Negative body weight is impossible.
- Invalid records should never be stored.

---

# 5.6 Single Source of Truth

Every piece of information should exist only once.

Examples:

- Food nutrition exists only in the Food Database.
- Meal nutrition is always calculated.
- Daily nutrition is always calculated.
- Meal items snapshot food name and gramsPerUnit for stable history.

Avoid duplicated business logic.

---

# 5.7 Automatic Calculations

Users should never manually calculate anything.

The application automatically calculates:

- Calories
- Protein
- Carbohydrates
- Fat
- Fiber
- Meal totals
- Daily totals
- Progress
- Completion
- Analytics

---

# 5.8 Predictable UI

The interface should behave consistently.

Every accordion behaves the same.

Every button behaves the same.

Every delete action behaves the same.

The user should never have to guess how something works.

---

# 5.9 Error Prevention

Prevent errors before they happen.

Examples:

- Disable invalid actions.
- Disable quantity selector until food is selected.
- Prevent invalid imports.
- Prevent corrupted data from crashing the application.

---

# 5.10 Progressive Enhancement

Every future feature should integrate into the existing architecture without requiring major rewrites.

Examples:

- Meal Templates
- Barcode Scanner
- Cloud Backup (explicit)
- Notifications
- AI Suggestions

These features should extend existing modules instead of replacing them.

---

# 5.11 Data Ownership

Users own all of their data.

The application must provide:

- Export
- Import
- Reset

No automatic uploads beyond the anonymous Firestore store.

No analytics collection.

No tracking.

No telemetry.

Privacy is a core product value.

---

# 5.12 Visual Rules

The interface should remain minimal.

Light theme:

- White background
- Black text
- `#e2e8f0` borders

Dark theme:

- `#111111` background
- `#1F1F1F` surfaces
- `#2D2D2D` borders
- `#FDFDFD` text

Functional colors:

- Green: success / positive
- Red: errors / negative / delete
- Orange: warning

No blue.

Avoid:

- Gradients
- Glassmorphism
- Neumorphism
- Shadows
- Rounded corners
- Animated backgrounds
- Decorative illustrations

Spacing should be generous.

Typography should be readable.

---

# 5.13 Accessibility

The application should remain usable for everyone.

Requirements:

- Readable font sizes
- High color contrast
- Large touch targets
- Keyboard support where practical
- Semantic HTML
- Visible focus states
- Screen reader friendly labels where applicable

Accessibility is not optional.

---

# 5.14 Scalability

The architecture should comfortably support:

- 1000+ Foods
- 10+ Years of History
- Thousands of Daily Logs

Future modules should not require rewriting existing ones.

---

# 5.15 Product Quality Standards

Every completed feature must satisfy:

Functional — Works correctly.

Reliable — Produces consistent results.

Reusable — Can be reused elsewhere.

Typed — No loose typing.

Maintainable — Easy to understand.

Responsive — Works on phones first.

Accessible — Usable by all users.

Performant — No noticeable lag.

---

# 5.16 Definition of Ready

A feature is ready to be implemented when:

- Requirements are clear.
- UI is defined.
- Data model exists.
- Dependencies are available.
- Architecture supports it.
- No assumptions remain.

---

# 5.17 Definition of Done

A feature is complete only if:

✓ TypeScript passes

✓ Build succeeds

✓ No console errors

✓ Responsive

✓ Mobile tested

✓ Strong typing

✓ No duplicated logic

✓ Reusable components

✓ Matches GTrak design language

✓ Code reviewed

Anything failing one or more of the above is considered incomplete.

---

# 5.18 Product Success Statement

GTrak should feel like a premium native application despite being a web application.

The user should experience:

- Fast interactions.
- Reliable data.
- Simple workflows.
- Professional interface.
- Accurate nutrition.
- Long-term maintainability.

Every future feature should strengthen these principles rather than compromise them.

---

# 6. Future Scope & Product Evolution

This section outlines features that are intentionally excluded from the MVP but have been considered during the architectural design.

---

# 6.1 Guiding Principle

Future features should extend the existing architecture rather than replace it.

---

# 6.2 Phase 2 Features

## Favorite Foods

Users can mark foods as favorites.

Favorites should appear before search results and in a dedicated section of the Food Picker.

---

## Recent Foods

Display foods recently consumed by the user.

This reduces search time for frequently repeated meals.

---

## Meal Templates

Users can save an entire meal as a reusable template.

---

## Copy Previous Day

Allow users to duplicate yesterday's meals into today.

---

## Duplicate Meal

Allow users to duplicate one meal into another.

---

# 6.3 Nutrition Enhancements

Future nutrition improvements include:

- Micronutrients (sodium, potassium, calcium, iron, magnesium, zinc, vitamins)

The nutrition engine should be designed to support these without architectural changes.

---

# 6.4 Advanced Analytics

Future analytics may include:

- Weekly averages
- Monthly averages
- Nutrition consistency
- Protein distribution
- Calorie trends
- Weight trends
- Workout frequency
- Water consistency
- Most consumed foods
- Consistency score

---

# 6.5 Food Database Expansion

The initial database focuses on commonly consumed foods.

Future versions should support:

- Regional Indian foods
- International foods
- Packaged foods
- Restaurant meals
- Branded products
- Homemade recipes
- Barcode-based products

---

# 6.6 Custom Recipes

Users should eventually create recipes composed of multiple foods.

The recipe should automatically calculate nutrition from its ingredients.

---

# 6.7 PWA Enhancements

Future releases should support:

- Offline installation
- Application updates
- App shortcuts
- Home screen installation
- Offline assets

---

# 6.8 Notifications

Optional reminders.

Examples:

- Meal reminder
- Water reminder
- Workout reminder
- Weight reminder

Notifications must always be optional.

---

# 6.9 Import & Export

Support exporting:

- JSON (primary)
- CSV (selected datasets)

Future support:

- PDF summaries
- Nutrition reports
- Backup archives

---

# 6.10 AI Features (Future)

Artificial Intelligence is intentionally excluded from the MVP.

Potential future features:

- Meal suggestions
- Nutrition recommendations
- Weekly summaries
- Natural language food logging
- Recipe generation

These should remain optional and must never replace manual tracking.

---

# 6.11 Cloud Sync (Optional)

Cloud synchronization should always be explicit and opt-in.

The app already stores data in Firestore; future sync should target:

- Google Drive
- Dropbox
- Personal cloud storage

---

# 6.12 Integrations

Potential future integrations:

- Google Fit
- Apple Health
- Samsung Health
- Garmin
- Fitbit

These integrations should remain isolated modules.

---

# 6.13 Long-Term Vision

GTrak aims to become a complete personal fitness operating system.

The long-term vision includes:

- Nutrition Tracking
- Workout Tracking
- Body Progress
- Habit Tracking
- Recovery Tracking
- Sleep Tracking
- Analytics
- Custom Reports
- Personal Insights

While expanding, the application must continue to uphold its original principles:

- Fast
- Private
- Lightweight
- Accurate
- Mobile-first
- User-owned data

No future feature should compromise these principles.

---

## PRD Completion Checklist

The Product Requirements Document now defines:

- Product Vision
- Product Objectives
- User Experience
- Core Features
- Product Rules
- Future Roadmap

This document defines **what GTrak should be**.

Technical implementation details are intentionally excluded and are documented separately in **ARCHITECTURE.md**.

---

**End of PRD**
