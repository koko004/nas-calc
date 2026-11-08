import { Check, HardDrive, Plus } from 'lucide-react'
import { formatDiskLabel } from '../lib/capacity'

export const PRESETS = [
  { id: 'mirror', label: '2 × 4 TB', sizes: [4, 4] },
  { id: 'classic', label: '4 × 8 TB', sizes: [8, 8, 8, 8] },
  { id: 'big', label: '6 × 12 TB', sizes: [12, 12, 12, 12, 12, 12] },
  { id: 'mixed', label: 'Mixto 8 / 4', sizes: [8, 8, 4, 4] },
]

export function CapacityPalette({
  palette,
  brush,
  onBrush,
  onFillEmpty,
  canFill,
  onPreset,
}: {
  palette: number[]
  brush: number
  onBrush: (size: number) => void
  onFillEmpty: () => void
  canFill: boolean
  onPreset: (sizes: number[]) => void
}) {
  return (
    <div className="palette" id="paleta">
      <div className="palette__head">
        <div>
          <span className="micro-label">Disco que quieres colocar</span>
          <p className="palette__lead">
            Pincel activo: <strong>{formatDiskLabel(brush)}</strong>. Pulsa una bahía vacía o
            arrastra el disco.
          </p>
        </div>
        <button
          type="button"
          className="text-button"
          onClick={onFillEmpty}
          disabled={!canFill}
          title="Rellena todas las bahías vacías con el disco seleccionado"
        >
          <Plus size={15} />
          Llenar huecos
        </button>
      </div>

      <div className="drive-grid" role="group" aria-label="Capacidades de disco disponibles">
        {palette.map((size) => {
          const active = size === brush
          return (
            <button
              key={size}
              type="button"
              className={`drive-chip ${active ? 'is-active' : ''}`}
              aria-pressed={active}
              onClick={() => onBrush(size)}
              draggable
              onDragStart={(event) => {
                event.dataTransfer.setData('text/plain', String(size))
                event.dataTransfer.effectAllowed = 'copy'
                onBrush(size)
              }}
              title={`Seleccionar discos de ${formatDiskLabel(size)}`}
            >
              <HardDrive size={15} strokeWidth={1.7} aria-hidden="true" />
              <span>{formatDiskLabel(size)}</span>
              {active && <i className="drive-chip__mark" aria-hidden="true"><Check size={9} strokeWidth={3} /></i>}
            </button>
          )
        })}
      </div>

      <div className="presets">
        <span className="micro-label">Ejemplos rápidos</span>
        <div className="presets__list">
          {PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              className="preset"
              onClick={() => onPreset(preset.sizes)}
              title={`Cargar ${preset.label} y elegir el mejor reparto para ${preset.sizes.length} discos`}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
