import type { RepuestoUsado } from '../../dominio/modelo/Repuesto.js'
import type { MantenimientoDAO, RepuestoDAO } from '../../dominio/puertos/index.js'
import { MantenimientoNoEncontrado } from './ConsultarMantenimientos.js'
import { RepuestoNoEncontrado } from './ConsultarRepuestos.js'

export class StockInsuficiente extends Error {
  constructor(nombre: string, stock: number, solicitado: number) {
    super(`Stock insuficiente para "${nombre}". Disponible: ${stock}, solicitado: ${solicitado}`)
    this.name = 'StockInsuficiente'
  }
}

export interface AsignacionRepuestoDTO {
  mantenimientoId: number
  repuestoId: number
  cantidad: number
}

export class AsignarRepuestosAMantenimiento {
  constructor(
    private readonly mantenimientoDAO: MantenimientoDAO,
    private readonly repuestoDAO: RepuestoDAO
  ) {}

  async ejecutar(datos: AsignacionRepuestoDTO): Promise<RepuestoUsado> {
    const cantidad = Number(datos.cantidad)
    if (isNaN(cantidad) || cantidad <= 0) {
      throw new Error('La cantidad debe ser un número entero positivo')
    }

    const mantenimiento = await this.mantenimientoDAO.porId(datos.mantenimientoId)
    if (!mantenimiento) {
      throw new MantenimientoNoEncontrado(datos.mantenimientoId)
    }

    const repuesto = await this.repuestoDAO.porId(datos.repuestoId)
    if (!repuesto) {
      throw new RepuestoNoEncontrado(datos.repuestoId)
    }

    if (repuesto.stock < cantidad) {
      throw new StockInsuficiente(repuesto.nombre, repuesto.stock, cantidad)
    }

    // Descontar del inventario
    await this.repuestoDAO.descontarStock(repuesto.id, cantidad)

    // Asociar a la orden de mantenimiento con el precio unitario actual
    return this.repuestoDAO.asociarAMantenimiento(
      mantenimiento.id,
      repuesto.id,
      cantidad,
      repuesto.precioUnitario
    )
  }

  async listarPorMantenimiento(mantenimientoId: number): Promise<RepuestoUsado[]> {
    return this.repuestoDAO.listarPorMantenimiento(mantenimientoId)
  }
}
