export function formatNum(n: number): string {
  if (n === 0) return '0'
  const rounded = Math.round(n * 100) / 100
  const str = rounded.toString()
  return str.includes('.') ? str.replace(/\.?0+$/, '') : str
}
