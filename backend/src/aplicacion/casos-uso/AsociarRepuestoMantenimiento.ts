import type { MantenimientoRepuesto } from '../../dominio/modelo/Repuesto.js'
import type { MantenimientoDAO, RepuestoDAO } from '../../dominio/puertos/index.js'
import { MantenimientoNoEncontrado } from './ConsultarMantenimientos.js'
import { RepuestoNoEncontrado } from './GestionarRepuestos.js'

export class StockInsuficiente extends Error {
  constructor(nombre: string, stock: number, cantidad: number) {
    super(`Stock insuficiente para "${nombre}". Disponible: ${stock}, solicitado: ${cantidad}`)
    this.name = 'StockInsuficiente'
  }
}

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

    const cantidad = dto.cantidad > 0 ? dto.cantidad : 1

    if (repuesto.stock < cantidad) {
      throw new StockInsuficiente(repuesto.nombre, repuesto.stock, cantidad)
    }

    const costoFinal = dto.costoUnitario ?? repuesto.costoUnitario

    const asociacion = await this.repuestos.asociarAMantenimiento({
      mantenimientoId: dto.mantenimientoId,
      repuestoId: dto.repuestoId,
      cantidad,
      costoUnitario: costoFinal
    })

    // Descontar del inventario institucional
    await this.repuestos.actualizar(repuesto.id, {
      stock: repuesto.stock - cantidad
    })

    return asociacion
  }

  async listarPorMantenimiento(mantenimientoId: number): Promise<MantenimientoRepuesto[]> {
    return this.repuestos.listarPorMantenimiento(mantenimientoId)
  }

  async eliminar(id: number): Promise<boolean> {
    const asignacion = await this.repuestos.asociacionPorId(id)
    if (!asignacion) return false

    const ok = await this.repuestos.eliminarDeMantenimiento(id)
    if (ok) {
      const repuesto = await this.repuestos.porId(asignacion.repuestoId)
      if (repuesto) {
        // Restaurar inventario institucional
        await this.repuestos.actualizar(repuesto.id, {
          stock: repuesto.stock + asignacion.cantidad
        })
      }
    }
    return ok
  }
}
