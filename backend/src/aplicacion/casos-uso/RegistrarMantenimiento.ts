import type { Mantenimiento, MantenimientoNuevo, MantenimientoDTO } from '../../dominio/modelo/Mantenimiento.js'
import { aMantenimientoDTO } from '../../dominio/modelo/Mantenimiento.js'
import type { MantenimientoDAO } from '../../dominio/puertos/index.js'

export class RegistrarMantenimiento {
  constructor(private readonly mantenimientoDAO: MantenimientoDAO) {}

  async ejecutar(datos: MantenimientoNuevo | Mantenimiento): Promise<MantenimientoDTO> {
    const mantenimiento = await this.mantenimientoDAO.guardar(datos)
    return aMantenimientoDTO(mantenimiento)
  }
}
