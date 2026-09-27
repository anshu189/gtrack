import { cn } from '@/lib/utils/cn'
import { FOCUS } from './primitives'

/**
 * Gtrak DS Switch — components/docs/Switch.md.
 * 51x31. Off: `track`. On: `black` (measured on the Imperial/Metric screen).
 */
interface SwitchProps {
  checked: boolean
  onChange: (checked: boolean) => void
  label: string
  className?: string
}

export const Switch = ({ checked, onChange, label, className }: SwitchProps) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    aria-label={label}
    onClick={() => onChange(!checked)}
    className={cn(
      'relative h-[31px] w-[51px] shrink-0 cursor-pointer rounded-pill transition-colors duration-200',
      checked ? 'bg-black' : 'bg-track',
      FOCUS,
      className,
    )}
  >
    <span
      aria-hidden="true"
      className="absolute top-0.5 size-[27px] rounded-pill bg-surface shadow-float transition-[left] duration-200"
      style={{ left: checked ? 22 : 2 }}
    />
  </button>
)

/**
 * Gtrak DS SettingRow — components/docs/SettingRow.md.
 * Label plus Switch on one 56px row; the whole row toggles.
 */
interface SettingRowProps {
  label: string
  description?: string
  checked: boolean
  onChange: (checked: boolean) => void
  className?: string
}

export const SettingRow = ({ label, description, checked, onChange, className }: SettingRowProps) => (
  <div
    role="switch"
    aria-checked={checked}
    aria-label={label}
    tabIndex={0}
    onClick={() => onChange(!checked)}
    onKeyDown={(e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        onChange(!checked)
      }
    }}
    className={cn(
      'flex min-h-[56px] cursor-pointer items-center justify-between gap-4 rounded-md px-4',
      'transition-colors hover:bg-surface-2',
      FOCUS,
      className,
    )}
  >
    <span className="flex flex-col">
      <span className="option text-black">{label}</span>
      {description && <span className="footnote text-ink-2">{description}</span>}
    </span>
    {/* The row owns the click; the switch is presentational here. */}
    <span
      aria-hidden="true"
      className={cn(
        'relative h-[31px] w-[51px] shrink-0 rounded-pill transition-colors duration-200',
        checked ? 'bg-black' : 'bg-track',
      )}
    >
      <span
        className="absolute top-0.5 size-[27px] rounded-pill bg-surface shadow-float transition-[left] duration-200"
        style={{ left: checked ? 22 : 2 }}
      />
    </span>
  </div>
)
