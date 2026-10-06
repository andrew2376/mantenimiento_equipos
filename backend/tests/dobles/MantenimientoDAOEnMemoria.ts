import type { Mantenimiento, MantenimientoNuevo } from '../../src/dominio/modelo/Mantenimiento'
import type { ActualizarMantenimientoDatos, MantenimientoDAO } from '../../src/dominio/puertos'

export class MantenimientoDAOEnMemoria implements MantenimientoDAO {
  private idAutoincrement = 1
  public readonly registros: Map<number, Mantenimiento> = new Map()

  async guardar(m: MantenimientoNuevo): Promise<Mantenimiento> {
    const id = this.idAutoincrement++
    const nuevo: Mantenimiento = {
      id,
      descripcion: m.descripcion,
      tipo: m.tipo,
      estado: m.estado,
      diagnostico: m.diagnostico,
      tecnico: m.tecnico,
      fecha: new Date(),
      equipoId: m.equipoId,
    }
    this.registros.set(id, nuevo)
    return nuevo
  }

  async porId(id: number): Promise<Mantenimiento | null> {
    return this.registros.get(id) ?? null
  }

  async listarPorEquipo(equipoId: number): Promise<Mantenimiento[]> {
    return Array.from(this.registros.values())
      .filter((m) => m.equipoId === equipoId)
      .reverse()
  }

  async listar(): Promise<Mantenimiento[]> {
    return Array.from(this.registros.values()).reverse()
  }

  async actualizar(id: number, datos: ActualizarMantenimientoDatos): Promise<Mantenimiento | null> {
    const actual = this.registros.get(id)
    if (!actual) return null

    const actualizado: Mantenimiento = {
      ...actual,
      estado: datos.estado ?? actual.estado,
      diagnostico: datos.diagnostico !== undefined ? datos.diagnostico : actual.diagnostico,
      tecnico: datos.tecnico !== undefined ? datos.tecnico : actual.tecnico,
    }
    this.registros.set(id, actualizado)
    return actualizado
  }
}
