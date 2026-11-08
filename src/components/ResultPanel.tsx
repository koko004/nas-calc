import {
  Activity,
  AlertTriangle,
  ArrowUpRight,
  ChevronDown,
  CircleAlert,
  Info,
  ShieldAlert,
  ShieldCheck,
} from 'lucide-react'
import type { SchemeResult, SystemDef, Unit } from '../types'
import {
  formatCount,
  formatParts,
  formatPercent,
  formatSize,
} from '../lib/capacity'
import { BackupCard } from './BackupCard'
import { Legend, SpaceBar, StepLabel } from './ui'

export function ResultPanel({
  system,
  result,
  unit,
  failMode,
  failedCount,
  recommendedId,
  recommendedViable,
  onSchemeChange,
}: {
  system: SystemDef
  result: SchemeResult
  unit: Unit
  failMode: boolean
  failedCount: number
  recommendedId: string
  recommendedViable: boolean
  onSchemeChange: (id: string) => void
}) {
  const { scheme } = result
  const usable = formatParts(result.usable, unit)
  const tolerated = result.tolerance
  const survives = failedCount <= tolerated
  const recommended = system.schemes.find((item) => item.id === recommendedId)
  const photos = Math.round(result.usable * 33_333)
  const videoHours = Math.round((result.usable * 1000) / 45)

  return (
    <aside className="result-panel" id="resultado" aria-labelledby="resultado-title">
      <div className="result-panel__head">
        <StepLabel number="03" id="resultado-title">
          Resultado
        </StepLabel>
        <a className="micro-link" href="#comparativa">
          Comparar <ArrowUpRight size={12} />
        </a>
      </div>

      <div className="result-select">
        <label htmlFor="scheme-select">Configuración</label>
        <div className="select-wrap">
          <select
            id="scheme-select"
            value={scheme.id}
            onChange={(event) => onSchemeChange(event.target.value)}
          >
            {system.schemes.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name} · {item.tag}
              </option>
            ))}
          </select>
          <ChevronDown size={15} aria-hidden="true" />
        </div>
      </div>

      {result.viable ? (
        <>
          <div className="result-main">
            <div className="result-kicker">
              <span>{system.shortName}</span>
              <i />
              <span>{scheme.name}</span>
              {scheme.id === recommendedId && <em>encaja mejor</em>}
            </div>
            <div className="result-number" aria-live="polite">
              <span>{usable.value}</span>
              <small>{usable.unit}</small>
            </div>
            <p className="result-caption">
              disponibles de {formatSize(result.raw, unit)} brutos
              <span>·</span>
              {formatPercent(result.efficiency)} aprovechado
            </p>
            <div className="result-equivalence">
              <span>≈ {formatCount(photos)} fotos RAW</span>
              <span>≈ {formatCount(videoHours)} h de vídeo 4K</span>
            </div>
          </div>

          <SpaceBar
            usable={result.usable}
            protection={result.protection}
            reserved={result.reserved}
            unused={result.unused}
            unit={unit}
          />
          <Legend />

          <div className="stat-grid">
            <div className="stat stat--protect">
              <span>Protección</span>
              <strong>{formatSize(result.protection, unit)}</strong>
              <small>paridad / espejo</small>
            </div>
            <div className="stat stat--reserve">
              <span>Reservado</span>
              <strong>{formatSize(result.reserved, unit)}</strong>
              <small title={system.overhead.description}>
                {system.overhead.fsLabel} + sistema
              </small>
            </div>
            <div className="stat stat--unused">
              <span>Sin usar</span>
              <strong>{formatSize(result.unused, unit)}</strong>
              <small>{result.unused > 0.01 ? 'no aprovechado' : 'todo aprovechado'}</small>
            </div>
            <div className={`stat ${tolerated === 0 ? 'stat--danger' : 'stat--fault'}`}>
              <span>Tolerancia</span>
              <strong>
                {tolerated}
                <small className="stat__unit"> {tolerated === 1 ? 'fallo' : 'fallos'}</small>
              </strong>
              <small>{tolerated > 0 ? (tolerated === 1 ? 'garantizado' : 'garantizados') : 'sin protección'}</small>
            </div>
          </div>

          {failMode && (
            <div className={`fail-banner ${survives ? 'is-safe' : 'is-lost'}`} role="status">
              <span className="fail-banner__icon">
                {survives ? <ShieldCheck size={18} /> : <ShieldAlert size={18} />}
              </span>
              <div>
                <strong>
                  {failedCount === 0
                    ? 'Test de fallo activo'
                    : survives
                      ? 'Los datos sobreviven'
                      : 'El volumen se pierde'}
                </strong>
                <p>
                  {failedCount === 0
                    ? 'Pulsa discos del chasis para apagarlos y comprobar cuántos aguanta el volumen.'
                    : survives
                      ? `${failedCount} ${failedCount === 1 ? 'disco caído' : 'discos caídos'} y ${tolerated} de margen. ${scheme.name} sigue en pie.`
                      : `Con ${failedCount} ${failedCount === 1 ? 'disco caído' : 'discos caídos'} superas el margen de ${scheme.name}.`}
                </p>
              </div>
            </div>
          )}

          {result.warnings.map((warning) => (
            <div className="warning" key={warning}>
              <AlertTriangle size={16} />
              <p>{warning}</p>
            </div>
          ))}

          {scheme.caveat && (
            <div className="info-note">
              <Info size={16} />
              <p>{scheme.caveat}</p>
            </div>
          )}

          <BackupCard usable={result.usable} palette={system.palette} unit={unit} />

          <div className="assumption">
            <Info size={13} />
            <p>
              {system.overhead.description}{' '}
              <a href="#metodo">Ver método</a>
            </p>
          </div>
        </>
      ) : (
        <div className="invalid-state">
          <span className="invalid-state__icon">
            <CircleAlert size={22} />
          </span>
          <h3>Esta configuración no encaja</h3>
          <p>{result.invalidReason}</p>
          {recommended && recommended.id !== scheme.id && recommendedViable && (
            <p className="invalid-state__hint">
              Con estos discos, <strong>{recommended.name}</strong> sí es una opción.
            </p>
          )}
          <a className="button button--small" href="#paleta">
            Cambiar los discos
          </a>
          {failMode && (
            <span className="invalid-state__mode">
              <Activity size={13} /> El test de fallo sigue activo
            </span>
          )}
        </div>
      )}
    </aside>
  )
}
