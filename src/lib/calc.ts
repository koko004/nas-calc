import type {
  Layout,
  OverheadConfig,
  SchemeDef,
  SchemeResult,
  SystemId,
} from '../types'

const ZERO: Layout = { usable: 0, protection: 0, unused: 0 }
const EPSILON = 0.001

const sum = (values: number[]) => values.reduce((total, value) => total + value, 0)

export function isMixed(disks: number[]): boolean {
  if (disks.length < 2) return false
  const first = disks[0]
  return disks.some((disk) => Math.abs(disk - first) > EPSILON)
}

/** RAID 5/6, RAIDZ y similares: mandan el disco más pequeño del grupo. */
export function computeMinParity(disks: number[], parity: number): Layout {
  if (disks.length === 0) return ZERO
  const smallest = Math.min(...disks)
  const total = sum(disks)
  const usable = Math.max(0, disks.length - parity) * smallest
  return {
    usable,
    protection: Math.min(parity, disks.length) * smallest,
    unused: Math.max(0, total - smallest * disks.length),
  }
}

/** Espejo por parejas (RAID 1 / RAID 10). Empareja los discos de tamaño similar. */
export function computeMirrorPairs(disks: number[]): Layout {
  const sorted = [...disks].sort((a, b) => b - a)
  let usable = 0
  let protection = 0
  let unused = 0

  for (let index = 0; index + 1 < sorted.length; index += 2) {
    const large = sorted[index]
    const small = sorted[index + 1]
    usable += small
    protection += small
    unused += large - small
  }

  if (sorted.length % 2 !== 0) unused += sorted[sorted.length - 1]

  return { usable, protection, unused }
}

/**
 * Modelo por capas de Synology SHR.
 * Cada capa horizontal de capacidad se reparte como un RAID con `parity` discos
 * de protección; las capas que no reúnen discos suficientes quedan sin usar.
 */
export function computeLayered(disks: number[], parity: number): Layout {
  if (disks.length === 0) return ZERO
  if (parity === 1 && disks.length === 1) {
    return { usable: disks[0], protection: 0, unused: 0 }
  }

  const sorted = [...disks].sort((a, b) => a - b)
  const layers = [...new Set(sorted)]
  let usable = 0
  let protection = 0
  let unused = 0
  let previous = 0

  for (const size of layers) {
    const thickness = size - previous
    const count = sorted.filter((disk) => disk >= size).length

    if (count >= parity + 1) {
      usable += (count - parity) * thickness
      protection += parity * thickness
    } else {
      unused += count * thickness
    }

    previous = size
  }

  return { usable, protection, unused }
}

/** Unraid / SnapRAID: los discos más grandes se dedican a paridad y el resto son datos completos. */
export function computeDedicatedParity(disks: number[], parity: number): Layout {
  if (disks.length === 0) return ZERO
  const sorted = [...disks].sort((a, b) => b - a)
  const parityDisks = sorted.slice(0, parity)
  const dataDisks = sorted.slice(parity)
  return {
    usable: sum(dataDisks),
    protection: sum(parityDisks),
    unused: 0,
  }
}

export function computeStripe(disks: number[]): Layout {
  return { usable: sum(disks), protection: 0, unused: 0 }
}

function invalidReason(scheme: SchemeDef, diskCount: number): string | undefined {
  if (diskCount === 0) return 'Añade al menos un disco para calcular.'
  if (diskCount < scheme.minDisks) {
    return `Necesita ${scheme.minDisks} discos como mínimo (ahora hay ${diskCount}).`
  }
  if (scheme.evenDisks && diskCount % 2 !== 0) {
    return 'Necesita un número par de discos.'
  }
  return undefined
}

