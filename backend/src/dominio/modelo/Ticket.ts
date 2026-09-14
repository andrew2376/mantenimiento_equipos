export const PRIORIDADES_TICKET = [
  'BAJA',
  'MEDIA',
  'ALTA',
  'CRITICA'
] as const

export type PrioridadTicket =
  (typeof PRIORIDADES_TICKET)[number]

/**
 * Estados permitidos para un ticket.
 */
export const ESTADOS_TICKET = [
  'ABIERTO',
  'ASIGNADO',
  'EN_DIAGNOSTICO',
  'EN_MANTENIMIENTO',
  'RESUELTO',
  'CERRADO',
  'CANCELADO'
] as const

export type EstadoTicket =
  (typeof ESTADOS_TICKET)[number]

/**
 * Información resumida del equipo relacionado.
 */
export interface EquipoTicket {
  id: number
  codigoInventario: string
  nombre: string
}

/**
 * Información resumida del usuario relacionado.
 */
export interface UsuarioTicket {
  id: number
  nombre: string
}

/**
 * Entidad de Dominio: Ticket de mantenimiento.
 */
export interface Ticket {
  id: number
  titulo: string
  descripcion: string
  prioridad: PrioridadTicket
  estado: EstadoTicket

  equipoId: number
  solicitanteId: number
  tecnicoId?: number

  equipo?: EquipoTicket
  solicitante?: UsuarioTicket
  tecnico?: UsuarioTicket

  fechaCierre?: Date
  creadoEn: Date
  actualizadoEn: Date
}

/**
 * Estructura para registrar un nuevo ticket.
 * El DAO asigna id, fechas y relaciones.
 */
export type TicketNuevo = Omit<
  Ticket,
  'id' | 'creadoEn' | 'actualizadoEn'
>

/**
 * DTO que viaja al exterior por HTTP.
 */
export interface TicketDTO {
  id: number
  titulo: string
  descripcion: string
  prioridad: PrioridadTicket
  estado: EstadoTicket

  equipoId: number
  solicitanteId: number
  tecnicoId?: number

  equipo?: EquipoTicket
  solicitante?: UsuarioTicket
  tecnico?: UsuarioTicket

  fechaCierre?: string
  creadoEn: string
  actualizadoEn: string
}

export function esPrioridadTicket(
  valor: unknown
): valor is PrioridadTicket {
  return PRIORIDADES_TICKET.includes(
    valor as PrioridadTicket
  )
}

export function esEstadoTicket(
  valor: unknown
): valor is EstadoTicket {
  return ESTADOS_TICKET.includes(
    valor as EstadoTicket
  )
}

export function aTicketDTO(
  ticket: Ticket
): TicketDTO {
  return {
    id: ticket.id,
    titulo: ticket.titulo,
    descripcion: ticket.descripcion,
    prioridad: ticket.prioridad,
    estado: ticket.estado,

    equipoId: ticket.equipoId,
    solicitanteId: ticket.solicitanteId,
    tecnicoId: ticket.tecnicoId,

    equipo: ticket.equipo,
    solicitante: ticket.solicitante,
    tecnico: ticket.tecnico,

    fechaCierre:
      ticket.fechaCierre?.toISOString(),

    creadoEn:
      ticket.creadoEn.toISOString(),

    actualizadoEn:
      ticket.actualizadoEn.toISOString()
  }
}