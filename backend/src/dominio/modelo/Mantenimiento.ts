export const TIPOS_MANTENIMIENTO = ['PREVENTIVO', 'CORRECTIVO'] as const
export type TipoMantenimiento = (typeof TIPOS_MANTENIMIENTO)[number]

export const ESTADOS_MANTENIMIENTO = ['SOLICITADO', 'EN_PROCESO', 'FINALIZADO', 'CANCELADO'] as const
export type EstadoMantenimiento = (typeof ESTADOS_MANTENIMIENTO)[number]

/**
 * Entidad del dominio: Mantenimiento / Solicitud de Servicio Técnico.
 * Sin sufijo: concepto del negocio.
 */
export interface Mantenimiento {
  id: number
  equipoId: number
  solicitante: string
  tecnicoAsignado?: string
  tipo: TipoMantenimiento | string
  descripcionFalla: string
  diagnostico?: string
  actividadesRealizadas?: string
  repuestosUtilizados?: string
  estado: EstadoMantenimiento | string
  fechaSolicitud: Date
  fechaFinalizacion?: Date
  createdAt?: Date
  updatedAt?: Date
}

/** Estructura para registrar un nuevo mantenimiento. */
export type MantenimientoNuevo = Omit<Mantenimiento, 'id' | 'createdAt' | 'updatedAt'>

/** Formato de transporte que cruza la frontera HTTP. */
export interface MantenimientoDTO {
  id: number
  equipoId: number
  solicitante: string
  tecnicoAsignado?: string
  tipo: string
  descripcionFalla: string
  diagnostico?: string
  actividadesRealizadas?: string
  repuestosUtilizados?: string
  estado: string
  fechaSolicitud: Date
  fechaFinalizacion?: Date
  createdAt?: Date
  updatedAt?: Date
}

export function aMantenimientoDTO(mantenimiento: Mantenimiento): MantenimientoDTO {
  return {
    id: mantenimiento.id,
    equipoId: mantenimiento.equipoId,
    solicitante: mantenimiento.solicitante,
    tecnicoAsignado: mantenimiento.tecnicoAsignado,
    tipo: mantenimiento.tipo,
    descripcionFalla: mantenimiento.descripcionFalla,
    diagnostico: mantenimiento.diagnostico,
    actividadesRealizadas: mantenimiento.actividadesRealizadas,
    repuestosUtilizados: mantenimiento.repuestosUtilizados,
    estado: mantenimiento.estado,
    fechaSolicitud: mantenimiento.fechaSolicitud,
    fechaFinalizacion: mantenimiento.fechaFinalizacion,
    createdAt: mantenimiento.createdAt,
    updatedAt: mantenimiento.updatedAt
  }
}
