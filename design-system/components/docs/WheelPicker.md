# WheelPicker

iOS-style 3D wheel for height, weight, time and birthday. Items sit on a rotating cylinder (20 slots, 18° apart, 30px rows); the centre row is shown through a crisp "lens" on a `fill-subtle` pill, and the top/bottom 20% fade out.

- **Motion (matches @ncdai/react-wheel-picker exactly, MIT):** drag follows the pointer 1:1; on release the last two pointer samples give a velocity (capped at 30 rows/s) that decelerates at 30 rows/s² and lands on the nearest row with an ease-out-cubic curve. Past either end a finite list drags at 30% and springs back. Mouse wheel moves one row per 100 ms; a click moves to the tapped row; keys ↑/↓, Home/End and type-ahead animate the same way (duration √(rows ÷ 5) s).
- **Consumer provides:** `items` (strings) or `options` (`{value, label, textValue?, disabled?}`), `value` + `onChange` (or `defaultValue`), `label`, optional `infinite`, `width` (fixed column width), `itemHeight` (30), `visibleCount` (20, multiple of 4), `dragSensitivity` (3), `scrollSensitivity` (5).
- Put columns that belong together in a `WheelPickerGroup` — it holds the shared 3D stage and lets ←/→ move focus between columns.
- Use `infinite` for cyclic values (hours, minutes); keep finite for weights and heights.
