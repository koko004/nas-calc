import { ShieldCheck } from 'lucide-react'
import type { Unit } from '../types'
import { formatSize, nearestDrive } from '../lib/capacity'

export function BackupCard({
  usable,
  palette,
  unit,
}: {
  usable: number
  palette: number[]
  unit: Unit
}) {
  const target = nearestDrive(usable, palette)

  if (!target || usable <= 0) return null

  const targetLabel =
    target.count > 1 ? `${target.count} × ${target.size} TB` : `${target.size} TB`

  return (
    <div className="backup-card">
      <div className="backup-card__head">
        <span className="backup-card__icon" aria-hidden="true">
          <ShieldCheck size={17} />
        </span>
        <div>
          <h3>Backup, aparte</h3>
          <p>La paridad no es una copia de seguridad.</p>
        </div>
        <span className="backup-card__tag">3 · 2 · 1</span>
      </div>
      <p className="backup-card__copy">
        Protege contra un disco roto, no contra un borrado accidental, ransomware o un incendio.
      </p>
      <div className="backup-card__target">
        <div>
          <span>Copia completa · destino mínimo</span>
          <strong>{targetLabel}</strong>
        </div>
        <span className="backup-card__real">≈ {formatSize(usable, unit)} de datos</span>
      </div>
      <p className="backup-card__rule">3 copias · 2 medios distintos · 1 fuera de casa</p>
    </div>
  )
}
