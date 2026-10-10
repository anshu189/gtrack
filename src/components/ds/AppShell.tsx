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
 * Home gutter, the 64pt tab pill, the 58pt CTA — stays exactly as specified.
 */
const COLUMN = 'mx-auto w-full max-w-[480px]'

/** Distance from the viewport bottom to the floating tab pill. */
const TAB_BAR_INSET = 18

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

      {/* Bottom padding clears the floating pill plus the home indicator. */}
      <main className={cn(COLUMN, 'px-[30px] pb-[120px]')}>{children}</main>

      {tabBar && (
        <div
          className="fixed inset-x-0 bottom-0 z-40"
          style={{ paddingBottom: TAB_BAR_INSET }}
        >
          {/* The pill floats over the page, so content would otherwise run
              straight into it. A short scrim fades the canvas up behind it. */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 bottom-0 -top-10 bg-linear-to-b from-transparent to-canvas"
          />
          <div className={cn(COLUMN, 'relative px-[30px]')}>{tabBar}</div>
        </div>
      )}
    </div>
  )
}
