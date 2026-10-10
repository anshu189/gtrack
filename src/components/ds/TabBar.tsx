import { cn } from '@/lib/utils/cn'
import { FOCUS } from './primitives'
import { Icon, type IconName } from './Icon'

/**
 * Gtrak DS TabBar, `pill` variant — components/docs/TabBar.md.
 *
 * The floating pill from the marketing screens: a 64px white pill on
 * `shadow-float`, each tab a flex cell. Active tab takes a `fill-strong` chip,
 * the filled icon where one exists, and a semibold black label; inactive tabs
 * are `ink-2` and brighten to black on hover.
 *
 * Intentional adaptation: the DS pill carries four tabs plus a 64px FAB.
 * Gtrak has five tabs and no FAB — logging lives in the Meals tab, so a FAB
 * would be a second route to the same action. Labels are short nouns so five
 * cells still fit the 393pt column at the DS caption size. Propose upstream as
 * a `pill-5` variant.
 */
export interface TabItem {
  label: string
  icon: IconName
  /** Filled counterpart shown when the tab is active, where the set has one. */
  activeIcon?: IconName
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
    className={cn('flex h-16 items-center gap-1 rounded-pill bg-surface p-1.5 shadow-float', className)}
  >
    {items.map((item) => (
      <button
        key={item.label}
        type="button"
        onClick={item.onClick}
        aria-current={item.active ? 'page' : undefined}
        className={cn(
          'flex h-full min-w-0 flex-1 cursor-pointer flex-col items-center justify-center gap-0.5',
          'rounded-pill caption whitespace-nowrap transition-colors',
          item.active ? 'bg-fill-strong font-semibold text-black' : 'text-ink-2 hover:text-black',
          FOCUS,
        )}
      >
        <Icon name={item.active && item.activeIcon ? item.activeIcon : item.icon} size={22} />
        {item.label}
      </button>
    ))}
  </nav>
)
