import type {
  Equipo,
  EquipoNuevo
} from '../modelo/Equipo.js'

import type {
  Mantenimiento,
  MantenimientoNuevo,
  EstadoMantenimiento,
  TipoMantenimiento
} from '../modelo/Mantenimiento.js'

import type {
  Usuario,
  UsuarioNuevo
} from '../modelo/Usuario.js'

import type {
  Ticket,
  TicketNuevo
} from '../modelo/Ticket.js'

import type {
  Repuesto,
  RepuestoNuevo,
  MantenimientoRepuesto,
  MantenimientoRepuestoNuevo
} from '../modelo/Repuesto.js'

/**
 * Puertos de Dominio:
 * Contratos que deben satisfacer los adaptadores
 * de infraestructura.
 */

export interface EquipoDAO {

  guardar(
    equipo: EquipoNuevo
  ): Promise<Equipo>

  porId(
    id: number
  ): Promise<Equipo | null>

  todos(): Promise<Equipo[]>

  actualizar(
    equipo: Equipo
  ): Promise<Equipo>

  eliminar(
    id: number
  ): Promise<void>
}

export interface UsuarioDAO {

  guardar(
    usuario: UsuarioNuevo
  ): Promise<Usuario>

  porId(
    id: number
  ): Promise<Usuario | null>

  porCorreo(
    correo: string
  ): Promise<Usuario | null>

  todos(): Promise<Usuario[]>

  actualizar(
    usuario: Usuario
  ): Promise<Usuario>
}

export interface ActualizarMantenimientoDatos {

  estado?: EstadoMantenimiento

  diagnostico?: string | null

  tecnico?: string | null

  descripcion?: string

  tipo?: TipoMantenimiento

  equipoId?: number

  ticketId?: number | null
}

export interface MantenimientoDAO {

  guardar(
    mantenimiento: MantenimientoNuevo
  ): Promise<Mantenimiento>

  porId(
    id: number
  ): Promise<Mantenimiento | null>

  listarPorEquipo(
    equipoId: number
  ): Promise<Mantenimiento[]>

  listar(): Promise<Mantenimiento[]>

  actualizar(
    id: number,
    datos: ActualizarMantenimientoDatos
  ): Promise<Mantenimiento | null>
}

export interface TicketDAO {

  guardar(
    ticket: TicketNuevo
  ): Promise<Ticket>

  porId(
    id: number
  ): Promise<Ticket | null>

  todos(): Promise<Ticket[]>

  actualizar(
    ticket: Ticket
  ): Promise<Ticket>
}

export interface ServicioClaves {

  generarHash(
    clave: string
  ): Promise<string>

  comparar(
    clave: string,
    hash: string
  ): Promise<boolean>
}

export interface RepuestoDAO {
  guardar(repuesto: RepuestoNuevo): Promise<Repuesto>
  porId(id: number): Promise<Repuesto | null>
  porCodigo(codigo: string): Promise<Repuesto | null>
  todos(): Promise<Repuesto[]>
  actualizar(id: number, datos: Partial<RepuestoNuevo>): Promise<Repuesto | null>
  asociarAMantenimiento(datos: MantenimientoRepuestoNuevo): Promise<MantenimientoRepuesto>
  asociacionPorId(id: number): Promise<MantenimientoRepuesto | null>
  listarPorMantenimiento(mantenimientoId: number): Promise<MantenimientoRepuesto[]>
  eliminarDeMantenimiento(id: number): Promise<boolean>
}