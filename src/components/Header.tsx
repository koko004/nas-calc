import { RotateCcw } from 'lucide-react'
import type { Unit } from '../types'
import { LogoMark } from './ui'

export function Header({
  unit,
  onUnitChange,
  onReset,
}: {
  unit: Unit
  onUnitChange: (unit: Unit) => void
  onReset: () => void
}) {
  return (
    <header className="site-header">
      <div className="shell site-header__inner">
        <a className="brand" href="#top" aria-label="NAS/CALC, inicio">
          <LogoMark />
          <span className="brand__text">
            <span className="brand__name">
              NAS<span>/</span>CALC
            </span>
            <span className="brand__sub">storage planner</span>
          </span>
        </a>

        <nav className="site-nav" aria-label="Secciones">
          <a href="#sistemas">Sistemas</a>
          <a href="#discos">Discos</a>
          <a href="#comparativa">Comparativa</a>
          <a href="#cara-a-cara">Cara a cara</a>
          <a href="#metodo">Método</a>
        </nav>

        <div className="site-tools">
          <div className="unit-toggle" role="group" aria-label="Unidad de capacidad">
            <button
              type="button"
              className={unit === 'tib' ? 'is-active' : ''}
              aria-pressed={unit === 'tib'}
              onClick={() => onUnitChange('tib')}
              title="Capacidad visible en el sistema operativo (1 TiB = 1.024 GiB)"
            >
              TiB
            </button>
            <button
              type="button"
              className={unit === 'tb' ? 'is-active' : ''}
              aria-pressed={unit === 'tb'}
              onClick={() => onUnitChange('tb')}
              title="Capacidad de la etiqueta del disco (1 TB = 1.000 GB)"
            >
              TB
            </button>
          </div>
          <button
            type="button"
            className="icon-button"
            onClick={onReset}
            title="Reiniciar la configuración"
            aria-label="Reiniciar la configuración"
          >
            <RotateCcw size={16} />
          </button>
        </div>
      </div>
    </header>
  )
}
