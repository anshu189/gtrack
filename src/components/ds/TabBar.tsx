import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { FOCUS } from './primitives'

/**
 * Gtrak DS TabBar, `bar` variant — DESIGN.md §7, components/docs/TabBar.md.
 *
 * Intentional adaptation: the DS bar is specified for three tabs plus a FAB
 * (w-[76px] each). Gtrak keeps its five tabs and has no FAB — logging lives in
 * the Meals tab, so a FAB would be a second route to the same action. Every
 * other DS rule holds: 88px white bar, 24px icons, caption labels, black and
 * semibold when active, ink-2 when not. Tabs flex instead of sitting at a fixed
 * 76px so five fit the column. Propose upstream as a `bar-5` variant.
 *
 * Deviation to revisit: the DS calls for a *filled* icon on the active tab.
 * Lucide has no filled variants, so active reads as black + heavier stroke +
 * semibold label. The DS's own icons are acknowledged substitutes, so this is
 * worth settling when real assets arrive.
 */
export interface TabItem {
  label: string
  icon: LucideIcon
  active?: boolean
  onClick?: () => void
}

interface TabBarProps {
  items: TabItem[]
  className?: string
}

export const TabBar = ({ items, className }: TabBarProps) => (
  <nav
    aria-label="Main"
    className={cn('flex h-[88px] items-start gap-2 bg-surface px-6 pt-3', className)}
  >
    {items.map((item) => {
      const Icon = item.icon
      return (
        <button
          key={item.label}
          type="button"
          onClick={item.onClick}
          aria-current={item.active ? 'page' : undefined}
          className={cn(
            'flex flex-1 cursor-pointer flex-col items-center gap-1 rounded-sm py-1 transition-colors',
            'text-[10px] leading-[13px] font-medium',
            item.active ? 'font-semibold text-black' : 'text-ink-2 hover:text-black',
            FOCUS,
          )}
        >
          <Icon size={16} strokeWidth={item.active ? 2.4 : 2} aria-hidden="true" />
          {item.label}
        </button>
      )
    })}
  </nav>
)
