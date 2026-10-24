import type { Equipo, EquipoNuevo } from '../../src/dominio/modelo/Equipo'
import type { EquipoDAO } from '../../src/dominio/puertos'

export class EquipoDAOEnMemoria implements EquipoDAO {
  private idAutoincrement = 1
  public readonly registros: Map<number, Equipo> = new Map()

  async guardar(equipo: EquipoNuevo): Promise<Equipo> {
    const id = this.idAutoincrement++
    const ahora = new Date()
    const nuevo: Equipo = {
      id,
      codigoInventario: equipo.codigoInventario,
      nombre: equipo.nombre,
      tipo: equipo.tipo ?? 'OTRO',
      marca: equipo.marca,
      modelo: equipo.modelo,
      numeroSerie: equipo.numeroSerie,
      ubicacion: equipo.ubicacion,
      estado: equipo.estado ?? 1,
      activo: equipo.activo ?? true,
      createdAt: ahora,
      updatedAt: ahora
    }
    this.registros.set(id, nuevo)
    return nuevo
  }

  async porId(id: number): Promise<Equipo | null> {
    return this.registros.get(id) ?? null
  }

  async porSerial(serial: string): Promise<Equipo | null> {
    for (const eq of this.registros.values()) {
      if (eq.numeroSerie?.toUpperCase() === serial.toUpperCase()) {
        return eq
      }
    }
    return null
  }

  async todos(): Promise<Equipo[]> {
    return Array.from(this.registros.values())
  }

  async listar(): Promise<Equipo[]> {
    return Array.from(this.registros.values()).reverse()
  }

  async actualizar(equipo: Equipo): Promise<Equipo> {
    const actual = this.registros.get(equipo.id)
    if (!actual) {
      throw new Error(`Equipo con ID ${equipo.id} no encontrado`)
    }
    const actualizado: Equipo = {
      ...actual,
      ...equipo,
      updatedAt: new Date()
    }
    this.registros.set(equipo.id, actualizado)
    return actualizado
  }

  async eliminar(id: number): Promise<void> {
    this.registros.delete(id)
  }
}
