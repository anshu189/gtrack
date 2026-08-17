import { useState, useEffect } from 'react'
import type { RespectLog } from '@/types'

interface RespectTrackerProps {
  log: RespectLog | null
  onUpsert: (patch: Partial<RespectLog>) => void
  readOnly?: boolean
}

const FACTORS = [
  { key: 'didWhatSaid' as const, label: 'Do what you said', inc: 1, dec: -1 },
  { key: 'excuse' as const, label: 'Excuse', inc: 1, dec: -1 },
  { key: 'flake' as const, label: 'Flake (ignored)', inc: 3, dec: -3 },
]

const BAR_MAX = 50

export const RespectTracker = ({ log, onUpsert, readOnly = false }: RespectTrackerProps) => {
  const [values, setValues] = useState({ didWhatSaid: 0, excuse: 0, flake: 0 })

  useEffect(() => {
    if (log) {
      setValues({ didWhatSaid: log.didWhatSaid, excuse: log.excuse, flake: log.flake })
    } else {
      setValues({ didWhatSaid: 0, excuse: 0, flake: 0 })
    }
  }, [log])

  const total = values.didWhatSaid + values.excuse + values.flake

  const handleTap = (key: keyof typeof values, delta: number) => {
    if (readOnly) return
    const next = { ...values, [key]: values[key] + delta }
    setValues(next)
    onUpsert({
      id: log?.id,
      date: log?.date,
      didWhatSaid: next.didWhatSaid,
      excuse: next.excuse,
      flake: next.flake,
    })
  }

  return (
    <div className="space-y-3">
      {FACTORS.map((f) => {
        const val = values[f.key]
        const width = Math.min((Math.abs(val) / BAR_MAX) * 100, 100)
        return (
          <div key={f.key}>
            <div className="mb-1 flex items-center justify-between text-xs">
              <span className="!text-md font-medium text-slate-950 dark:text-[var(--color-text)]">{f.label}</span>
              <span className={`font-mono text-md ${val >= 0 ? 'text-[var(--color-success)]' : 'text-[var(--color-error)]'}`}>
                {val > 0 ? '+' : ''}{val}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {!readOnly && (
                <button
                  type="button"
                  onClick={() => handleTap(f.key, f.dec)}
                  className="flex h-7 w-7 items-center justify-center border text-xs font-bold dark:border-[var(--color-border)] dark:text-[var(--color-text)] dark:hover:bg-[var(--color-surface)]"
                >
                  {f.dec > 0 ? `+${f.dec}` : f.dec}
                </button>
              )}
              <div className="flex-1 h-2 bg-slate-200 dark:bg-[var(--color-surface-alt)]">
                <div
                  className={`h-full transition-all ${val >= 0 ? 'bg-[var(--color-success)]' : 'bg-[var(--color-error)]'}`}
                  style={{ width: `${width}%` }}
                />
              </div>
              {!readOnly && (
                <button
                  type="button"
                  onClick={() => handleTap(f.key, f.inc)}
                  className="flex h-7 w-7 items-center justify-center border text-xs font-bold dark:border-[var(--color-border)] dark:text-[var(--color-text)] dark:hover:bg-[var(--color-surface)]"
                >
                  +{f.inc}
                </button>
              )}
            </div>
          </div>
        )
      })}

      <div className="border-t border-slate-200 pt-2 dark:border-[var(--color-border)]">
        <div className="flex items-center justify-between text-sm">
          <span className="!text-md font-semibold text-slate-950 dark:text-[var(--color-text)]">Respect/Trust score</span>
          <span className={`font-mono text-lg font-bold ${total >= 0 ? 'text-[var(--color-success)]' : 'text-[var(--color-error)]'}`}>
            {total > 0 ? '+' : ''}{total}
          </span>
        </div>
        <div className="mt-1 h-2.5 bg-slate-200 dark:bg-[var(--color-surface-alt)]">
          <div
            className={`h-full transition-all ${total >= 0 ? 'bg-[var(--color-success)]' : 'bg-[var(--color-error)]'}`}
            style={{ width: `${Math.min((Math.abs(total) / BAR_MAX) * 100, 100)}%` }}
          />
        </div>
      </div>
    </div>
  )
}
