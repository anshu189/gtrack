interface TretinoinTrackerProps {
  todayLog: { applied: boolean } | null
  onToggle: (applied: boolean) => void
}

export const TretinoinTracker = ({ todayLog, onToggle }: TretinoinTrackerProps) => {
  const applied = todayLog?.applied ?? false

  return (
    <div className="flex items-center gap-3">
      <span className="text-md font-medium text-slate-950 dark:text-[#FDFDFD]">
        Applied Tretinoin
      </span>
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => onToggle(true)}
          className={`rounded-md px-6 py-1 text-xs font-medium ${
            applied
              ? 'bg-black text-white dark:bg-[#FDFDFD] dark:text-[#111111]'
              : 'border border-slate-300 text-slate-600 dark:border-[#2D2D2D] dark:text-[#FDFDFD]/60'
          }`}
        >
          Yes
        </button>
        <button
          type="button"
          onClick={() => onToggle(false)}
          className={`rounded-md px-6 py-1 text-xs font-medium${
            !applied
              ? 'bg-black text-white dark:bg-[#FDFDFD] dark:text-[#111111]'
              : 'border border-slate-300 text-slate-600 dark:border-[#2D2D2D] dark:text-[#FDFDFD]/60'
          }`}
        >
          No
        </button>
      </div>
    </div>
  )
}
