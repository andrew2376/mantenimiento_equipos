import type { MantenimientoRepuesto } from '../../dominio/modelo/Repuesto.js'
import type { MantenimientoDAO, RepuestoDAO } from '../../dominio/puertos/index.js'
import { MantenimientoNoEncontrado } from './ConsultarMantenimientos.js'
import { RepuestoNoEncontrado } from './GestionarRepuestos.js'

export interface AsociarRepuestoDTO {
  mantenimientoId: number
  repuestoId: number
  cantidad: number
  costoUnitario?: number
}

export class AsociarRepuestoMantenimiento {
  constructor(
    private readonly mantenimientos: MantenimientoDAO,
    private readonly repuestos: RepuestoDAO
  ) {}

  async ejecutar(dto: AsociarRepuestoDTO): Promise<MantenimientoRepuesto> {
    const mantenimiento = await this.mantenimientos.porId(dto.mantenimientoId)
    if (!mantenimiento) {
      throw new MantenimientoNoEncontrado(dto.mantenimientoId)
    }

    const repuesto = await this.repuestos.porId(dto.repuestoId)
    if (!repuesto) {
      throw new RepuestoNoEncontrado(dto.repuestoId)
    }

    const costoFinal = dto.costoUnitario ?? repuesto.costoUnitario

    return this.repuestos.asociarAMantenimiento({
      mantenimientoId: dto.mantenimientoId,
      repuestoId: dto.repuestoId,
      cantidad: dto.cantidad > 0 ? dto.cantidad : 1,
      costoUnitario: costoFinal
    })
  }

  async listarPorMantenimiento(mantenimientoId: number): Promise<MantenimientoRepuesto[]> {
    return this.repuestos.listarPorMantenimiento(mantenimientoId)
  }

  async eliminar(id: number): Promise<boolean> {
    return this.repuestos.eliminarDeMantenimiento(id)
  }
}
