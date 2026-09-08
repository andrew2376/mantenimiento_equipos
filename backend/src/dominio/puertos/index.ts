// Puertos: lo que el dominio necesita del exterior, en su propio vocabulario.
// - `...DAO`  → contratos de acceso a datos.
// - `...DTO`  → estructuras de datos en tránsito.

import type { Equipo, EquipoNuevo } from '../modelo/Equipo.js'
import type { Mantenimiento, MantenimientoNuevo } from '../modelo/Mantenimiento.js'

export interface EquipoDAO {
  guardar(equipo: EquipoNuevo | Equipo): Promise<Equipo>
  listar(): Promise<Equipo[]>
  porId(id: number): Promise<Equipo | null>
  porCodigoInventario?(codigo: string): Promise<Equipo | null>
  actualizar(equipo: Equipo): Promise<Equipo>
  eliminar(id: number): Promise<void>
}

export interface MantenimientoDAO {
  guardar(mantenimiento: MantenimientoNuevo | Mantenimiento): Promise<Mantenimiento>
  listar(): Promise<Mantenimiento[]>
  porId(id: number): Promise<Mantenimiento | null>
  porEquipoId(equipoId: number): Promise<Mantenimiento[]>
  actualizar(mantenimiento: Mantenimiento): Promise<Mantenimiento>
  eliminar(id: number): Promise<void>
}

