import type { MantenimientoDTO } from '../../dominio/modelo/Mantenimiento.js'
import { aMantenimientoDTO } from '../../dominio/modelo/Mantenimiento.js'
import type { MantenimientoDAO } from '../../dominio/puertos/index.js'

export class ObtenerMantenimientos {
  constructor(private readonly mantenimientoDAO: MantenimientoDAO) {}

  async ejecutar(): Promise<MantenimientoDTO[]> {
    const mantenimientos = await this.mantenimientoDAO.listar()
    return mantenimientos.map(aMantenimientoDTO)
  }

  async ejecutarPorEquipo(equipoId: number): Promise<MantenimientoDTO[]> {
    const mantenimientos = await this.mantenimientoDAO.porEquipoId(equipoId)
    return mantenimientos.map(aMantenimientoDTO)
  }

  async ejecutarPorId(id: number): Promise<MantenimientoDTO | null> {
    const mantenimiento = await this.mantenimientoDAO.porId(id)
    return mantenimiento ? aMantenimientoDTO(mantenimiento) : null
  }
}

export { ObtenerMantenimientos as ListarMantenimientos }
