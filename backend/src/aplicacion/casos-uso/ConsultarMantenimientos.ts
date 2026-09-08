import type { Mantenimiento } from '../../dominio/modelo/Mantenimiento'
import type { MantenimientoDAO, EquipoDAO } from '../../dominio/puertos'
import { EquipoNoEncontrado } from './ConsultarEquipos'

export class MantenimientoNoEncontrado extends Error {
  constructor(id: number) {
    super(`No se encontró el registro de mantenimiento con ID: ${id}`)
    this.name = 'MantenimientoNoEncontrado'
  }
}

export class ConsultarMantenimientos {
  constructor(
    private readonly mantenimientos: MantenimientoDAO,
    private readonly equipos: EquipoDAO,
  ) {}

  async porId(id: number): Promise<Mantenimiento> {
    const m = await this.mantenimientos.porId(id)
    if (!m) throw new MantenimientoNoEncontrado(id)
    return m
  }

  async historialPorEquipo(equipoId: number): Promise<Mantenimiento[]> {
    const equipo = await this.equipos.porId(equipoId)
    if (!equipo) throw new EquipoNoEncontrado(equipoId)
    return this.mantenimientos.listarPorEquipo(equipoId)
  }

  async listarTodos(): Promise<Mantenimiento[]> {
    return this.mantenimientos.listar()
  }
}
