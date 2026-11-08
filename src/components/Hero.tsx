import { ArrowDownRight, ShieldCheck, Sparkles } from 'lucide-react'
import type { Unit } from '../types'
import { formatParts, formatSize } from '../lib/capacity'

/** Ejemplo estático: 4 × 8 TB en SHR, con el mismo criterio que la calculadora. */
const EXAMPLE_USABLE_TB = 23.0112
const EXAMPLE_RAW_TB = 32

export function Hero({ unit }: { unit: Unit }) {
  const usable = formatParts(EXAMPLE_USABLE_TB, unit)

  return (
    <section className="hero shell" aria-labelledby="hero-title">
      <div className="hero__copy">
        <p className="eyebrow">
          <span className="eyebrow__dot" />
          Calculadora de almacenamiento · NAS
        </p>
        <h1 id="hero-title">
          Elige el NAS.
          <br />
          <span>Haz las cuentas.</span>
        </h1>
        <p className="hero__lead">
          Descubre cuánto espacio tendrás de verdad con cada sistema y cada reparto de discos.
          Capacidad útil, protección y lo que se queda por el camino, antes de gastarte el dinero.
        </p>
        <div className="hero__actions">
          <a className="button button--primary" href="#sistemas">
            Empezar a calcular
            <ArrowDownRight size={17} />
          </a>
          <a className="button button--ghost" href="#metodo">
            <ShieldCheck size={16} />
            Cómo se calcula
          </a>
        </div>
      </div>

      <div className="hero__aside" aria-hidden="true">
        <div className="hero-orbit">
          <div className="hero-orbit__bar">
            <span style={{ width: '71.8%' }} className="hero-orbit__data" />
            <span style={{ width: '25%' }} className="hero-orbit__protect" />
            <span style={{ width: '3.2%' }} className="hero-orbit__reserve" />
          </div>
          <div className="hero-orbit__labels">
            <span>útil</span>
            <span>protección</span>
            <span>reservado</span>
          </div>
        </div>
        <div className="hero-card">
          <div className="hero-card__top">
            <span className="micro-label">EJEMPLO</span>
            <span className="hero-card__badge">
              <Sparkles size={12} /> 4 × 8 TB
            </span>
          </div>
          <p className="hero-card__system">Synology · SHR</p>
          <p className="hero-card__value">
            {usable.value} <span>{usable.unit}</span>
          </p>
          <p className="hero-card__caption">
            de {formatSize(EXAMPLE_RAW_TB, unit)} brutos · 1 fallo tolerado
          </p>
          <div className="hero-card__bays">
            {[0, 1, 2, 3].map((bay) => (
              <span key={bay} className="hero-card__bay">
                <i />
              </span>
            ))}
          </div>
        </div>
        <span className="hero__grid-note">ZFS / SHR / PARIDAD / BTRFS</span>
      </div>
    </section>
  )
}
