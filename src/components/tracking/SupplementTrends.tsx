import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Card } from '@/components/ds'
import { formatSupplementAmount } from '@/lib/utils/supplements'

export interface SupplementSeries {
  id: string
  name: string
  unit: string
  /** One amount per day, in the supplement's own unit. */
  values: number[]
}

interface SupplementTrendsProps {
  series: SupplementSeries[]
  /** ISO dates, one per value. */
  dates: string[]
  formatDate: (iso: string) => string
}

/**
 * Analytics: one small bar chart per supplement, each in its own unit — a
 * scoop and a gram cannot share an axis. Under each, how many days it was
 * taken and how much in all, so the bars never carry the meaning alone.
 *
 * Bars are `ink`: supplements are not a macro, and DS colour is reserved for
 * data that has one.
 */
export const SupplementTrends = ({ series, dates, formatDate }: SupplementTrendsProps) => {
  const visible = series.filter((s) => s.values.some((v) => v > 0))

  return (
    <Card title="Supplements">
      {visible.length === 0 ? (
        <p className="body-text text-ink-2">
          Nothing logged in this range. Tap + on the Supplements row on Home to start.
        </p>
      ) : (
        <div className="flex flex-col gap-6">
          {visible.map((s) => {
            const daysTaken = s.values.filter((v) => v > 0).length
            const total = s.values.reduce((sum, v) => sum + v, 0)
            const data = s.values.map((v, i) => ({ date: dates[i], amount: v }))
            return (
              <div key={s.id} className="flex flex-col gap-2">
                <div className="flex items-baseline justify-between gap-3">
                  <p className="min-w-0 truncate headline text-black">{s.name}</p>
                  <p className="shrink-0 label-text text-ink-2">{formatSupplementAmount(total, s.unit)} in all</p>
                </div>
                <ResponsiveContainer width="100%" height={96}>
                  <BarChart data={data} margin={{ top: 4, right: 0, bottom: 0, left: 0 }}>
                    <XAxis dataKey="date" hide />
                    <YAxis hide domain={[0, 'dataMax']} />
                    <Tooltip
                      formatter={(value) => [formatSupplementAmount(Number(value), s.unit), s.name]}
                      labelFormatter={(label) => formatDate(String(label))}
                      contentStyle={{ background: 'var(--ink)', border: 'none', borderRadius: 10, padding: '8px 10px' }}
                      labelStyle={{ color: 'var(--on-ink-muted)', fontSize: 11 }}
                      itemStyle={{ color: 'var(--on-ink)', fontSize: 12, fontWeight: 600 }}
                      cursor={{ fill: 'var(--fill-subtle)' }}
                    />
                    <Bar dataKey="amount" fill="var(--ink)" radius={[3, 3, 0, 0]} maxBarSize={18} />
                  </BarChart>
                </ResponsiveContainer>
                <p className="footnote text-ink-2">
                  Taken on {daysTaken} of {dates.length} days
                </p>
              </div>
            )
          })}
        </div>
      )}
    </Card>
  )
}

export default SupplementTrends
