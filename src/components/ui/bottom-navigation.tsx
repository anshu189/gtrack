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
                      ? 'bg-[#1a1d20] text-[#E8F1F6]'
                      : 'text-[#96A0AB] hover:bg-[#1a1d20] hover:text-[#E8F1F6]',
                  )}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <span
                  className={cn(
                    'text-[10px] font-medium',
                    item.active
                      ? 'text-[#E8F1F6]'
                      : 'text-[#96A0AB]',
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
