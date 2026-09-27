import type { ReactNode } from 'react'
import { cn } from '@/lib/utils/cn'

/**
 * Tab-root frame.
 *
 * Intentional addition to Gtrak DS: the DS specifies `OnboardingLayout` but no
 * frame for its tab-root screens (Home, Progress, Settings), even though it
 * measures every part of one. This assembles those measured parts.
 *
 * The DS is measured at 393x852pt only. On a wider screen the app holds a
 * centred column rather than stretching, so every measured value — the 30pt
 * Home gutter, the 88pt bar, the 58pt CTA — stays exactly as specified.
 */
const COLUMN = 'mx-auto w-full max-w-[480px]'

interface AppShellProps {
  header?: ReactNode
  children: ReactNode
  tabBar?: ReactNode
  className?: string
}

export function AppShell({ header, children, tabBar, className }: AppShellProps) {
  return (
    <div className={cn('min-h-screen bg-canvas text-black', className)}>
      {header && (
        <header className="sticky top-0 z-30 bg-canvas">
          <div className={cn(COLUMN, 'px-[30px] pt-6 pb-4')}>{header}</div>
        </header>
      )}

      {/* Bottom padding clears the 88px bar plus the home indicator. */}
      <main className={cn(COLUMN, 'px-[30px] pb-[120px]')}>{children}</main>

      {tabBar && (
        <div className="fixed inset-x-0 bottom-0 z-40 bg-surface shadow-[0_-1px_0_var(--line)]">
          <div className={COLUMN}>{tabBar}</div>
        </div>
      )}
    </div>
  )
}
