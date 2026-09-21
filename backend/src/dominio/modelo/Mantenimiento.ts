export const TIPOS_MANTENIMIENTO = ['PREVENTIVO', 'CORRECTIVO'] as const
export type TipoMantenimiento = (typeof TIPOS_MANTENIMIENTO)[number]

export const ESTADOS_MANTENIMIENTO = ['PENDIENTE', 'EN_PROCESO', 'FINALIZADO', 'CANCELADO'] as const
export type EstadoMantenimiento = (typeof ESTADOS_MANTENIMIENTO)[number]

/** Entidad de Dominio: Mantenimiento / Solicitud de Mantenimiento */
export interface Mantenimiento {
  id: number
  descripcion: string
  tipo: TipoMantenimiento
  estado: EstadoMantenimiento
  diagnostico: string | null
  tecnico: string | null
  fecha: Date
  equipoId: number
  ticketId?: number | null
  equipoNombre?: string
  equipoCodigo?: string
  ticketTitulo?: string
}

/** Estructura para registrar un nuevo mantenimiento */
export type MantenimientoNuevo = Omit<Mantenimiento, 'id' | 'fecha'>

/** DTO que viaja al exterior */
export interface MantenimientoDTO {
  id: number
  descripcion: string
  tipo: TipoMantenimiento
  estado: EstadoMantenimiento
  diagnostico: string | null
  tecnico: string | null
  fecha: string
  equipoId: number
  ticketId: number | null
  equipoNombre?: string
  equipoCodigo?: string
  ticketTitulo?: string
}

export function esTipoMantenimiento(valor: unknown): valor is TipoMantenimiento {
  return TIPOS_MANTENIMIENTO.includes(valor as TipoMantenimiento)
}

export function esEstadoMantenimiento(valor: unknown): valor is EstadoMantenimiento {
  return ESTADOS_MANTENIMIENTO.includes(valor as EstadoMantenimiento)
}

export function aMantenimientoDTO(m: Mantenimiento): MantenimientoDTO {
  return {
    id: m.id,
    descripcion: m.descripcion,
    tipo: m.tipo,
    estado: m.estado,
    diagnostico: m.diagnostico,
    tecnico: m.tecnico,
    fecha: m.fecha.toISOString(),
    equipoId: m.equipoId,
    ticketId: m.ticketId ?? null,
    equipoNombre: m.equipoNombre,
    equipoCodigo: m.equipoCodigo,
    ticketTitulo: m.ticketTitulo,
  }
}

