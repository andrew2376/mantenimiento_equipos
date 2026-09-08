export const ESTADOS_EQUIPO = ['OPERATIVO', 'EN_MANTENIMIENTO', 'DE_BAJA', 'EN_REPARACION'] as const
export type EstadoEquipo = (typeof ESTADOS_EQUIPO)[number]

export const TIPOS_EQUIPO = ['PORTATIL', 'ESCRITORIO', 'TODO_EN_UNO', 'SERVIDOR', 'IMPRESORA', 'OTRO'] as const
export type TipoEquipo = (typeof TIPOS_EQUIPO)[number]

/**
 * Entidad del dominio: Equipo de Cómputo.
 * Sin sufijo: representa el concepto central del negocio.
 */
export interface Equipo {
  id: number
  codigoInventario: string
  nombre: string
  tipo: TipoEquipo | string
  marca: string
  modelo?: string
  numeroSerie?: string
  ubicacion: string
  estado: EstadoEquipo | string
  createdAt?: Date
  updatedAt?: Date
}

/** Estructura para crear un nuevo equipo (el DAO asigna el ID y fechas). */
export type EquipoNuevo = Omit<Equipo, 'id' | 'createdAt' | 'updatedAt'>

/** Formato de transporte que cruza la frontera HTTP. */
export interface EquipoDTO {
  id: number
  codigoInventario: string
  nombre: string
  tipo: string
  marca: string
  modelo?: string
  numeroSerie?: string
  ubicacion: string
  estado: string
  createdAt?: Date
  updatedAt?: Date
}

export function aEquipoDTO(equipo: Equipo): EquipoDTO {
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
    createdAt: equipo.createdAt,
    updatedAt: equipo.updatedAt
  }
}