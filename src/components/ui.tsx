import type { CSSProperties, ReactNode } from 'react'
import type { Unit } from '../types'
import { formatParts, formatSize } from '../lib/capacity'

export function LogoMark({ size = 30 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      aria-hidden="true"
      className="logo-mark"
    >
      <rect x="3" y="3" width="34" height="34" rx="9" stroke="currentColor" strokeOpacity=".22" />
      <rect x="10" y="10" width="20" height="5" rx="1.6" fill="var(--accent)" />
      <rect x="10" y="18" width="20" height="5" rx="1.6" fill="var(--data)" />
      <rect x="10" y="26" width="20" height="5" rx="1.6" fill="var(--protect)" />
      <circle cx="13.4" cy="12.5" r="1" fill="#081014" />
      <circle cx="13.4" cy="20.5" r="1" fill="#081014" />
      <circle cx="13.4" cy="28.5" r="1" fill="#081014" />
    </svg>
  )
}

export function StepLabel({
  number,
  children,
  id,
}: {
  number: string
  children: ReactNode
  id?: string
}) {
  return (
    <div className="step-label" id={id}>
      <span className="step-label__number">{number}</span>
      <span className="step-label__text">{children}</span>
      <span className="step-label__rule" />
    </div>
  )
}

const SYSTEM_COLORS: Record<string, string> = {
  synology: '#d7ff57',
  truenas: '#6ea0ff',
  unraid: '#ffb454',
  omv: '#5be7a9',
  fnos: '#ff8f7d',
  qnap: '#b6a1ff',
}

const SYSTEM_MONOGRAMS: Record<string, string> = {
  synology: 'SY',
  truenas: 'TN',
  unraid: 'UN',
  omv: 'OM',
  fnos: 'fn',
  qnap: 'QP',
}

export function SystemGlyph({ id, name }: { id: string; name: string }) {
  const color = SYSTEM_COLORS[id] ?? 'var(--accent)'
  const monogram = SYSTEM_MONOGRAMS[id] ?? name.slice(0, 2).toUpperCase()

  return (
    <span className="system-glyph" style={{ '--glyph-color': color } as CSSProperties}>
      <svg viewBox="0 0 48 48" role="img" aria-label={`Icono de ${name}`}>
        <rect x="1" y="1" width="46" height="46" rx="13" fill="currentColor" fillOpacity=".055" />
        <rect
          x="1"
          y="1"
          width="46"
          height="46"
          rx="13"
          stroke="currentColor"
          strokeOpacity=".3"
        />
        <text
          x="24"
          y="29"
          textAnchor="middle"
          fontFamily="var(--font-mono)"
          fontSize="13"
          fontWeight="700"
          letterSpacing="-.5"
          fill="currentColor"
        >
          {monogram}
        </text>
        <rect x="14" y="35" width="20" height="2" rx="1" fill="currentColor" opacity=".55" />
        <circle cx="37" cy="36" r="1.5" fill="currentColor" />
      </svg>
    </span>
  )
}

export function SpaceBar({
  usable,
  protection,
  reserved,
  unused,
  unit,
  compact = false,
}: {
  usable: number
  protection: number
  reserved: number
  unused: number
  unit: Unit
  compact?: boolean
}) {
  const total = usable + protection + reserved + unused
  const segments = [
    { key: 'usable', label: 'Disponible', value: usable, className: 'seg--data' },
    { key: 'protection', label: 'Protección', value: protection, className: 'seg--protect' },
    { key: 'reserved', label: 'Reservado', value: reserved, className: 'seg--reserve' },
    { key: 'unused', label: 'Sin usar', value: unused, className: 'seg--unused' },
  ].filter((segment) => segment.value > 0.0001)

  if (total <= 0 || segments.length === 0) {
    return (
      <div className={`spacebar spacebar--empty ${compact ? 'is-compact' : ''}`} aria-hidden="true">
        <span>Sin datos</span>
      </div>
    )
  }

  const description = segments
    .map((segment) => `${segment.label}: ${formatSize(segment.value, unit)}`)
    .join('. ')

  return (
    <div
      className={`spacebar ${compact ? 'is-compact' : ''}`}
      role="img"
      aria-label={description}
    >
      {segments.map((segment) => {
        const percent = (segment.value / total) * 100
        return (
          <div
            key={segment.key}
            className={`spacebar__seg ${segment.className}`}
            style={{ width: `${percent}%` }}
            title={`${segment.label}: ${formatSize(segment.value, unit)}`}
          >
            {percent >= (compact ? 16 : 11) && (
              <span className="spacebar__label">{formatSize(segment.value, unit)}</span>
            )}
          </div>
        )
      })}
    </div>
  )
}

export function Legend({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`legend ${compact ? 'legend--compact' : ''}`}>
      <span className="legend__item">
        <i className="swatch swatch--data" /> Disponible
      </span>
      <span className="legend__item">
        <i className="swatch swatch--protect" /> Protección
      </span>
      <span className="legend__item">
        <i className="swatch swatch--reserve" /> Reservado
      </span>
      <span className="legend__item">
        <i className="swatch swatch--unused" /> Sin usar
      </span>
    </div>
  )
}

export function CapacityValue({ tb, unit }: { tb: number; unit: Unit }) {
  const parts = formatParts(tb, unit)
  return (
    <span className="capacity-value">
      {parts.value}
      <small>{parts.unit}</small>
    </span>
  )
}
