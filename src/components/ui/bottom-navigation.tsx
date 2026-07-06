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
      <ul className="flex items-center justify-between gap-2">
        {items.map((item) => {
          const Icon = item.icon
          return (
            <li key={item.label} className="flex-1">
              <button
                type="button"
                onClick={item.onClick}
                className={cn(
                  'w-full rounded-2xl border px-3 py-2 text-left transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2',
                  item.active
                    ? 'border-blue-600 bg-blue-50 text-blue-600'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50',
                )}
              >
                <div className="flex items-center gap-2">
                  <Icon className="h-5 w-5" />
                  <span className="text-sm font-medium">{item.label}</span>
                </div>
              </button>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
