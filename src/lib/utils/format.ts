/**
 * Display formatting for nutrition numbers.
 *
 * Values are stored at full precision (rounding in storage makes a serving
 * drift on the way back), so every display path has to round. Gtrak DS asks
 * for at most one decimal, with trailing zeros dropped: 106.7, 4, 0.3.
 */
export function formatNum(n: number): string {
  if (!Number.isFinite(n)) return '0'
  if (n === 0) return '0'
  const rounded = Math.round(n * 10) / 10
  const str = rounded.toString()
  return str.includes('.') ? str.replace(/\.?0+$/, '') : str
}

/** Calories read as whole numbers in Gtrak DS ("2583"). */
export function formatCalories(n: number): string {
  if (!Number.isFinite(n)) return '0'
  return String(Math.round(n))
}
