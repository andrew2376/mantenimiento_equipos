import type {
  Repuesto,
  RepuestoNuevo,
  MantenimientoRepuesto,
  MantenimientoRepuestoNuevo
} from '../../src/dominio/modelo/Repuesto'
import type { RepuestoDAO } from '../../src/dominio/puertos'

export class RepuestoDAOEnMemoria implements RepuestoDAO {
  private idRepuestoAuto = 1
  private idMantRepAuto = 1
  public readonly repuestos: Map<number, Repuesto> = new Map()
  public readonly asignaciones: Map<number, MantenimientoRepuesto> = new Map()

  async guardar(r: RepuestoNuevo): Promise<Repuesto> {
    const id = this.idRepuestoAuto++
    const nuevo: Repuesto = {
      id,
      nombre: r.nombre,
      codigo: r.codigo,
      descripcion: r.descripcion ?? null,
      costoUnitario: r.costoUnitario,
      stock: r.stock,
      activo: r.activo,
      creadoEn: new Date()
    }
    this.repuestos.set(id, nuevo)
    return nuevo
  }

  async porId(id: number): Promise<Repuesto | null> {
    return this.repuestos.get(id) ?? null
  }

  async porCodigo(codigo: string): Promise<Repuesto | null> {
    for (const r of this.repuestos.values()) {
      if (r.codigo === codigo) return r
    }
    return null
  }

  async todos(): Promise<Repuesto[]> {
    return Array.from(this.repuestos.values())
  }

  async actualizar(id: number, datos: Partial<RepuestoNuevo>): Promise<Repuesto | null> {
    const actual = this.repuestos.get(id)
    if (!actual) return null
    const actualizado: Repuesto = {
      ...actual,
      ...datos
    }
    this.repuestos.set(id, actualizado)
    return actualizado
  }

  async asociarAMantenimiento(datos: MantenimientoRepuestoNuevo): Promise<MantenimientoRepuesto> {
    const id = this.idMantRepAuto++
    const repuesto = await this.porId(datos.repuestoId)
    const nuevo: MantenimientoRepuesto = {
      id,
      mantenimientoId: datos.mantenimientoId,
      repuestoId: datos.repuestoId,
      cantidad: datos.cantidad,
      costoUnitario: datos.costoUnitario,
      creadoEn: new Date(),
      repuesto: repuesto ?? undefined
    }
    this.asignaciones.set(id, nuevo)
    return nuevo
  }

  async asociacionPorId(id: number): Promise<MantenimientoRepuesto | null> {
    return this.asignaciones.get(id) ?? null
  }

  async listarPorMantenimiento(mantenimientoId: number): Promise<MantenimientoRepuesto[]> {
    return Array.from(this.asignaciones.values()).filter(
      (a) => a.mantenimientoId === mantenimientoId
    )
  }

  async eliminarDeMantenimiento(id: number): Promise<boolean> {
    return this.asignaciones.delete(id)
  }
}
