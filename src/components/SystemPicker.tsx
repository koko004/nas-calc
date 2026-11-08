import { ArrowRight, Check } from 'lucide-react'
import type { SystemDef, SystemId } from '../types'
import { StepLabel, SystemGlyph } from './ui'

export function SystemPicker({
  systems,
  selected,
  onSelect,
}: {
  systems: SystemDef[]
  selected: SystemId
  onSelect: (id: SystemId) => void
}) {
  return (
    <section className="section shell" id="sistemas" aria-labelledby="sistemas-title">
      <div className="section-head">
        <StepLabel number="01">Sistema</StepLabel>
        <div className="section-head__row">
          <h2 id="sistemas-title">
            Cada NAS reparte los discos
            <br />
            <span>a su manera.</span>
          </h2>
          <p className="section-head__intro">
            Elige el sistema que tienes en mente. Cambian los tipos de volumen, el espacio que
            reserva el sistema operativo y la forma de aprovechar discos de distinto tamaño.
          </p>
        </div>
      </div>

      <div className="system-grid">
        {systems.map((system) => {
          const active = system.id === selected
          return (
            <button
              key={system.id}
              type="button"
              className={`system-card ${active ? 'is-active' : ''}`}
              onClick={() => onSelect(system.id)}
              aria-pressed={active}
              title={system.description}
            >
              <span className="system-card__top">
                <SystemGlyph id={system.id} name={system.name} />
                <span className="system-card__identity">
                  <span className="system-card__name">{system.name}</span>
                  <span className="system-card__product">{system.product}</span>
                </span>
                <span className="system-card__check" aria-hidden="true">
                  {active ? <Check size={13} strokeWidth={3} /> : <ArrowRight size={13} />}
                </span>
              </span>
              <span className="system-card__description">{system.description}</span>
              <span className="system-card__foot">
                <span>{system.tagline}</span>
                <span className="system-card__count">{system.schemes.length} modos</span>
              </span>
            </button>
          )
        })}
      </div>
    </section>
  )
}
