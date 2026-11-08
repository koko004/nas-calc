import { describe, expect, it } from 'vitest'
import {
  calculateScheme,
  computeDedicatedParity,
  computeLayered,
  computeMinParity,
  computeMirrorPairs,
  isMixed,
  recommendScheme,
} from './calc'
import { SYSTEMS, getSystem } from '../data/systems'
import type { OverheadConfig } from '../types'

const NO_OVERHEAD: OverheadConfig = {
  fsPct: 0,
  systemPerDiskGB: 0,
  fsLabel: '',
  systemLabel: '',
  description: '',
}

const sumLayout = (layout: { usable: number; protection: number; unused: number }) =>
  layout.usable + layout.protection + layout.unused

const round = (value: number) => Math.round(value * 1000) / 1000

describe('layouts', () => {
  it('RAID 5 reparte paridad y usa el disco más pequeño', () => {
    expect(computeMinParity([4, 4, 4, 4], 1)).toEqual({
      usable: 12,
      protection: 4,
      unused: 0,
    })
    const mixed = computeMinParity([8, 4, 4], 1)
    expect(mixed).toEqual({ usable: 8, protection: 4, unused: 4 })
    expect(sumLayout(mixed)).toBe(16)
  })

  it('RAID 6 necesita dos discos de paridad', () => {
    expect(computeMinParity([6, 6, 6, 6, 6], 2)).toEqual({
      usable: 18,
      protection: 12,
      unused: 0,
    })
  })

  it('los espejos emparejan discos similares y no inventan capacidad', () => {
    expect(computeMirrorPairs([4, 4])).toEqual({
      usable: 4,
      protection: 4,
      unused: 0,
    })
    expect(computeMirrorPairs([8, 4])).toEqual({
      usable: 4,
      protection: 4,
      unused: 4,
    })
    expect(computeMirrorPairs([4, 4, 4])).toEqual({
      usable: 4,
      protection: 4,
      unused: 4,
    })
  })

  it('SHR aprovecha los discos mixtos por capas', () => {
    expect(computeLayered([8, 4], 1)).toEqual({
      usable: 4,
      protection: 4,
      unused: 4,
    })
    expect(computeLayered([8, 8, 4], 1)).toEqual({
      usable: 12,
      protection: 8,
      unused: 0,
    })
    expect(computeLayered([8, 4, 4], 1)).toEqual({
      usable: 8,
      protection: 4,
      unused: 4,
    })
    expect(computeLayered([4, 4, 4, 4], 1)).toEqual({
      usable: 12,
      protection: 4,
      unused: 0,
    })
  })

  it('SHR-2 reserva dos discos por capa', () => {
    expect(computeLayered([4, 4, 4, 4], 2)).toEqual({
      usable: 8,
      protection: 8,
      unused: 0,
    })
    const mixed = computeLayered([8, 8, 4, 4], 2)
    expect(sumLayout(mixed)).toBe(24)
    expect(mixed.usable).toBe(8)
    expect(mixed.unused).toBe(8)
  })

  it('Unraid dedica los discos mayores a paridad', () => {
    expect(computeDedicatedParity([4, 8, 4], 1)).toEqual({
      usable: 8,
      protection: 8,
      unused: 0,
    })
    expect(computeDedicatedParity([8, 8, 4, 4], 2)).toEqual({
      usable: 8,
      protection: 16,
      unused: 0,
    })
  })

  it('detecta mezclas de tamaño', () => {
    expect(isMixed([8, 8, 8])).toBe(false)
    expect(isMixed([8, 4, 4])).toBe(true)
  })
})

describe('calculateScheme', () => {
  it('descuenta sistema y filesystem sin romper el total', () => {
    const synology = getSystem('synology')
    const shr = synology.schemes.find((scheme) => scheme.id === 'shr')!
    const result = calculateScheme(shr, [8, 8, 8, 8], synology.overhead)

    expect(result.viable).toBe(true)
    expect(result.raw).toBe(32)
    expect(round(result.usable)).toBe(23.011)
    expect(round(result.protection)).toBe(7.99)
    expect(round(result.reserved)).toBe(0.999)
    expect(round(result.usable + result.protection + result.reserved + result.unused)).toBe(32)
    expect(result.tolerance).toBe(1)
  })

  it('marca configuraciones no viables y no muestra capacidad', () => {
    const synology = getSystem('synology')
    const shr2 = synology.schemes.find((scheme) => scheme.id === 'shr2')!
    const result = calculateScheme(shr2, [4, 4, 4], synology.overhead)
    expect(result.viable).toBe(false)
    expect(result.usable).toBe(0)
    expect(result.invalidReason).toContain('4 discos')
  })

  it('exige número par en RAID 10', () => {
    const omv = getSystem('omv')
    const raid10 = omv.schemes.find((scheme) => scheme.id === 'raid10')!
    const result = calculateScheme(raid10, [4, 4, 4, 4, 4], NO_OVERHEAD)
    expect(result.viable).toBe(false)
    expect(result.invalidReason).toContain('par')
  })

  it('avisa cuando un RAID clásico desperdicia discos mixtos', () => {
    const truenas = getSystem('truenas')
    const raidz1 = truenas.schemes.find((scheme) => scheme.id === 'raidz1')!
    const result = calculateScheme(raidz1, [8, 4, 4], truenas.overhead)
    expect(result.unused).toBeGreaterThan(0)
    expect(result.warnings.join(' ')).toContain('distinto tamaño')
  })
})

describe('recomendaciones', () => {
  it('recomienda SHR en Synology', () => {
    expect(recommendScheme('synology', [8, 4, 4])).toBe('shr')
  })

  it('recomienda RAIDZ2 en TrueNAS a partir de 5 discos', () => {
    expect(recommendScheme('truenas', [8, 8, 8, 8])).toBe('raidz1')
    expect(recommendScheme('truenas', [8, 8, 8, 8, 8])).toBe('raidz2')
  })

  it('recomienda espejos en ZFS cuando los discos mixtos rinden igual', () => {
    expect(recommendScheme('truenas', [8, 8, 4, 4])).toBe('mirror')
    expect(recommendScheme('truenas', [8, 4, 4])).toBe('raidz1')
    expect(recommendScheme('qnap', [8, 8, 4, 4])).toBe('mirror')
  })

  it('recomienda SnapRAID en OMV con discos mixtos', () => {
    expect(recommendScheme('omv', [8, 4, 4])).toBe('snapraid1')
    expect(recommendScheme('omv', [4, 4, 4, 4])).toBe('raid5')
  })

  it('recomienda doble paridad en Unraid con 5 o más discos', () => {
    expect(recommendScheme('unraid', [4, 4, 4])).toBe('parity1')
    expect(recommendScheme('unraid', [4, 4, 4, 4, 4])).toBe('parity2')
  })

  it('todas las recomendaciones existen en su sistema', () => {
    for (const system of SYSTEMS) {
      for (let count = 0; count <= 12; count += 1) {
        const id = recommendScheme(system.id, Array.from({ length: count }, () => 4))
        expect(
          system.schemes.some((scheme) => scheme.id === id),
          `${system.name} no tiene el esquema ${id}`,
        ).toBe(true)
      }
    }
  })
})
