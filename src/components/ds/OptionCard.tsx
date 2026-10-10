import type { ReactNode } from 'react'
import { cn } from '@/lib/utils/cn'
import { FOCUS, PRESS } from './primitives'
import { Icon, type IconName } from './Icon'

/**
 * Gtrak DS OptionCard / OptionGroup — components/docs/OptionCard.md,
 * OptionGroup.md.
 *
 * One selectable card: 69pt for a bare label (centred), 90pt once it carries a
 * description (left-aligned), 15pt radius. Unselected is `surface-2`; selected
 * is solid black with white text. The group is a real radiogroup — arrow keys
 * move the selection and only the selected card is in the tab order.
 */
export interface OptionItem<T extends string = string> {
  value: T
  label: string
  description?: string
  icon?: IconName
  iconNode?: ReactNode
}

interface OptionCardProps {
  label: string
  description?: string
  icon?: IconName
  iconNode?: ReactNode
  selected?: boolean
  onClick?: () => void
  tabIndex?: number
  className?: string
}

export const OptionCard = ({
  label,
  description,
  icon,
  iconNode,
  selected,
  onClick,
  tabIndex,
  className,
}: OptionCardProps) => {
  const hasIcon = Boolean(icon || iconNode)
  return (
    <button
      type="button"
      role="radio"
      aria-checked={!!selected}
      onClick={onClick}
      tabIndex={tabIndex}
      className={cn(
        'flex w-full cursor-pointer items-center gap-3 rounded-md px-4 text-left transition-colors duration-150',
        description ? 'min-h-[90px]' : 'min-h-[69px]',
        hasIcon ? 'justify-start' : 'justify-center',
        selected ? 'bg-black text-on-ink' : 'bg-surface-2 text-black hover:bg-fill-subtle',
        PRESS,
        FOCUS,
        className,
      )}
    >
      {hasIcon && (
        <span className="grid size-9 shrink-0 place-items-center rounded-pill bg-surface text-black">
          {iconNode ?? (icon && <Icon name={icon} size={18} />)}
        </span>
      )}
      <span className="flex min-w-0 flex-col gap-0.5">
        <span className="option">{label}</span>
        {description && (
          <span className={cn('footnote', selected ? 'text-on-ink' : 'text-ink-2')}>{description}</span>
        )}
      </span>
    </button>
  )
}

interface OptionGroupProps<T extends string> {
  options: OptionItem<T>[]
  value: T | null
  onChange: (value: T) => void
  /** Accessible name for the radiogroup. */
  label: string
  className?: string
}

export function OptionGroup<T extends string>({
  options,
  value,
  onChange,
  label,
  className,
}: OptionGroupProps<T>) {
  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const i = options.findIndex((o) => o.value === value)
    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
      e.preventDefault()
      onChange(options[(i + 1) % options.length].value)
    }
    if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
      e.preventDefault()
      onChange(options[(i - 1 + options.length) % options.length].value)
    }
  }

  return (
    <div role="radiogroup" aria-label={label} onKeyDown={onKeyDown} className={cn('flex flex-col gap-3', className)}>
      {options.map((o, i) => (
        <OptionCard
          key={o.value}
          label={o.label}
          description={o.description}
          icon={o.icon}
          iconNode={o.iconNode}
          selected={value === o.value}
          onClick={() => onChange(o.value)}
          tabIndex={value === o.value || (value == null && i === 0) ? 0 : -1}
        />
      ))}
    </div>
  )
}
