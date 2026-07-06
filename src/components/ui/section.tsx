import { type ReactNode } from 'react'
import { cn } from '@/lib/utils/cn'

type SectionProps = {
  title?: string
  description?: string
  children: ReactNode
  className?: string
}

export function Section({ title, description, children, className }: SectionProps) {
  return (
    <section className={cn('', className)}>
      {(title || description) && (
        <div className="mb-5 space-y-1">
          {title ? <h2 className="text-xl font-semibold text-slate-950">{title}</h2> : null}
          {description ? <p className="text-sm leading-6 text-slate-500">{description}</p> : null}
        </div>
      )}
      {children}
    </section>
  )
}
