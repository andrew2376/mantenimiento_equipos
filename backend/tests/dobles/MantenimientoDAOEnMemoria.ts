import type { Mantenimiento, MantenimientoNuevo } from '../../src/dominio/modelo/Mantenimiento.js'
import type { MantenimientoDAO } from '../../src/dominio/puertos/index.js'

export class MantenimientoDAOEnMemoria implements MantenimientoDAO {
  private mantenimientos: Mantenimiento[] = []
  private idConsecutivo = 1

  async guardar(datos: MantenimientoNuevo | Mantenimiento): Promise<Mantenimiento> {
    const id = 'id' in datos && datos.id ? datos.id : this.idConsecutivo++
    const mantenimiento: Mantenimiento = {
      ...datos,
      id,
      createdAt: new Date(),
      updatedAt: new Date()
    }
    this.mantenimientos.push(mantenimiento)
    return mantenimiento
  }

  async listar(): Promise<Mantenimiento[]> {
    return [...this.mantenimientos]
  }

  async porId(id: number): Promise<Mantenimiento | null> {
    return this.mantenimientos.find((m) => m.id === id) ?? null
  }

  async porEquipoId(equipoId: number): Promise<Mantenimiento[]> {
    return this.mantenimientos.filter((m) => m.equipoId === equipoId)
  }

  async actualizar(mantenimiento: Mantenimiento): Promise<Mantenimiento> {
    const index = this.mantenimientos.findIndex((m) => m.id === mantenimiento.id)
    if (index === -1) throw new Error('Mantenimiento no encontrado')
    this.mantenimientos[index] = { ...mantenimiento, updatedAt: new Date() }
    return this.mantenimientos[index]
  }

  async eliminar(id: number): Promise<void> {
    this.mantenimientos = this.mantenimientos.filter((m) => m.id !== id)
  }
}

