# Button

Pill-shaped action button. Variants: `primary` (ink fill — Continue, Yes/No), `black` (pure black — Get Started, paywall, Sign in with Apple), `outline` (white with a 2px black border — Sign in with Google), `secondary` (light outline — in-sheet actions) and `ghost` (text only, `ink-2`).

- **Consumer provides:** `children` (label), optional `icon` / `iconRight`, `size` (`lg` 58px default, `md` 48px for in-sheet pairs), `block` for full width, `disabled`, and native button props.
- **Use** one full-width `primary` per screen, pinned in a `ContinueBar` 16px from the edges. `disabled` turns it `disabled` grey (#bababc) until the user has answered.
- **States:** hover darkens, press scales to 0.97, `focus-visible` draws `shadow-focus`.
- **Don't** colour buttons with macro or status colours.
- Labels: Title Case or short sentence ("Continue", "Get Started", "Let’s get started!").
