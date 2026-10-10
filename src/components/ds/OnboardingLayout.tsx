import type { ReactNode } from 'react'
import { cn } from '@/lib/utils/cn'
import { Button } from './Button'
import { IconButton } from './IconButton'
import { Icon } from './Icon'
import { FOCUS } from './primitives'

/**
 * Gtrak DS StepHeader / ContinueBar / OnboardingLayout —
 * components/docs/StepHeader.md, ContinueBar.md, OnboardingLayout.md.
 *
 * A full onboarding step: back button and a 3pt progress bar, then the title
 * and subtitle, the question in the middle, and a pinned Continue at the foot.
 *
 * Intentional adaptation: the DS layout is a fixed 393x852 frame, which is how
 * a Figma board is drawn, not how a page behaves. Here it is a real screen —
 * min-h-screen, a centred 480px column to match AppShell, and the question
 * area scrolls if it outgrows the viewport. Every measured value is unchanged.
 */
interface StepHeaderProps {
  step: number
  total: number
  onBack?: () => void
  trailing?: ReactNode
  className?: string
}

export const StepHeader = ({ step, total, onBack, trailing, className }: StepHeaderProps) => {
  const pct = Math.max(0, Math.min(1, step / total))
  return (
    <div className={cn('flex h-10 items-center gap-[26px]', className)}>
      <IconButton icon={<Icon name="arrow-left" />} label="Back" onClick={onBack} disabled={!onBack} />
      <div
        role="progressbar"
        aria-label="Setup progress"
        aria-valuenow={step}
        aria-valuemin={0}
        aria-valuemax={total}
        className="h-[3px] flex-1 overflow-hidden rounded-pill bg-track"
      >
        <div
          className="h-full rounded-pill bg-black transition-[width] duration-500 ease-out"
          style={{ width: `${pct * 100}%` }}
        />
      </div>
      {trailing}
    </div>
  )
}

interface ContinueBarProps {
  label?: string
  disabled?: boolean
  isLoading?: boolean
  onClick?: () => void
  secondary?: string
  onSecondary?: () => void
  className?: string
}

export const ContinueBar = ({
  label = 'Continue',
  disabled,
  isLoading,
  onClick,
  secondary,
  onSecondary,
  className,
}: ContinueBarProps) => (
  <div className={cn('relative bg-canvas px-4 pt-4 pb-3', className)}>
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-x-0 -top-[72px] h-[72px] bg-linear-to-b from-transparent to-canvas"
    />
    <Button block disabled={disabled} isLoading={isLoading} onClick={onClick}>
      {label}
    </Button>
    {secondary && (
      <button
        type="button"
        onClick={onSecondary}
        className={cn('mt-3 block w-full cursor-pointer rounded-sm py-1 text-center btn-label text-ink-2 hover:text-black', FOCUS)}
      >
        {secondary}
      </button>
    )}
  </div>
)

interface OnboardingLayoutProps {
  step: number
  total: number
  title: string
  subtitle?: string
  children: ReactNode
  cta?: string
  ctaDisabled?: boolean
  ctaLoading?: boolean
  onContinue?: () => void
  onBack?: () => void
  secondary?: string
  onSecondary?: () => void
  trailing?: ReactNode
  className?: string
}

export function OnboardingLayout({
  step,
  total,
  title,
  subtitle,
  children,
  cta = 'Continue',
  ctaDisabled,
  ctaLoading,
  onContinue,
  onBack,
  secondary,
  onSecondary,
  trailing,
  className,
}: OnboardingLayoutProps) {
  return (
    <div className={cn('flex min-h-screen flex-col bg-canvas text-black', className)}>
      <div className="mx-auto w-full max-w-[480px] px-4 pt-6">
        <StepHeader step={step} total={total} onBack={onBack} trailing={trailing} />
      </div>

      <div className="mx-auto flex w-full max-w-[480px] flex-1 flex-col px-6 pt-[7px]">
        <h1 className="large-title text-black">{title}</h1>
        {subtitle && <p className="body-text mt-5 max-w-[270px] text-ink-2">{subtitle}</p>}
        <div className="flex flex-1 flex-col justify-center py-8">{children}</div>
      </div>

      <div className="sticky bottom-0 mx-auto w-full max-w-[480px]">
        <ContinueBar
          label={cta}
          disabled={ctaDisabled}
          isLoading={ctaLoading}
          onClick={onContinue}
          secondary={secondary}
          onSecondary={onSecondary}
          className="pb-[34px]"
        />
      </div>
    </div>
  )
}
