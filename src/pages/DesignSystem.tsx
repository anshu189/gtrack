import { BarChart3, Grid, Home, Settings2 } from 'lucide-react'
import { Body, Caption, Display, Heading, Subheading } from '@/components/ui/typography'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Section } from '@/components/ui/section'
import { PageContainer } from '@/components/ui/page-container'

const buttonVariants = [
  { label: 'Primary', variant: 'default' as const },
  { label: 'Secondary', variant: 'secondary' as const },
  { label: 'Outline', variant: 'outline' as const },
  { label: 'Ghost', variant: 'ghost' as const },
]

const cards = [
  { title: 'Active data', description: 'A clean summary card for quick metric review.', value: '1,280' },
  { title: 'Engagement', description: 'Minimal style with a professional data-first layout.', value: '82.3%' },
]

export default function DesignSystem() {
  return (
    <PageContainer className="space-y-8">
      <section className="space-y-2">
        <Subheading>Design system</Subheading>
        <Display>GTrak interface tokens and reusable components</Display>
        <Body>
          A lightweight, mobile-first design system built for a calm, data-first experience with crisp spacing,
          thin borders, and blue accents.
        </Body>
      </section>

      <Section title="Theme tokens" description="A shared palette of color, radius, and elevation values for consistent UI." className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-3 rounded-3xl border border-slate-200 bg-slate-50 p-5">
          <Caption>Primary accent</Caption>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-blue-600" />
            <div>
              <p className="text-sm font-semibold text-slate-950">Blue accent</p>
              <p className="text-xs text-slate-500">#2563eb</p>
            </div>
          </div>
        </div>
        <div className="space-y-3 rounded-3xl border border-slate-200 bg-slate-50 p-5">
          <Caption>Surface tokens</Caption>
          <div className="space-y-2">
            <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3">
              <span className="text-sm text-slate-700">Surface</span>
              <span className="text-xs text-slate-500">#ffffff</span>
            </div>
            <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-100 px-4 py-3">
              <span className="text-sm text-slate-700">Muted surface</span>
              <span className="text-xs text-slate-500">#f8fafc</span>
            </div>
          </div>
        </div>
      </Section>

      <Section title="Typography" description="Modular headings and text styles for clear hierarchy.">
        <div className="space-y-5">
          <div>
            <Heading className="mb-2">Heading example</Heading>
            <Body>Readable type scale with strong contrast and careful line spacing.</Body>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-3xl border border-slate-200 bg-white p-5">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Display</p>
              <h1 className="mt-2 text-3xl font-semibold text-slate-950">Key metric</h1>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-white p-5">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Body</p>
              <p className="mt-2 text-sm leading-7 text-slate-700">A modern type system for clean interfaces and readable dashboards.</p>
            </div>
          </div>
        </div>
      </Section>

      <Section title="Buttons" description="Reusable variants for primary actions, secondary controls, and neutral states.">
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          {buttonVariants.map((item) => (
            <Button key={item.variant} variant={item.variant} className="min-w-[10rem]">
              {item.label}
            </Button>
          ))}
        </div>
      </Section>

      <Section title="Cards" description="Simple card containers with thin borders and subtle shadow.">
        <div className="grid gap-4 md:grid-cols-2">
          {cards.map((card) => (
            <Card key={card.title} title={card.title} description={card.description}>
              <div className="mt-4 flex items-center justify-between">
                <div>
                  <p className="text-3xl font-semibold text-slate-950">{card.value}</p>
                  <Caption>Trend snapshot</Caption>
                </div>
                <div className="rounded-2xl bg-slate-100 px-3 py-2 text-xs font-medium uppercase tracking-[0.18em] text-slate-600">
                  Stable
                </div>
              </div>
            </Card>
          ))}
        </div>
      </Section>

      <Section title="App shell" description="A responsive shell layout with a top header and mobile bottom navigation.">
        <div className="grid gap-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-3 rounded-3xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <Caption>AppShell</Caption>
                <Heading>Workspace overview</Heading>
              </div>
              <Button variant="secondary">Connect</Button>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-3xl border border-slate-200 bg-white p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Status</p>
                <p className="mt-3 text-2xl font-semibold text-slate-950">Ready</p>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-white p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Trend</p>
                <p className="mt-3 text-2xl font-semibold text-slate-950">+4.2%</p>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-white p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Target</p>
                <p className="mt-3 text-2xl font-semibold text-slate-950">15m</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-3xl border border-slate-200 bg-white p-4">
                <div className="flex items-center gap-2 text-slate-700">
                  <Home className="h-4 w-4" />
                  <span className="text-xs uppercase tracking-[0.18em] text-slate-500">Home</span>
                </div>
                <p className="mt-4 text-sm text-slate-700">A clear entry panel, ready for dashboard data.</p>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-white p-4">
                <div className="flex items-center gap-2 text-slate-700">
                  <BarChart3 className="h-4 w-4" />
                  <span className="text-xs uppercase tracking-[0.18em] text-slate-500">Analytics</span>
                </div>
                <p className="mt-4 text-sm text-slate-700">Well-spaced sections with minimal visual noise.</p>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-white p-4">
                <div className="flex items-center gap-2 text-slate-700">
                  <Settings2 className="h-4 w-4" />
                  <span className="text-xs uppercase tracking-[0.18em] text-slate-500">Settings</span>
                </div>
                <p className="mt-4 text-sm text-slate-700">Tools and controls appear precise and professional.</p>
              </div>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-slate-950">Navigation preview</p>
                </div>
                <div className="inline-flex gap-2">
                  <Button variant="ghost" size="sm">
                    <Grid className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Settings2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <Caption>Designed for mobile-first bottom navigation.</Caption>
            </div>
          </div>
        </div>
      </Section>
    </PageContainer>
  )
}
