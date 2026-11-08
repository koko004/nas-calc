import type { Unit } from '../types'

const TB_BYTES = 1e12
const TIB_BYTES = 2 ** 40

const decimal = (value: number, maximumFractionDigits: number) =>
  new Intl.NumberFormat('es-ES', {
    minimumFractionDigits: 0,
    maximumFractionDigits,
  }).format(value)

const compact = new Intl.NumberFormat('es-ES', {
  notation: 'compact',
  maximumFractionDigits: 1,
})

export function toDisplayUnit(tb: number, unit: Unit): number {
  return unit === 'tib' ? (tb * TB_BYTES) / TIB_BYTES : tb
}

export function unitName(unit: Unit, small = false): string {
  if (unit === 'tib') return small ? 'GiB' : 'TiB'
  return small ? 'GB' : 'TB'
}

export interface FormattedSize {
  value: string
  unit: string
  text: string
}

export function formatParts(tb: number, unit: Unit): FormattedSize {
  const big = toDisplayUnit(tb, unit)
  const safe = Math.max(0, tb)

  if (safe === 0) {
    return { value: '0', unit: unitName(unit), text: `0 ${unitName(unit)}` }
  }

  if (big < 1) {
    const smallFactor = unit === 'tib' ? 1024 : 1000
    const smallValue = big * smallFactor
    const value = decimal(smallValue, smallValue >= 10 ? 0 : 1)
    const suffix = unitName(unit, true)
    return { value, unit: suffix, text: `${value} ${suffix}` }
  }

  const value = decimal(big, big >= 100 ? 0 : big >= 10 ? 1 : 2)
  const suffix = unitName(unit)
  return { value, unit: suffix, text: `${value} ${suffix}` }
}

export function formatSize(tb: number, unit: Unit): string {
  return formatParts(tb, unit).text
}

export function formatRawTb(tb: number): string {
  return `${decimal(tb, Number.isInteger(tb) ? 0 : 1)} TB`
}

export function formatDiskLabel(tb: number): string {
  if (tb < 1) return `${decimal(tb * 1000, 0)} GB`
  return `${decimal(tb, Number.isInteger(tb) ? 0 : 1)} TB`
}

export function formatPercent(ratio: number): string {
  return `${decimal(Math.max(0, ratio) * 100, 1)}%`
}

export function formatCount(value: number): string {
  return compact.format(value)
}

export function nearestDrive(usableTb: number, palette: number[]): { count: number; size: number } | null {
  if (usableTb <= 0 || palette.length === 0) return null
  const sizes = [...palette].sort((a, b) => a - b)
  const direct = sizes.find((size) => size >= usableTb)
  if (direct) return { count: 1, size: direct }
  const largest = sizes[sizes.length - 1]
  return { count: Math.ceil(usableTb / largest), size: largest }
}
