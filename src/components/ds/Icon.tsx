import { cn } from '@/lib/utils/cn'

/**
 * Gtrak DS Icon — components/docs/Icon.md.
 *
 * The DS set: hand-drawn 24x24 glyphs, 2px round stroke (some filled),
 * `currentColor`. Ported verbatim from the design system's `icons.jsx` so the
 * path data stays identical — when licensed originals replace the substitutes
 * upstream, only the `d` arrays change here.
 *
 * Marked "Gtrak app additions": intentional additions to Gtrak DS. The DS set
 * covers the Cal AI reference screens, which have no utensil, clock, scale,
 * ruler or password-reveal glyph. Each addition is drawn to the same recipe —
 * 24x24 box, 2px round caps and joins, currentColor — so the set stays
 * coherent. Propose upstream.
 */
interface IconDef {
  /** Filled rather than stroked. */
  fill?: boolean
  d: string[]
}

export const ICONS = {
  /* --- Gtrak DS set ---------------------------------------------------- */
  flame: { fill: true, d: ['M12.6 2.2c.5 3-1.2 4.8-2.8 6.5C8.3 10.3 6.5 12.2 6.5 15.2A5.5 5.5 0 0 0 12 20.8a5.5 5.5 0 0 0 5.5-5.6c0-2.3-1-4.2-2.4-5.6-.3 1.3-1 2.3-2 2.7.5-3.6-.1-7-.5-9.3z'] },
  protein: { fill: true, d: ['M15.9 3.1a4.9 4.9 0 0 1 .9 7.7l-2.6 2.6c-.9.9-2.3 1.1-3.4.5l-2.6 2.6a2 2 0 1 1-2.6 2.6 2 2 0 1 1 2.6-2.6l2.6-2.6c-.6-1.1-.4-2.5.5-3.4l2.6-2.6a4.9 4.9 0 0 1 2-1.2z'] },
  carbs: { d: ['M12 21V9', 'M12 13c-2.5 0-4-1.6-4-4 2.5 0 4 1.6 4 4z', 'M12 13c2.5 0 4-1.6 4-4-2.5 0-4 1.6-4 4z', 'M12 8.5c-2 0-3.2-1.3-3.2-3.3 2 0 3.2 1.3 3.2 3.3z', 'M12 8.5c2 0 3.2-1.3 3.2-3.3-2 0-3.2 1.3-3.2 3.3z', 'M12 17.5c-2.5 0-4-1.6-4-4 2.5 0 4 1.6 4 4z', 'M12 17.5c2.5 0 4-1.6 4-4-2.5 0-4 1.6-4 4z'] },
  fat: { fill: true, d: ['M12 2.8s6.2 6.6 6.2 11.4a6.2 6.2 0 0 1-12.4 0C5.8 9.4 12 2.8 12 2.8z'] },
  home: { d: ['M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-4.5v-6h-5v6H5a1 1 0 0 1-1-1z'] },
  'home-fill': { fill: true, d: ['M11.4 3.5a1 1 0 0 1 1.2 0l8 6.3c.3.2.4.5.4.8V20a1.5 1.5 0 0 1-1.5 1.5H15v-6.2H9v6.2H4.5A1.5 1.5 0 0 1 3 20v-9.4c0-.3.1-.6.4-.8z'] },
  progress: { d: ['M5 20v-6', 'M12 20V9', 'M19 20V4'] },
  groups: { d: ['M9 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z', 'M2.5 20c.6-3.2 3.2-5.5 6.5-5.5s5.9 2.3 6.5 5.5', 'M16 4.3a3.5 3.5 0 0 1 0 6.4', 'M18 14.8c1.9.8 3.1 2.6 3.5 5.2'] },
  plus: { d: ['M12 5v14', 'M5 12h14'] },
  minus: { d: ['M5 12h14'] },
  'arrow-left': { d: ['M19 12H5', 'M11 6l-6 6 6 6'] },
  'arrow-right': { d: ['M5 12h14', 'M13 6l6 6-6 6'] },
  'arrow-up': { d: ['M12 19V5', 'M6 11l6-6 6 6'] },
  share: { d: ['M12 3v12', 'M8 7l4-4 4 4', 'M6 11H5a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-8a1 1 0 0 0-1-1h-1'] },
  more: { fill: true, d: ['M6 13.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z', 'M12 13.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z', 'M18 13.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z'] },
  bookmark: { d: ['M6 4h12v17l-6-4-6 4z'] },
  sparkle: { fill: true, d: ['M12 2.5c.5 4.6 2.9 7 7.5 7.5v.5c-4.6.5-7 2.9-7.5 7.5h-.5c-.5-4.6-2.9-7-7.5-7.5V10c4.6-.5 7-2.9 7.5-7.5z'] },
  close: { d: ['M6 6l12 12', 'M18 6 6 18'] },
  help: { d: ['M9.2 9a2.9 2.9 0 1 1 4 2.7c-.8.4-1.2 1-1.2 1.8v.5', 'M12 17.5v.01'] },
  'flash-off': { d: ['M13 3 6 13h5l-1 8 7-10h-5l1-8z', 'M4 4l16 16'] },
  image: { d: ['M4 5h16v14H4z', 'M4 16l4.5-4.5 3.5 3.5 2.5-2.5L20 18', 'M15.5 9.5a1.5 1.5 0 1 0 0-.01'] },
  scan: { d: ['M4 8V5a1 1 0 0 1 1-1h3', 'M16 4h3a1 1 0 0 1 1 1v3', 'M20 16v3a1 1 0 0 1-1 1h-3', 'M8 20H5a1 1 0 0 1-1-1v-3'] },
  barcode: { d: ['M4 6v12', 'M7 6v12', 'M10 6v12', 'M12.5 6v12', 'M16 6v12', 'M18 6v12', 'M20 6v12'] },
  label: { d: ['M6 3h12v18H6z', 'M9 7h6', 'M9 11h6', 'M9 15h4'] },
  check: { d: ['M5 12.5l4.5 4.5L19 7.5'] },
  flag: { d: ['M5 21V4', 'M5 4h11l-2 4 2 4H5'] },
  'chevron-down': { d: ['M6 9l6 6 6-6'] },
  sliders: { d: ['M6 4v16', 'M12 4v16', 'M18 4v16', 'M4 9h4', 'M10 15h4', 'M16 7h4'] },
  react: { d: ['M12 21a9 9 0 1 1 0-18 9 9 0 0 1 0 18z', 'M8.5 14.5c.9 1.2 2.1 1.8 3.5 1.8s2.6-.6 3.5-1.8', 'M9 9.5v.5', 'M15 9.5v.5'] },
  comment: { d: ['M4 5h16v11H9l-5 4z', 'M8 9h8', 'M8 12h5'] },
  settings: { d: ['M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z', 'M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z'] },
  pencil: { fill: true, d: ['M15.6 4.4a2 2 0 0 1 2.8 0l1.2 1.2a2 2 0 0 1 0 2.8L9 19l-4.6 1.1a.4.4 0 0 1-.5-.5L5 15z'] },
  bell: { d: ['M6 16V11a6 6 0 1 1 12 0v5l1.5 2h-15z', 'M10 20.5a2 2 0 0 0 4 0'] },
  star: { fill: true, d: ['M12 2.8l2.8 5.9 6.4.8-4.7 4.4 1.2 6.4L12 17.2l-5.7 3.1 1.2-6.4-4.7-4.4 6.4-.8z'] },
  'check-circle': { fill: true, d: ['M12 2a10 10 0 1 1 0 20 10 10 0 0 1 0-20zm4.6 6.6a1 1 0 0 0-1.4 0L10.5 13.3l-1.8-1.8a1 1 0 1 0-1.4 1.4l2.5 2.5a1 1 0 0 0 1.4 0l5.4-5.4a1 1 0 0 0 0-1.4z'] },
  'speed-1': { d: ['M10 7l5 5-5 5'] },
  'speed-2': { d: ['M6 7l5 5-5 5', 'M13 7l5 5-5 5'] },
  'speed-3': { d: ['M3 7l5 5-5 5', 'M10 7l5 5-5 5', 'M17 7l5 5-5 5'] },
  dumbbell: { d: ['M6.5 6.5v11', 'M17.5 6.5v11', 'M3.5 9v6', 'M20.5 9v6', 'M6.5 12h11'] },
  target: { d: ['M12 21a9 9 0 1 1 0-18 9 9 0 0 1 0 18z', 'M12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8z', 'M12 12.01V12'] },
  heart: { fill: true, d: ['M12 20.5s-8-4.6-8-10.4A4.6 4.6 0 0 1 12 7a4.6 4.6 0 0 1 8 3.1c0 5.8-8 10.4-8 10.4z'] },
  'thumb-up': { d: ['M7 11v9H4v-9z', 'M7 11l4-7a2 2 0 0 1 2 2v4h5.5a2 2 0 0 1 2 2.3l-1.2 6A2 2 0 0 1 17.3 20H7'] },
  'thumb-down': { d: ['M7 13V4H4v9z', 'M7 13l4 7a2 2 0 0 0 2-2v-4h5.5a2 2 0 0 0 2-2.3l-1.2-6A2 2 0 0 0 17.3 4H7'] },

  /* --- Gtrak app additions --------------------------------------------- */
  /** Meals tab. */
  utensils: { d: ['M6 3v7a2.5 2.5 0 0 0 5 0V3', 'M8.5 10v11', 'M17 3c-1.7 1.4-2.5 3.3-2.5 5.5 0 1.7.8 2.8 2.5 3V21', 'M17 3v8.5'] },
  /** History tab. */
  clock: { d: ['M12 21a9 9 0 1 1 0-18 9 9 0 0 1 0 18z', 'M12 7v5.2l3.3 2'] },
  'chevron-right': { d: ['M9.5 6l6 6-6 6'] },
  'chevron-left': { d: ['M14.5 6l-6 6 6 6'] },
  'chevron-up': { d: ['M6 15l6-6 6 6'] },
  /** Password reveal. */
  eye: { d: ['M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z', 'M12 15a3 3 0 1 1 0-6 3 3 0 0 1 0 6z'] },
  'eye-off': { d: ['M4 4l16 16', 'M9.9 5.8A9.3 9.3 0 0 1 12 5.5c6 0 9.5 6.5 9.5 6.5a17 17 0 0 1-3 3.9', 'M6.6 7.9A17 17 0 0 0 2.5 12S6 18.5 12 18.5c1.3 0 2.5-.3 3.5-.8', 'M10 10a3 3 0 0 0 4 4'] },
  calendar: { d: ['M4 6.5h16V20a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1z', 'M8 3.5v4', 'M16 3.5v4', 'M4 11h16'] },
  /** Water. The `fat` droplet is filled and carries the macro colour. */
  droplet: { d: ['M12 3.2s6 6.4 6 11a6 6 0 0 1-12 0c0-4.6 6-11 6-11z'] },
  trash: { d: ['M4.5 6.5h15', 'M9.5 6.5V4h5v2.5', 'M6.5 6.5 7.4 20a1 1 0 0 0 1 1h7.2a1 1 0 0 0 1-1l.9-13.5', 'M10.5 10.5v6', 'M13.5 10.5v6'] },
  note: { d: ['M6 3h9l3 3v15H6z', 'M14.5 3v4h4', 'M9 12h6', 'M9 16h4'] },
  /** Weight. */
  scale: { d: ['M4 5.5h16a1 1 0 0 1 1 1V19a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6.5a1 1 0 0 1 1-1z', 'M8 5.5V9h8V5.5', 'M12 15.5l3-3.5'] },
  /** Height. */
  ruler: { d: ['M12 3v18', 'M8.5 4.5h7', 'M8.5 19.5h7', 'M9.5 8h2.5', 'M9.5 12h2.5', 'M9.5 16h2.5'] },
  user: { d: ['M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8z', 'M4.5 20.5c.6-3.9 3.7-6.5 7.5-6.5s6.9 2.6 7.5 6.5'] },
  bolt: { fill: true, d: ['M13.6 2.5 5.4 13.2a.5.5 0 0 0 .4.8h4.3l-.9 7.3a.4.4 0 0 0 .7.3l8.2-10.7a.5.5 0 0 0-.4-.8h-4.3l.9-7.3a.4.4 0 0 0-.7-.3z'] },
  search: { d: ['M11 18.5a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15z', 'M16.5 16.5 21 21'] },
  download: { d: ['M12 3.5v11', 'M7.5 10.5 12 15l4.5-4.5', 'M4.5 18.5v1a1 1 0 0 0 1 1h13a1 1 0 0 0 1-1v-1'] },
  upload: { d: ['M12 15V4', 'M7.5 8.5 12 4l4.5 4.5', 'M4.5 18.5v1a1 1 0 0 0 1 1h13a1 1 0 0 0 1-1v-1'] },
  logout: { d: ['M14.5 4.5h4a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-4', 'M10 8l-4 4 4 4', 'M6 12h9'] },
} as const satisfies Record<string, IconDef>

export type IconName = keyof typeof ICONS

interface IconProps {
  name: IconName
  /** DS default is 20. */
  size?: number
  className?: string
  /**
   * Gives the glyph an accessible name. Omit it for decorative icons sitting
   * next to their own label — they are hidden from assistive tech instead.
   */
  title?: string
}

export const Icon = ({ name, size = 20, className, title }: IconProps) => {
  const def: IconDef = ICONS[name]
  const stroked = !def.fill

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={cn('shrink-0', className)}
      fill={def.fill ? 'currentColor' : 'none'}
      stroke={stroked ? 'currentColor' : undefined}
      strokeWidth={stroked ? 2 : undefined}
      strokeLinecap={stroked ? 'round' : undefined}
      strokeLinejoin={stroked ? 'round' : undefined}
      role={title ? 'img' : undefined}
      aria-hidden={title ? undefined : true}
      focusable="false"
    >
      {title && <title>{title}</title>}
      {def.d.map((d, i) => (
        <path key={i} d={d} />
      ))}
    </svg>
  )
}
