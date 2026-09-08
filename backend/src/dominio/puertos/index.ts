import type { Equipo, EquipoNuevo, EstadoEquipo } from '../modelo/Equipo'
import type { Mantenimiento, MantenimientoNuevo, EstadoMantenimiento } from '../modelo/Mantenimiento'

// Puertos de Dominio: Contratos que deben satisfacer los adaptadores de infraestructura

export interface EquipoDAO {
  guardar(equipo: EquipoNuevo): Promise<Equipo>
  porId(id: number): Promise<Equipo | null>
  porSerial(serial: string): Promise<Equipo | null>
  listar(): Promise<Equipo[]>
  actualizarEstado(id: number, estado: EstadoEquipo): Promise<Equipo | null>
}

export interface ActualizarMantenimientoDatos {
  estado?: EstadoMantenimiento
  diagnostico?: string
  tecnico?: string
}

export interface MantenimientoDAO {
  guardar(mantenimiento: MantenimientoNuevo): Promise<Mantenimiento>
  porId(id: number): Promise<Mantenimiento | null>
  listarPorEquipo(equipoId: number): Promise<Mantenimiento[]>
  listar(): Promise<Mantenimiento[]>
  actualizar(id: number, datos: ActualizarMantenimientoDatos): Promise<Mantenimiento | null>
}
