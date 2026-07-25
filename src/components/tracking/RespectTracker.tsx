import { useState, useEffect } from 'react'
import type { RespectLog } from '@/types'

interface RespectTrackerProps {
  log: RespectLog | null
  onUpsert: (patch: Partial<RespectLog>) => void
  readOnly?: boolean
}

const FACTORS = [
  { key: 'didWhatSaid' as const, label: 'Do What You Said', inc: 1, dec: -1 },
  { key: 'excuse' as const, label: 'Excuse', inc: 1, dec: -1 },
  { key: 'flake' as const, label: 'Flake (Ignored)', inc: 3, dec: -3 },
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
              <span className="font-medium text-slate-950 dark:text-[#FDFDFD]">{f.label}</span>
              <span className={`font-mono text-sm ${val >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                {val > 0 ? '+' : ''}{val}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {!readOnly && (
                <button
                  type="button"
                  onClick={() => handleTap(f.key, f.dec)}
                  className="flex h-7 w-7 items-center justify-center border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-100 dark:border-[#2D2D2D] dark:text-[#FDFDFD] dark:hover:bg-[#2D2D2D]"
                >
                  {f.dec > 0 ? `+${f.dec}` : f.dec}
                </button>
              )}
              <div className="flex-1 h-2 bg-slate-200 dark:bg-[#2D2D2D]">
                <div
                  className={`h-full transition-all ${val >= 0 ? 'bg-green-500' : 'bg-red-500'}`}
                  style={{ width: `${width}%` }}
                />
              </div>
              {!readOnly && (
                <button
                  type="button"
                  onClick={() => handleTap(f.key, f.inc)}
                  className="flex h-7 w-7 items-center justify-center border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-100 dark:border-[#2D2D2D] dark:text-[#FDFDFD] dark:hover:bg-[#2D2D2D]"
                >
                  +{f.inc}
                </button>
              )}
            </div>
          </div>
        )
      })}

      <div className="border-t border-slate-200 pt-2 dark:border-[#2D2D2D]">
        <div className="flex items-center justify-between text-sm">
          <span className="font-semibold text-slate-950 dark:text-[#FDFDFD]">Respect/Trust Score</span>
          <span className={`font-mono text-lg font-bold ${total >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
            {total > 0 ? '+' : ''}{total}
          </span>
        </div>
        <div className="mt-1 h-2.5 bg-slate-200 dark:bg-[#2D2D2D]">
          <div
            className={`h-full transition-all ${total >= 0 ? 'bg-green-500' : 'bg-red-500'}`}
            style={{ width: `${Math.min((Math.abs(total) / BAR_MAX) * 100, 100)}%` }}
          />
        </div>
      </div>
    </div>
  )
}
