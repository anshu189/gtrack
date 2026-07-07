import { type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

type NavigationItem = {
  label: string
  icon: LucideIcon
  active?: boolean
  onClick?: () => void
}

type BottomNavigationProps = {
  items: NavigationItem[]
}

export function BottomNavigation({ items }: BottomNavigationProps) {
  return (
    <nav aria-label="Bottom navigation">
      <ul className="flex items-center justify-around">
        {items.map((item) => {
          const Icon = item.icon
          return (
            <li key={item.label}>
              <button
                type="button"
                onClick={item.onClick}
                className="flex flex-col items-center gap-1"
              >
                <div
                  className={cn(
                    'flex h-9 w-9 items-center justify-center transition-colors',
                    item.active
                      ? 'bg-black text-white'
                      : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700 dark:text-neutral-500 dark:hover:bg-neutral-900 dark:hover:text-white',
                  )}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <span
                  className={cn(
                    'text-[10px] font-medium',
                    item.active
                      ? 'text-black dark:text-white'
                      : 'text-slate-500 dark:text-neutral-500',
                  )}
                >
                  {item.label}
                </span>
              </button>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
