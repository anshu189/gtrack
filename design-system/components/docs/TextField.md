# TextField

Single-line input: 63px tall, `surface-2` fill, 15px radius, 15px text, `ink-3` placeholder, optional inline action pill (Referral Code + Submit).

- **Consumer provides:** native input props, optional `label`, `icon`, `suffix` (unit), `hint`, `error`, `action` (`{label, onClick, disabled}`).
- The inline action is `disabled-2` until there is input, then black.
- Focus: fill turns `surface`, 1px black border. Error: `protein` border plus an ink message with a red dot.
