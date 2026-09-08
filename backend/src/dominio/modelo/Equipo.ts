export const TIPOS_EQUIPO = ['PORTATIL', 'ESCRITORIO', 'SERVIDOR', 'TODO_EN_UNO', 'OTRO'] as const
export type TipoEquipo = (typeof TIPOS_EQUIPO)[number]

export const ESTADOS_EQUIPO = ['OPERATIVO', 'EN_MANTENIMIENTO', 'DE_BAJA', 'EN_REVISION'] as const
export type EstadoEquipo = (typeof ESTADOS_EQUIPO)[number]

/** Entidad de Dominio: Equipo de Cómputo */
export interface Equipo {
  id: number
  serial: string
  nombre: string
  tipo: TipoEquipo
  ubicacion: string
  estado: EstadoEquipo
  creadoEn: Date
}

/** Estructura para registrar un nuevo equipo (el DAO asigna id y fecha) */
export type EquipoNuevo = Omit<Equipo, 'id' | 'creadoEn'>

/** DTO que viaja al exterior por HTTP */
export interface EquipoDTO {
  id: number
  serial: string
  nombre: string
  tipo: TipoEquipo
  ubicacion: string
  estado: EstadoEquipo
  creadoEn: string
}

export function esTipoEquipo(valor: unknown): valor is TipoEquipo {
  return TIPOS_EQUIPO.includes(valor as TipoEquipo)
}

export function esEstadoEquipo(valor: unknown): valor is EstadoEquipo {
  return ESTADOS_EQUIPO.includes(valor as EstadoEquipo)
}

export function aEquipoDTO(equipo: Equipo): EquipoDTO {
  return {
    id: equipo.id,
    serial: equipo.serial,
    nombre: equipo.nombre,
    tipo: equipo.tipo,
    ubicacion: equipo.ubicacion,
    estado: equipo.estado,
    creadoEn: equipo.creadoEn.toISOString(),
  }
}