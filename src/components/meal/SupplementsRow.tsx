import { useEffect, useState } from 'react'
import type { Supplement } from '@/types'
import { useMealStore } from '@/stores/mealStore'
import { useSupplementStore } from '@/stores/supplementStore'
import { Button, FOCUS, Icon } from '@/components/ds'
import { cn } from '@/lib/utils/cn'
import { formatCalories } from '@/lib/utils/format'
import { mealTotals } from '@/lib/utils/nutrition'
import { quantitiesFrom, supplementLogId } from '@/lib/utils/supplements'
import { SupplementList } from './SupplementList'
import { SupplementForm, type SupplementDraft } from './SupplementForm'

/**
 * The pinned Supplements row at the foot of a day's meals. It looks like a
 * meal row, opens to one counter per supplement, and every tap saves — the
 * same as every other tracker on Home.
 *
 * `manage` (Meals tab) adds Edit, Remove and Add supplement. Changes there
 * only touch this user's own list.
 *
 * Intentional addition to Gtrak DS: an expandable list row. The DS has rows
 * and the Stepper but nothing that folds a group of counters away.
 */
interface SupplementsRowProps {
  date: string
  manage?: boolean
  defaultOpen?: boolean
}

export const SupplementsRow = ({ date, manage = false, defaultOpen = true }: SupplementsRowProps) => {
  const supplements = useSupplementStore((s) => s.supplements)
  const loaded = useSupplementStore((s) => s.loaded)
  const load = useSupplementStore((s) => s.load)
  const createSupplement = useSupplementStore((s) => s.create)
  const updateSupplement = useSupplementStore((s) => s.update)
  const removeSupplement = useSupplementStore((s) => s.remove)
  const log = useMealStore((s) => s.meals.find((m) => m.id === supplementLogId(date)))
  const setQuantity = useMealStore((s) => s.setSupplementQuantity)

  const [open, setOpen] = useState(defaultOpen)
  const [editing, setEditing] = useState<Supplement | 'new' | null>(null)
  const [removing, setRemoving] = useState<Supplement | null>(null)

  useEffect(() => {
    if (!loaded) load()
  }, [loaded, load])

  const quantities = quantitiesFrom(log)
  const known = new Set(supplements.map((s) => s.id))
  const orphans = (log?.items ?? []).filter((it) => !known.has(it.foodId))
  const totals = mealTotals(log?.items)

  const handleChange = (supplement: Supplement, quantity: number) => {
    setQuantity(date, supplements, supplement.id, quantity)
  }

  const handleSave = async (draft: SupplementDraft) => {
    if (editing === 'new') {
      await createSupplement(draft)
    } else if (editing) {
      await updateSupplement(editing.id, draft)
      // The day on screen picks up the new macros straight away; days before
      // it keep the values they were logged with.
      const q = quantities[editing.id] ?? 0
      if (q > 0) {
        const next = useSupplementStore.getState().supplements
        await setQuantity(date, next, editing.id, q)
      }
    }
    setEditing(null)
  }

  const handleRemove = async () => {
    if (!removing) return
    await removeSupplement(removing.id)
    setRemoving(null)
  }

  const summary = totals.calories > 0 || (log?.items?.length ?? 0) > 0
    ? `${formatCalories(totals.calories)} kcal`
    : 'Not taken'

  return (
    <div className="overflow-hidden rounded-md bg-surface-2">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className={cn(
          'flex w-full cursor-pointer items-center justify-between gap-2 rounded-md px-3 py-2.5 text-left transition-colors hover:bg-fill-subtle',
          FOCUS,
        )}
      >
        <span className="min-w-0 truncate footnote text-black">Supplements</span>
        <span className="flex shrink-0 items-center gap-2 text-ink-2">
          <span className="inline-flex items-center gap-1 label-text">
            {summary !== 'Not taken' && <Icon name="flame" size={13} />}
            {summary}
          </span>
          <Icon name={open ? 'chevron-up' : 'chevron-down'} size={16} />
        </span>
      </button>

      {open && (
        <div className="flex flex-col gap-2 border-t border-line p-3">
          {loaded && supplements.length === 0 && orphans.length === 0 && !editing && (
            <p className="footnote text-ink-2">
              {manage
                ? 'Your list is empty. Add what you take and it gets its own counter here.'
                : 'Your list is empty. Add supplements from the Meals tab.'}
            </p>
          )}

          {removing ? (
            <div className="flex flex-col gap-3 rounded-sm bg-surface p-3">
              <p className="footnote text-black">
                Remove {removing.name} from your list? Days you already logged keep it.
              </p>
              <div className="flex items-center gap-2">
                <Button size="sm" className="h-11 min-w-0 flex-1" onClick={handleRemove}>
                  Remove
                </Button>
                <Button variant="secondary" size="sm" className="h-11 min-w-0 flex-1" onClick={() => setRemoving(null)}>
                  Cancel
                </Button>
              </div>
            </div>
          ) : editing ? (
            <SupplementForm
              initial={editing === 'new' ? undefined : editing}
              onSave={handleSave}
              onCancel={() => setEditing(null)}
            />
          ) : (
            <SupplementList
              supplements={supplements}
              quantities={quantities}
              orphans={orphans}
              onChange={handleChange}
              manage={manage ? { onEdit: setEditing, onRemove: setRemoving } : undefined}
            />
          )}

          {manage && !editing && !removing && (
            <Button
              variant="secondary"
              size="sm"
              className="h-11"
              icon={<Icon name="plus" size={16} />}
              onClick={() => setEditing('new')}
            >
              Add supplement
            </Button>
          )}
        </div>
      )}
    </div>
  )
}

export default SupplementsRow