function buildWarnings(
  scheme: SchemeDef,
  result: Omit<SchemeResult, 'warnings'>,
): string[] {
  const warnings: string[] = []
  const sizes = result.diskSizes

  if (!result.viable) return warnings

  if (isMixed(sizes) && scheme.kind === 'parity-min') {
    warnings.push(
      'Con discos de distinto tamaño, este RAID usa la capacidad del más pequeño en cada disco y desperdicia el resto. SHR, Unraid o SnapRAID aprovechan mejor la mezcla.',
    )
  }

  if (result.unused > 0.01 && scheme.kind === 'mirror') {
    warnings.push(
      'Con un número impar de discos (o parejas desiguales), una parte queda fuera del espejo y no se puede usar en este volumen.',
    )
  }

  if (scheme.id.includes('raidz1') && sizes.length >= 5 && Math.max(...sizes) >= 8) {
    warnings.push(
      'RAIDZ1 con discos grandes y 5 o más unidades tiene un riesgo alto de no sobrevivir a la reconstrucción. Para dados importantes, RAIDZ2 es más prudente.',
    )
  }

  if (scheme.kind === 'parity-dedicated' && result.protection === 0) {
    warnings.push('No hay discos de paridad en esta configuración.')
  }

  return warnings
}

export function calculateScheme(
  scheme: SchemeDef,
  diskSizes: number[],
  overhead: OverheadConfig,
): SchemeResult {
  const sizes = diskSizes.filter((size) => Number.isFinite(size) && size > 0)
  const raw = sum(sizes)
  const systemReserve = (overhead.systemPerDiskGB / 1000) * sizes.length
  const effective = sizes.map((size) => Math.max(0, size - overhead.systemPerDiskGB / 1000))
  const layout = effective.length > 0 ? scheme.compute(effective) : ZERO
  const fsReserved = layout.usable * (overhead.fsPct / 100)
  const usable = Math.max(0, layout.usable - fsReserved)
  const reserved = fsReserved + systemReserve
  const invalid = invalidReason(scheme, sizes.length)

  const base: Omit<SchemeResult, 'warnings'> = {
    scheme,
    viable: !invalid,
    invalidReason: invalid,
    diskSizes: sizes,
    raw,
    usable: invalid ? 0 : usable,
    protection: invalid ? 0 : layout.protection,
    reserved: invalid ? systemReserve : reserved,
    unused: invalid ? 0 : layout.unused,
    fsReserved: invalid ? 0 : fsReserved,
    systemReserved: systemReserve,
    efficiency: !invalid && raw > 0 ? usable / raw : 0,
    tolerance: invalid ? 0 : scheme.tolerance(sizes.length),
  }

  return {
    ...base,
    warnings: buildWarnings(scheme, base),
  }
}

export function recommendScheme(systemId: SystemId, diskSizes: number[]): string {
  const count = diskSizes.length
  const mixed = isMixed(diskSizes)

  if (count === 0) {
    if (systemId === 'unraid') return 'parity1'
    if (systemId === 'fnos') return 'raid5'
    if (systemId === 'qnap' || systemId === 'truenas') return 'raidz1'
    if (systemId === 'omv') return 'raid5'
    return 'shr'
  }

  switch (systemId) {
    case 'synology':
      return 'shr'
    case 'truenas':
    case 'qnap': {
      if (count === 1) return 'stripe'
      if (count === 2) return 'mirror'
      if (mixed) {
        const candidates = [
          { id: 'mirror', layout: computeMirrorPairs(diskSizes), min: 2 },
          { id: 'raidz1', layout: computeMinParity(diskSizes, 1), min: 3 },
          { id: 'raidz2', layout: computeMinParity(diskSizes, 2), min: 4 },
        ].filter((candidate) => count >= candidate.min)
        candidates.sort(
          (a, b) =>
            b.layout.usable - a.layout.usable ||
            a.layout.unused - b.layout.unused ||
            b.layout.protection - a.layout.protection,
        )
        return candidates[0].id
      }
      if (count <= 4) return 'raidz1'
      return 'raidz2'
    }
    case 'unraid':
      if (count === 1) return 'noparity'
      if (count >= 5) return 'parity2'
      return 'parity1'
    case 'omv':
      if (count === 1) return 'single'
      if (mixed) return 'snapraid1'
      if (count === 2) return 'raid1'
      if (count >= 5) return 'raid6'
      return 'raid5'
    case 'fnos':
      if (count === 1) return 'single'
      if (count === 2) return 'raid1'
      if (count >= 5) return 'raid6'
      return 'raid5'
  }
}
