import { type ReactNode } from 'react'
import { cn } from '@/lib/utils/cn'

type AppShellProps = {
  header?: ReactNode
  children: ReactNode
  bottomNavigation?: ReactNode
  className?: string
}

export function AppShell({ header, children, bottomNavigation, className }: AppShellProps) {
  return (
    <div className={cn('min-h-screen bg-slate-50 text-slate-950 dark:bg-[#000] dark:text-[#FDFDFD]', className)}>
      {header ? (
        <div className="border-b border-slate-200 bg-white dark:border-[#2D2D2D] dark:bg-[#000]">
          <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
            {header}
          </div>
        </div>
      ) : null}
      <div className="py-6 pb-24 sm:py-8 sm:pb-28">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">{children}</div>
      </div>
      {bottomNavigation ? (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white dark:border-[#2D2D2D] dark:bg-black px-4 py-2 sm:hidden">
          {bottomNavigation}
        </div>
      ) : null}
    </div>
  )
}
