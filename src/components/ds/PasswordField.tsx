import * as React from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { TextField } from './TextField'
import { FOCUS } from './primitives'
import { cn } from '@/lib/utils/cn'

type PasswordFieldProps = Omit<
  React.ComponentProps<typeof TextField>,
  'type' | 'trailing'
>

/**
 * Password input with a reveal toggle.
 *
 * Intentional addition to Gtrak DS: the DS TextField documents `password` as a
 * type but has no reveal control, and typing a password blind into a field that
 * also enforces a length rule is needlessly hostile.
 *
 * The toggle is a real button with an accessible name that changes with state,
 * so a screen reader announces what it will do rather than just "eye".
 */
export const PasswordField = React.forwardRef<HTMLInputElement, PasswordFieldProps>(
  (props, ref) => {
    const [visible, setVisible] = React.useState(false)

    return (
      <TextField
        ref={ref}
        type={visible ? 'text' : 'password'}
        trailing={
          <button
            type="button"
            onClick={() => setVisible((v) => !v)}
            aria-label={visible ? 'Hide password' : 'Show password'}
            aria-pressed={visible}
            className={cn(
              'grid size-8 shrink-0 cursor-pointer place-items-center rounded-pill',
              'text-ink-3 transition-colors hover:bg-fill-subtle hover:text-black',
              FOCUS,
            )}
          >
            {visible ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
          </button>
        }
        {...props}
      />
    )
  },
)

PasswordField.displayName = 'PasswordField'
