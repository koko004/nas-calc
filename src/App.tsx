import { useState } from 'react'
import type { Disk, SystemId, Unit } from './types'
import { getSystem, SYSTEMS } from './data/systems'
import { calculateScheme, recommendScheme } from './lib/calc'
import { Header } from './components/Header'
import { Hero } from './components/Hero'
import { SystemPicker } from './components/SystemPicker'
import { Chassis } from './components/Chassis'
import { CapacityPalette } from './components/CapacityPalette'
import { ResultPanel } from './components/ResultPanel'
import { ComparisonTable } from './components/ComparisonTable'
import { CrossSystem } from './components/CrossSystem'
import { Footer, MethodSection } from './components/MethodSection'
import { StepLabel } from './components/ui'

let diskSequence = 0
const makeDisk = (size: number): Disk => {
  diskSequence += 1
  return { id: `disk-${diskSequence}`, size }
}

const createBays = (count: number, sizes: number[] = []): (Disk | null)[] =>
  Array.from({ length: count }, (_, index) =>
    sizes[index] ? makeDisk(sizes[index]) : null,
  )

const INITIAL_SYSTEM = 'synology'
const INITIAL_BAYS = 4
const INITIAL_DISKS = [8, 8, 8, 8]

export default function App() {
  const [systemId, setSystemId] = useState<SystemId>(INITIAL_SYSTEM)
  const [bays, setBays] = useState<(Disk | null)[]>(() =>
    createBays(INITIAL_BAYS, INITIAL_DISKS),
  )
  const [schemeId, setSchemeId] = useState('shr')
  const [brush, setBrush] = useState(8)
  const [unit, setUnit] = useState<Unit>('tib')
  const [failMode, setFailMode] = useState(false)
  const [failed, setFailed] = useState<Set<string>>(new Set())

  const system = getSystem(systemId)
  const disks = bays.filter((bay): bay is Disk => bay !== null)
  const sizes = disks.map((disk) => disk.size)
  const results = system.schemes.map((scheme) =>
    calculateScheme(scheme, sizes, system.overhead),
  )
  const result =
    results.find((item) => item.scheme.id === schemeId) ?? results[0]
  const recommendedId = recommendScheme(system.id, sizes)
  const failedCount = disks.filter((disk) => failed.has(disk.id)).length
  const canFill = bays.some((bay) => bay === null)

  function handleSystemChange(id: SystemId) {
    const next = getSystem(id)
    setSystemId(id)
    setSchemeId(recommendScheme(next.id, sizes))
    setFailMode(false)
    setFailed(new Set())
  }

  function handleBayCount(count: number) {
    setBays((previous) => {
      const next = previous.slice(0, count)
      while (next.length < count) next.push(null)
      return next
    })
  }

  function removeBay(index: number) {
    const disk = bays[index]
    if (disk) {
      setFailed((previous) => {
        const next = new Set(previous)
        next.delete(disk.id)
        return next
      })
    }
    setBays((previous) => previous.map((bay, position) => (position === index ? null : bay)))
  }

  function handleActivateBay(index: number) {
    const disk = bays[index]

    if (failMode) {
      if (!disk) return
      setFailed((previous) => {
        const next = new Set(previous)
        if (next.has(disk.id)) next.delete(disk.id)
        else next.add(disk.id)
        return next
      })
      return
    }

    if (disk) {
      removeBay(index)
      return
    }

    setBays((previous) =>
      previous.map((bay, position) => (position === index ? makeDisk(brush) : bay)),
    )
  }

  function handleDropDisk(index: number, size: number) {
    if (failMode) return
    setBrush(size)
    setBays((previous) =>
      previous.map((bay, position) => (position === index ? makeDisk(size) : bay)),
    )
  }

  function handleFillEmpty() {
    setBays((previous) => previous.map((bay) => bay ?? makeDisk(brush)))
  }

  function handleClear() {
    setBays((previous) => previous.map(() => null))
    setFailed(new Set())
  }

  function handlePreset(presetSizes: number[]) {
    setBays(createBays(presetSizes.length, presetSizes))
    setBrush(presetSizes[0] ?? 8)
    setSchemeId(recommendScheme(system.id, presetSizes))
    setFailed(new Set())
    setFailMode(false)
  }

  function handleComparisonSelect(id: string) {
    setSchemeId(id)
    window.setTimeout(() => {
      document.getElementById('resultado')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 40)
  }

  function handleCrossSelect(id: SystemId) {
    handleSystemChange(id)
    window.setTimeout(() => {
      document.getElementById('discos')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 40)
  }

  function handleReset() {
    setSystemId(INITIAL_SYSTEM)
    setBays(createBays(INITIAL_BAYS, INITIAL_DISKS))
    setSchemeId('shr')
    setBrush(8)
    setUnit('tib')
    setFailMode(false)
    setFailed(new Set())
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="app" id="top">
      <a className="skip-link" href="#discos">
        Saltar a la calculadora
      </a>
      <Header unit={unit} onUnitChange={setUnit} onReset={handleReset} />
      <main>
        <Hero unit={unit} />
        <SystemPicker
          systems={SYSTEMS}
          selected={systemId}
          onSelect={handleSystemChange}
        />

        <section className="section shell workspace" id="discos" aria-labelledby="discos-title">
          <div className="section-head">
            <StepLabel number="02">Discos</StepLabel>
            <div className="section-head__row">
              <h2 id="discos-title">
                Cada bahía cuenta.
                <br />
                <span>Prueba tu combinación.</span>
              </h2>
              <p className="section-head__intro">
                Elige cuántas bahías tiene el chasis y coloca los discos. Pulsa una bahía para
                vaciarla o activa el test de fallo para ver cuánto aguanta el volumen.
              </p>
            </div>
          </div>

          <div className="workspace__grid">
            <div className="workspace__main">
              <Chassis
                system={system}
                bays={bays}
                brush={brush}
                failMode={failMode}
                failed={failed}
                onBayCount={handleBayCount}
                onActivateBay={handleActivateBay}
                onRemoveBay={removeBay}
                onDropDisk={handleDropDisk}
                onClear={handleClear}
                onToggleFailMode={() => setFailMode((value) => !value)}
              />
              <CapacityPalette
                palette={system.palette}
                brush={brush}
                onBrush={setBrush}
                onFillEmpty={handleFillEmpty}
                canFill={canFill}
                onPreset={handlePreset}
              />
              <div className="system-notes">
                <span className="micro-label">Lo que conviene saber de {system.name}</span>
                <ul>
                  {system.notes.map((note) => (
                    <li key={note}>{note}</li>
                  ))}
                </ul>
              </div>
            </div>

            <ResultPanel
              system={system}
              result={result}
              unit={unit}
              failMode={failMode}
              failedCount={failedCount}
              recommendedId={recommendedId}
              recommendedViable={
                results.find((item) => item.scheme.id === recommendedId)?.viable ?? false
              }
              onSchemeChange={setSchemeId}
            />
          </div>
        </section>

        <ComparisonTable
          system={system}
          results={results}
          unit={unit}
          selectedId={result.scheme.id}
          recommendedId={recommendedId}
          onSelect={handleComparisonSelect}
        />

        <CrossSystem
          systems={SYSTEMS}
          sizes={sizes}
          currentSystemId={systemId}
          unit={unit}
          onSelectSystem={handleCrossSelect}
        />

        <MethodSection />
      </main>
      <Footer />
    </div>
  )
}
