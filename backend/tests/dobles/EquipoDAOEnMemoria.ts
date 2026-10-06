import type { Equipo, EquipoNuevo, EstadoEquipo } from '../../src/dominio/modelo/Equipo'
import type { EquipoDAO } from '../../src/dominio/puertos'

export class EquipoDAOEnMemoria implements EquipoDAO {
  private idAutoincrement = 1
  public readonly registros: Map<number, Equipo> = new Map()

  async guardar(equipo: EquipoNuevo): Promise<Equipo> {
    const id = this.idAutoincrement++
    const nuevo: Equipo = {
      id,
      serial: equipo.serial,
      nombre: equipo.nombre,
      tipo: equipo.tipo,
      ubicacion: equipo.ubicacion,
      estado: equipo.estado,
      creadoEn: new Date(),
    }
    this.registros.set(id, nuevo)
    return nuevo
  }

  async porId(id: number): Promise<Equipo | null> {
    return this.registros.get(id) ?? null
  }

  async porSerial(serial: string): Promise<Equipo | null> {
    for (const eq of this.registros.values()) {
      if (eq.serial.toUpperCase() === serial.toUpperCase()) {
        return eq
      }
    }
    return null
  }

  async listar(): Promise<Equipo[]> {
    return Array.from(this.registros.values()).reverse()
  }

  async actualizarEstado(id: number, estado: EstadoEquipo): Promise<Equipo | null> {
    const eq = this.registros.get(id)
    if (!eq) return null
    const actualizado = { ...eq, estado }
    this.registros.set(id, actualizado)
    return actualizado
  }
}
