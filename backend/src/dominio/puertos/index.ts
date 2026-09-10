import type {
  Equipo,
  EquipoNuevo
} from '../modelo/Equipo.js'

import type {
  Mantenimiento,
  MantenimientoNuevo,
  EstadoMantenimiento
} from '../modelo/Mantenimiento.js'

import type {
  Usuario,
  UsuarioNuevo
} from '../modelo/Usuario.js'

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
  diagnostico?: string
  tecnico?: string
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

export interface ServicioClaves {
  generarHash(clave: string): Promise<string>

  comparar(
    clave: string,
    hash: string
  ): Promise<boolean>
}