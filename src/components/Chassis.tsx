import { useState } from 'react'
import type { CSSProperties } from 'react'
import { Activity, Trash2 } from 'lucide-react'
import type { Disk, SystemDef } from '../types'
import { formatDiskLabel, formatRawTb } from '../lib/capacity'
import { BAY_OPTIONS } from '../data/systems'

export function Chassis({
  system,
  bays,
  brush,
  failMode,
  failed,
  onBayCount,
  onActivateBay,
  onRemoveBay,
  onDropDisk,
  onClear,
  onToggleFailMode,
}: {
  system: SystemDef
  bays: (Disk | null)[]
  brush: number
  failMode: boolean
  failed: Set<string>
  onBayCount: (count: number) => void
  onActivateBay: (index: number) => void
  onRemoveBay: (index: number) => void
  onDropDisk: (index: number, size: number) => void
  onClear: () => void
  onToggleFailMode: () => void
}) {
  const [dragOver, setDragOver] = useState<number | null>(null)
  const disks = bays.filter((bay): bay is Disk => bay !== null)
  const raw = disks.reduce((total, disk) => total + disk.size, 0)
  const failedCount = disks.filter((disk) => failed.has(disk.id)).length

  return (
    <div className="chassis-block" data-bays={bays.length}>
      <div className="bay-toolbar">
        <div className="bay-toolbar__group">
          <span className="micro-label">Bahías del chasis</span>
          <div className="segmented" role="group" aria-label="Número de bahías">
            {BAY_OPTIONS.map((count) => (
              <button
                key={count}
                type="button"
                className={bays.length === count ? 'is-active' : ''}
                aria-pressed={bays.length === count}
                onClick={() => onBayCount(count)}
              >
                {count}
              </button>
            ))}
          </div>
        </div>
        <div className="bay-toolbar__actions">
          <button
            type="button"
            className={`tool-button ${failMode ? 'is-active' : ''}`}
            onClick={onToggleFailMode}
            aria-pressed={failMode}
            title="Simula la caída de discos para comprobar la tolerancia del volumen"
          >
            <Activity size={15} />
            {failMode ? 'Salir del test' : 'Simular fallo'}
          </button>
          <button
            type="button"
            className="tool-button"
            onClick={onClear}
            disabled={disks.length === 0}
            title="Quitar todos los discos"
          >
            <Trash2 size={15} />
            Vaciar
          </button>
        </div>
      </div>

      <div className={`chassis ${failMode ? 'is-testing' : ''}`}>
        <div className="chassis__top">
          <div className="chassis__brand">
            <span className="chassis__plate">NAS/CALC</span>
            <span className="chassis__model">
              {system.shortName.toUpperCase()} · {bays.length} BAY
            </span>
          </div>
          <div className="chassis__status" aria-hidden="true">
            <span className="chassis__status-label">STATUS</span>
            <span className="led led--power" title="Encendido" />
            <span className="led led--activity" title="Actividad" />
          </div>
        </div>

        <div className="chassis__bays" style={{ '--bays': bays.length } as CSSProperties}>
          {bays.map((disk, index) => {
            const isFailed = disk ? failed.has(disk.id) : false
            const isDragOver = dragOver === index

            return (
              <button
                key={index}
                type="button"
                className={`bay ${disk ? 'is-filled' : 'is-empty'} ${isFailed ? 'is-failed' : ''} ${isDragOver ? 'is-dragover' : ''}`}
                onClick={() => onActivateBay(index)}
                onKeyDown={(event) => {
                  if ((event.key === 'Delete' || event.key === 'Backspace') && disk) {
                    event.preventDefault()
                    onRemoveBay(index)
                  }
                }}
                onDragOver={(event) => {
                  event.preventDefault()
                  event.dataTransfer.dropEffect = 'copy'
                  setDragOver(index)
                }}
                onDragLeave={() => setDragOver((current) => (current === index ? null : current))}
                onDrop={(event) => {
                  event.preventDefault()
                  setDragOver(null)
                  const size = Number(event.dataTransfer.getData('text/plain'))
                  if (Number.isFinite(size) && size > 0) onDropDisk(index, size)
                }}
                aria-label={
                  disk
                    ? failMode
                      ? `Bahía ${index + 1}, disco de ${formatDiskLabel(disk.size)}. ${isFailed ? 'Fallado. Pulsa para restaurar.' : 'Pulsa para simular un fallo.'}`
                      : `Bahía ${index + 1}, disco de ${formatDiskLabel(disk.size)}. Pulsa para quitarlo; Supr también lo elimina.`
                    : `Bahía ${index + 1}, vacía. Pulsa para colocar un disco de ${formatDiskLabel(brush)}.`
                }
                title={
                  disk
                    ? failMode
                      ? isFailed
                        ? 'Restaurar este disco'
                        : 'Simular el fallo de este disco'
                      : `Quitar el disco de ${formatDiskLabel(disk.size)}`
                    : `Colocar un disco de ${formatDiskLabel(brush)}`
                }
              >
                <span className="bay__led" aria-hidden="true" />
                {disk ? (
                  <>
                    <span className="bay__capacity">
                      <span className="bay__size">{formatDiskLabel(disk.size)}</span>
                      <span className="bay__kind">HDD</span>
                    </span>
                    <span className="bay__handle" aria-hidden="true" />
                    <span className="bay__remove" aria-hidden="true">
                      ×
                    </span>
                    {isFailed && (
                      <span className="bay__failure" aria-hidden="true">
                        <span>!</span>
                      </span>
                    )}
                  </>
                ) : (
                  <span className="bay__empty-mark" aria-hidden="true">
                    <span>+</span>
                  </span>
                )}
                <span className="bay__index" aria-hidden="true">
                  {String(index + 1).padStart(2, '0')}
                </span>
              </button>
            )
          })}
        </div>

        <div className="chassis__foot">
          <span className="chassis__stat">
            <strong>{String(disks.length).padStart(2, '0')}</strong> / {String(bays.length).padStart(2, '0')} ocupadas
          </span>
          <span className="chassis__stat">
            <strong>{formatRawTb(raw)}</strong> brutos
          </span>
          <span className="chassis__hint">
            {failMode
              ? failedCount > 0
                ? `${failedCount} ${failedCount === 1 ? 'disco caído' : 'discos caídos'}`
                : 'Pulsa un disco para apagarlo'
              : 'Arrastra un disco o pulsa una bahía'}
          </span>
        </div>
      </div>
    </div>
  )
}
