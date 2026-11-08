import { Check, ChevronRight, Sparkles } from 'lucide-react'
import type { SchemeResult, SystemDef, Unit } from '../types'
import { formatParts, formatPercent } from '../lib/capacity'
import { Legend, SpaceBar, StepLabel } from './ui'

export function ComparisonTable({
  system,
  results,
  unit,
  selectedId,
  recommendedId,
  onSelect,
}: {
  system: SystemDef
  results: SchemeResult[]
  unit: Unit
  selectedId: string
  recommendedId: string
  onSelect: (id: string) => void
}) {
  return (
    <section className="section shell" id="comparativa" aria-labelledby="comparativa-title">
      <div className="section-head">
        <StepLabel number="04">Comparativa</StepLabel>
        <div className="section-head__row section-head__row--end">
          <h2 id="comparativa-title">
            Todas las opciones.
            <br />
            <span>Un mismo chasis.</span>
          </h2>
          <div className="compare-heading">
            <p className="section-head__intro">
              Elige una fila para verla en detalle. Las barras usan la misma escala: cuanto más
              larga es la zona verde, más partido sacas a los discos.
            </p>
            <Legend />
          </div>
        </div>
      </div>

      <div className="compare" role="group" aria-label={`Configuraciones de ${system.name}`}>
        <div className="compare__head" aria-hidden="true">
          <span>Configuración</span>
          <span>Reparto del espacio</span>
          <span>Disponible</span>
        </div>

        {results.map((result) => {
          const active = selectedId === result.scheme.id
          const recommended = recommendedId === result.scheme.id && result.viable
          const parts = formatParts(result.usable, unit)

          return (
            <button
              key={result.scheme.id}
              type="button"
              className={`compare-row ${active ? 'is-active' : ''} ${!result.viable ? 'is-disabled' : ''}`}
              onClick={() => onSelect(result.scheme.id)}
              aria-pressed={active}
              aria-label={
                result.viable
                  ? `${result.scheme.name}: ${parts.text} disponibles, ${formatPercent(result.efficiency)} aprovechado`
                  : `${result.scheme.name}: no disponible. ${result.invalidReason}`
              }
            >
              <span className="compare-row__id">
                <span className="compare-row__radio" aria-hidden="true">
                  {active && <Check size={10} strokeWidth={3.2} />}
                </span>
                <span className="compare-row__text">
                  <span className="compare-row__name">
                    {result.scheme.name}
                    {recommended && (
                      <em className="recommend-tag">
                        <Sparkles size={10} />
                        Encaja mejor
                      </em>
                    )}
                  </span>
                  <span className="compare-row__meta">
                    <b>{result.scheme.tag}</b>
                    {result.scheme.summary}
                  </span>
                </span>
              </span>

              <span className="compare-row__bar">
                {result.viable ? (
                  <SpaceBar
                    usable={result.usable}
                    protection={result.protection}
                    reserved={result.reserved}
                    unused={result.unused}
                    unit={unit}
                    compact
                  />
                ) : (
                  <span className="compare-row__invalid">{result.invalidReason}</span>
                )}
              </span>

              <span className="compare-row__value">
                {result.viable ? (
                  <>
                    <strong>{parts.value}</strong>
                    <small>{parts.unit}</small>
                    <span className="compare-row__eff">
                      {formatPercent(result.efficiency)} útil
                    </span>
                  </>
                ) : (
                  <>
                    <strong className="compare-row__dash">—</strong>
                    <span className="compare-row__eff">no disponible</span>
                  </>
                )}
                <ChevronRight size={14} className="compare-row__chevron" aria-hidden="true" />
              </span>
            </button>
          )
        })}
      </div>

      <div className="compare-foot">
        <p>
          <strong>Incluye</strong> reservas de sistema y filesystem, tolerancia a fallos y espacio
          que el reparto no puede aprovechar.
        </p>
        <p>
          <strong>No incluye</strong> snapshots, deduplicación, hot spare, caché SSD ni volúmenes
          adicionales.
        </p>
      </div>
    </section>
  )
}
