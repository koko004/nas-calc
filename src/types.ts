export type Unit = 'tib' | 'tb'

export type SystemId =
  | 'synology'
  | 'truenas'
  | 'unraid'
  | 'omv'
  | 'fnos'
  | 'qnap'

export type SchemeKind =
  | 'flex'
  | 'mirror'
  | 'parity-min'
  | 'parity-dedicated'
  | 'stripe'
  | 'single'

export interface Layout {
  usable: number
  protection: number
  unused: number
}

export interface SchemeDef {
  id: string
  name: string
  tag: string
  summary: string
  minDisks: number
  evenDisks?: boolean
  kind: SchemeKind
  /** Fallos simultáneos que el sistema garantiza tolerar. */
  tolerance: (diskCount: number) => number
  compute: (disks: number[]) => Layout
  caveat?: string
}

export interface OverheadConfig {
  /** Porcentaje del volumen útil que se reserva el filesystem. */
  fsPct: number
  /** GB decimales reservados por disco para el sistema operativo. */
  systemPerDiskGB: number
  fsLabel: string
  systemLabel: string
  description: string
}

export interface SystemDef {
  id: SystemId
  name: string
  shortName: string
  product: string
  tagline: string
  description: string
  glyph: string
  schemes: SchemeDef[]
  palette: number[]
  defaultBays: number
  defaultDisks: number[]
  defaultScheme: string
  overhead: OverheadConfig
  notes: string[]
}

export interface Disk {
  id: string
  size: number
}

export interface SchemeResult {
  scheme: SchemeDef
  viable: boolean
  invalidReason?: string
  diskSizes: number[]
  raw: number
  usable: number
  protection: number
  reserved: number
  unused: number
  fsReserved: number
  systemReserved: number
  efficiency: number
  tolerance: number
  warnings: string[]
}
