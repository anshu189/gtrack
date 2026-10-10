import { cn } from '@/lib/utils/cn'
import { Icon, type IconName } from './Icon'

/**
 * Gtrak DS macro readouts — components/docs/MacroTile.md, MacroCard.md.
 *
 * MACROS is the DS's macro lookup: label, icon and colour in one place so a
 * macro never gets the wrong colour or an unlabelled swatch.
 *
 * MacroTile   compact readout — tinted icon disc, label, value. Three across
 *             with 12px gaps, always Protein then Carbs then Fats.
 * MacroInline dense one-line form for list rows, where three tiles would not
 *             fit. Same icons and colours, caption type.
 *
 * DESIGN.md §3: colour is never the only signal — both forms print the label
 * (MacroTile) or the unit (MacroInline) beside the figure.
 */
export type MacroKey = 'protein' | 'carbs' | 'fat'

export const MACROS: Record<MacroKey, { label: string; icon: IconName; text: string; stroke: string }> = {
  protein: { label: 'Protein', icon: 'protein', text: 'text-protein', stroke: 'var(--protein)' },
  carbs: { label: 'Carbs', icon: 'carbs', text: 'text-carbs', stroke: 'var(--carbs)' },
  fat: { label: 'Fats', icon: 'fat', text: 'text-fat', stroke: 'var(--fat)' },
}

/** DS order. Never reorder — Protein, Carbs, Fats is a rule, not a preference. */
export const MACRO_ORDER: MacroKey[] = ['protein', 'carbs', 'fat']

interface MacroTileProps {
  macro: MacroKey
  /** Printed as given, including the unit: "8g". */
  value: string
  className?: string
}

export const MacroTile = ({ macro, value, className }: MacroTileProps) => {
  const m = MACROS[macro]
  return (
    <div
      className={cn(
        'flex min-w-0 flex-col gap-1 rounded-md border border-line bg-surface px-3 py-2.5',
        className,
      )}
    >
      <span className="flex items-center gap-1.5 caption text-ink-2">
        <span className="inline-grid size-5 shrink-0 place-items-center rounded-pill bg-surface-2">
          <Icon name={m.icon} size={12} className={m.text} />
        </span>
        {m.label}
      </span>
      <span className="headline truncate text-black">{value}</span>
    </div>
  )
}

interface MacroTilesProps {
  protein: string
  carbs: string
  fat: string
  className?: string
}

/** The DS layout: three tiles across, 12px apart, in macro order. */
export const MacroTiles = ({ protein, carbs, fat, className }: MacroTilesProps) => {
  const values: Record<MacroKey, string> = { protein, carbs, fat }
  return (
    <div className={cn('grid grid-cols-3 gap-3', className)}>
      {MACRO_ORDER.map((key) => (
        <MacroTile key={key} macro={key} value={values[key]} />
      ))}
    </div>
  )
}

interface MacroInlineProps {
  protein: string
  carbs: string
  fat: string
  /** Icon size; the DS uses 13 inside a FoodLogCard. */
  size?: number
  className?: string
}

export const MacroInline = ({ protein, carbs, fat, size = 13, className }: MacroInlineProps) => {
  const values: Record<MacroKey, string> = { protein, carbs, fat }
  return (
    <span className={cn('flex flex-wrap items-center gap-x-3 gap-y-1 caption text-ink-2', className)}>
      {MACRO_ORDER.map((key) => (
        <span key={key} className="inline-flex items-center gap-1">
          <Icon name={MACROS[key].icon} size={size} className={MACROS[key].text} title={MACROS[key].label} />
          {values[key]}
        </span>
      ))}
    </span>
  )
}
