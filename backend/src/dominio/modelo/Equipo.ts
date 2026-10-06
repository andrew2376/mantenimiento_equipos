export const TIPOS_EQUIPO = [
  'PORTATIL',
  'ESCRITORIO',
  'SERVIDOR',
  'TODO_EN_UNO',
  'OTRO'
] as const

export type TipoEquipo = (typeof TIPOS_EQUIPO)[number]

/**
 * Entidad de Dominio: Equipo de Cómputo
 */
export interface Equipo {
  id: number
  codigoInventario: string
  nombre: string
  tipo: TipoEquipo
  marca: string
  modelo?: string
  numeroSerie?: string
  ubicacion: string
  estado: number
  createdAt: Date
  updatedAt: Date
}

/**
 * Estructura para registrar un nuevo equipo.
 * El DAO asigna id y fechas.
 */
export type EquipoNuevo = Omit<
  Equipo,
  'id' | 'createdAt' | 'updatedAt'
>

/**
 * DTO que viaja al exterior por HTTP.
 */
export interface EquipoDTO {
  id: number
  codigoInventario: string
  nombre: string
  tipo: TipoEquipo
  marca: string
  modelo?: string
  numeroSerie?: string
  ubicacion: string
  estado: number
  createdAt: string
  updatedAt: string
}

export function esTipoEquipo(
  valor: unknown
): valor is TipoEquipo {
  return TIPOS_EQUIPO.includes(valor as TipoEquipo)
}

export function aEquipoDTO(
  equipo: Equipo
): EquipoDTO {
  return {
    id: equipo.id,
    codigoInventario: equipo.codigoInventario,
    nombre: equipo.nombre,
    tipo: equipo.tipo,
    marca: equipo.marca,
    modelo: equipo.modelo,
    numeroSerie: equipo.numeroSerie,
    ubicacion: equipo.ubicacion,
    estado: equipo.estado,
    createdAt: equipo.createdAt.toISOString(),
    updatedAt: equipo.updatedAt.toISOString()
  }
}