import { Equipo } from '../modelo/Equipo.js'

export interface EquipoRepository {
  crear(equipo: Equipo): Promise<Equipo>
  obtenerTodos(): Promise<Equipo[]>
  obtenerPorId(id: number): Promise<Equipo | null>
  actualizar(equipo: Equipo): Promise<Equipo>
  eliminar(id: number): Promise<void>
}