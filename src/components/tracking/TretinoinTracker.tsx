import { SettingRow } from '@/components/ds'

interface TretinoinTrackerProps {
  todayLog: { applied: boolean } | null
  onToggle: (applied: boolean) => void
}

/**
 * A daily yes/no fact, so the DS SettingRow (label plus switch, whole row
 * toggles) fits better than the old pair of Yes/No buttons — one control, one
 * tap, and the state is readable at a glance.
 */
export const TretinoinTracker = ({ todayLog, onToggle }: TretinoinTrackerProps) => (
  <SettingRow
    label="Applied tretinoin"
    checked={todayLog?.applied ?? false}
    onChange={onToggle}
    className="-mx-4"
  />
)
