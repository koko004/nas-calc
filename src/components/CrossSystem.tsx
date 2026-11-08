import { ArrowRight, Sparkles } from 'lucide-react'
import type { SystemDef, SystemId, Unit } from '../types'
import { calculateScheme, recommendScheme } from '../lib/calc'
import { formatParts, formatPercent } from '../lib/capacity'
import { SpaceBar, StepLabel, SystemGlyph } from './ui'

export function CrossSystem({
  systems,
  sizes,
  currentSystemId,
  unit,
  onSelectSystem,
}: {
  systems: SystemDef[]
  sizes: number[]
  currentSystemId: SystemId
  unit: Unit
  onSelectSystem: (id: SystemId) => void
}) {
  const rows = systems
    .map((system) => {
      const schemeId = recommendScheme(system.id, sizes)
      const scheme = system.schemes.find((item) => item.id === schemeId) ?? system.schemes[0]
      const result = calculateScheme(scheme, sizes, system.overhead)
      return { system, scheme, result }
    })
    .sort((a, b) => {
      if (a.result.viable !== b.result.viable) return a.result.viable ? -1 : 1
      return b.result.usable - a.result.usable
    })

  const best = rows.find((row) => row.result.viable)
  const hasDisks = sizes.length > 0

  return (
    <section className="section shell cross" id="cara-a-cara" aria-labelledby="cross-title">
      <div className="section-head">
        <StepLabel number="05">Cara a cara</StepLabel>
        <div className="section-head__row section-head__row--end">
          <h2 id="cross-title">
            El mismo chasis.
            <br />
            <span>Otra manera de llenarlo.</span>
          </h2>
          <div className="cross-heading">
            <p className="section-head__intro">
              Con tus discos actuales, aplicamos la configuración recomendada de cada sistema.
              Compara capacidad y tolerancia; no solo el número grande.
            </p>
            <span className="micro-label cross__order">Ordenado por capacidad útil</span>
          </div>
        </div>
      </div>

      {hasDisks ? (
        <div className="cross-table" role="group" aria-label="Comparación entre sistemas NAS">
          <div className="cross-head" aria-hidden="true">
            <span>Sistema</span>
            <span>Configuración recomendada</span>
            <span>Reparto</span>
            <span>Disponible</span>
          </div>

          {rows.map(({ system, scheme, result }) => {
            const active = system.id === currentSystemId
            const isBest = best?.system.id === system.id
            const parts = result.viable ? formatParts(result.usable, unit) : null

            return (
              <button
                key={system.id}
                type="button"
                className={`cross-row ${active ? 'is-active' : ''} ${!result.viable ? 'is-disabled' : ''}`}
                onClick={() => onSelectSystem(system.id)}
                aria-pressed={active}
                aria-label={`${system.name}: ${result.viable ? `${scheme.name}, ${formatPercent(result.efficiency)} útil` : result.invalidReason}`}
              >
                <span className="cross-row__system">
                  <SystemGlyph id={system.id} name={system.name} />
                  <span className="cross-row__identity">
                    <span className="cross-row__name">
                      {system.name}
                      {isBest && (
                        <em className="cross-row__best">
                          <Sparkles size={9} />
                          Más capacidad
                        </em>
                      )}
                    </span>
                    <span className="cross-row__product">{system.product}</span>
                  </span>
                </span>

                <span className="cross-row__scheme">
                  <strong>{scheme.name}</strong>
                  <small>
                    {result.viable
                      ? `${scheme.tag} · ${result.tolerance} ${result.tolerance === 1 ? 'fallo' : 'fallos'}`
                      : scheme.tag}
                  </small>
                </span>

                <span className="cross-row__bar">
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
                    <span className="cross-row__invalid">No disponible con estos discos</span>
                  )}
                </span>

                <span className="cross-row__value">
                  {parts ? (
                    <>
                      <strong>{parts.value}</strong>
                      <small>{parts.unit}</small>
                      <span>{formatPercent(result.efficiency)} útil</span>
                    </>
                  ) : (
                    <strong className="cross-row__dash">—</strong>
                  )}
                  <ArrowRight size={13} className="cross-row__arrow" aria-hidden="true" />
                </span>
              </button>
            )
          })}
        </div>
      ) : (
        <div className="cross-empty">
          <p>Coloca al menos un disco para comparar cómo lo repartiría cada sistema.</p>
          <a className="button button--small" href="#discos">
            Ir a los discos
          </a>
        </div>
      )}

      <p className="cross-note">
        La configuración recomendada no siempre es la de mayor capacidad: cada sistema tiene sus
        propias reglas de expansión y protección. Pulsa una fila para probarla en la calculadora.
      </p>
    </section>
  )
}
