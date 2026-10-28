import type { MealItem, Supplement } from '@/types'
import { Icon, IconButton, MacroInline, Stepper } from '@/components/ds'
import { formatCalories, formatNum } from '@/lib/utils/format'
import { mealItemGrams } from '@/lib/utils/nutrition'
import { SUPPLEMENT_UNITS, formatSupplementAmount, perUnitLabel } from '@/lib/utils/supplements'

/**
 * The rows inside the Supplements row: one per supplement, its counter on the
 * right. Without `onChange` it is the read-only record History shows, listing
 * only what was taken.
 *
 * Intentional addition to Gtrak DS: a list row holding the DS Stepper. The DS
 * has the Stepper ("servings counter") but no row that pairs it with a label.
 */
interface SupplementListProps {
  supplements: Supplement[]
  quantities: Record<string, number>
  onChange?: (supplement: Supplement, quantity: number) => void
  /** Logged on this day for a supplement that has since left the row. */
  orphans?: MealItem[]
  /** Meals tab: each row also offers Edit and Remove. */
  manage?: {
    onEdit: (supplement: Supplement) => void
    onRemove: (supplement: Supplement) => void
  }
}

const capitalise = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

function unitWord(s: Supplement) {
  const def = SUPPLEMENT_UNITS.find((u) => u.value === s.unit)
  if (s.unit === 'g') return 'Grams'
  if (s.unit === 'ml') return 'Millilitres'
  return capitalise(def?.plural ?? s.unit)
}

function itemKcal(item: MealItem) {
  return (item.nutrition?.calories ?? 0) * (mealItemGrams(item) / 100)
}

export const SupplementList = ({ supplements, quantities, onChange, orphans = [], manage }: SupplementListProps) => {
  if (!onChange) {
    const taken = supplements.filter((s) => (quantities[s.id] ?? 0) > 0)
    if (taken.length === 0 && orphans.length === 0) {
      return <p className="footnote text-ink-2">No supplements logged.</p>
    }
    return (
      <div className="flex flex-col rounded-sm bg-surface px-3">
        {taken.map((s) => {
          const q = quantities[s.id] ?? 0
          return (
            <div key={s.id} className="flex items-center justify-between gap-3 border-b border-line py-2.5 last:border-b-0">
              <span className="min-w-0 truncate option text-black">{s.name}</span>
              <span className="shrink-0 label-text text-ink-2">
                {formatSupplementAmount(q, s.unit)} · {formatCalories(q * (s.nutrition.calories ?? 0))} kcal
              </span>
            </div>
          )
        })}
        {orphans.map((it) => (
          <div key={it.id} className="flex items-center justify-between gap-3 border-b border-line py-2.5 last:border-b-0">
            <span className="min-w-0 truncate option text-black">{it.name}</span>
            <span className="shrink-0 label-text text-ink-2">
              {formatSupplementAmount(it.quantity, it.unit)} · {formatCalories(itemKcal(it))} kcal
            </span>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      {supplements.map((s) => {
        const q = quantities[s.id] ?? 0
        return (
          <div key={s.id} className="flex flex-col gap-2 rounded-sm bg-surface px-3 py-2.5">
            <div className="flex items-center gap-3">
              <div className="flex min-w-0 flex-1 flex-col">
                <span className="truncate option text-black">{s.name}</span>
                <span className="truncate footnote text-ink-2">
                  {unitWord(s)} · {formatCalories(s.nutrition.calories ?? 0)} kcal each
                </span>
              </div>
              <Stepper
                label={`${s.name}, ${unitWord(s).toLowerCase()}`}
                value={q}
                step={s.step > 0 ? s.step : 1}
                max={999}
                onChange={(next) => onChange(s, next)}
              />
            </div>
            {manage && (
              <div className="flex items-center justify-between gap-2 border-t border-line pt-2">
                <span className="flex min-w-0 flex-col gap-0.5">
                  <span className="caption text-ink-2">
                    {capitalise(perUnitLabel(s.unit))}
                    {s.unit !== 'g' && s.unit !== 'ml' ? ` (${formatNum(s.gramsPerUnit)}g)` : ''}
                  </span>
                  <MacroInline
                    protein={`${formatNum(s.nutrition.protein)}g`}
                    carbs={`${formatNum(s.nutrition.carbs)}g`}
                    fat={`${formatNum(s.nutrition.fat)}g`}
                  />
                </span>
                <span className="flex shrink-0 items-center gap-1">
                  <IconButton
                    variant="ghost"
                    size={36}
                    label={`Edit ${s.name}`}
                    icon={<Icon name="pencil" size={15} />}
                    onClick={() => manage.onEdit(s)}
                  />
                  <IconButton
                    variant="ghost"
                    size={36}
                    label={`Remove ${s.name}`}
                    icon={<Icon name="trash" size={15} />}
                    className="hover:text-protein"
                    onClick={() => manage.onRemove(s)}
                  />
                </span>
              </div>
            )}
          </div>
        )
      })}
      {orphans.map((it) => (
        <div key={it.id} className="flex items-center justify-between gap-3 rounded-sm bg-surface px-3 py-2.5">
          <span className="flex min-w-0 flex-col">
            <span className="truncate option text-black">{it.name}</span>
            <span className="footnote text-ink-2">No longer on your list</span>
          </span>
          <span className="shrink-0 label-text text-ink-2">{formatSupplementAmount(it.quantity, it.unit)}</span>
        </div>
      ))}
    </div>
  )
}

export default SupplementList
