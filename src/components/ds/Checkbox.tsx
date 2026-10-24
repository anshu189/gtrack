import { useId } from 'react'
import { cn } from '@/lib/utils/cn'
import { FOCUS } from './primitives'
import { Icon } from './Icon'

/**
 * Checkbox with its label.
 *
 * Intentional addition to Gtrak DS: the DS has `Switch` for a setting that
 * takes effect at once and `OptionCard` for picking one of several, but
 * nothing for a small opt-in sitting beside a form field. A 51px switch next
 * to a 13px line of text is the wrong weight entirely.
 *
 * Built from DS atoms: `black` fill when on (the DS's selection colour, as on
 * OptionCard), `line-strong` outline when off, `rounded-xs` and the shared
 * focus ring. Propose upstream as `Checkbox`.
 */
interface CheckboxProps {
  checked: boolean
  onChange: (checked: boolean) => void
  label: string
  className?: string
}

export const Checkbox = ({ checked, onChange, label, className }: CheckboxProps) => {
  const id = useId()
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <button
        type="button"
        role="checkbox"
        id={id}
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn(
          'grid size-[18px] shrink-0 cursor-pointer place-items-center rounded-xs border transition-colors duration-150',
          checked ? 'border-black bg-black text-on-ink' : 'border-line-strong bg-surface hover:border-ink-3',
          FOCUS,
        )}
      >
        {checked && <Icon name="check" size={12} />}
      </button>
      <label htmlFor={id} className="cursor-pointer footnote text-ink-2">
        {label}
      </label>
    </div>
  )
}
