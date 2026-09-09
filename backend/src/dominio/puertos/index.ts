import type {
  Equipo,
  EquipoNuevo
} from '../modelo/Equipo.js'

import type {
  Mantenimiento,
  MantenimientoNuevo,
  EstadoMantenimiento
} from '../modelo/Mantenimiento.js'

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