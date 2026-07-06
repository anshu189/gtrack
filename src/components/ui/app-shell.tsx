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
    <div className={cn('min-h-screen bg-slate-50 text-slate-950', className)}>
      <div className="border-b border-slate-200 bg-white/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          {header}
        </div>
      </div>
      <div className="pt-6 pb-20">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">{children}</div>
      </div>
      {bottomNavigation ? (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 px-4 py-3 backdrop-blur-sm sm:hidden">
          {bottomNavigation}
        </div>
      ) : null}
    </div>
  )
}
