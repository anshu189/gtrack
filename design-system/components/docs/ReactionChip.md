# ReactionChip

Toggleable reaction pill with a count, used under feed posts.

- **Consumer provides:** `emoji` (icon name: `flame`, `sparkle`), `count` (total including the viewer's own reaction), `defaultSelected` or controlled `selected` + `onChange`, `label`.
- Selected = 1.5px `ink` outline on white; unselected = `surface-2` fill.
- The source uses emoji glyphs for reactions; this system substitutes icons (see Iconography).
