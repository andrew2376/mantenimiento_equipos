import type { PrismaClient } from './generado/client'
import type { Repuesto, RepuestoNuevo, RepuestoUsado } from '../../dominio/modelo/Repuesto.js'
import type { RepuestoDAO } from '../../dominio/puertos/index.js'

const aDominioRepuesto = (fila: any): Repuesto => ({
  id: fila.id,
  codigo: fila.codigo,
  nombre: fila.nombre,
  descripcion: fila.descripcion,
  stock: fila.stock,
  precioUnitario: Number(fila.precioUnitario),
  creadoEn: fila.creadoEn
})

const aDominioRepuestoUsado = (fila: any): RepuestoUsado => ({
  id: fila.id,
  mantenimientoId: fila.mantenimientoId,
  repuestoId: fila.repuestoId,
  cantidad: fila.cantidad,
  costoUnitario: Number(fila.costoUnitario),
  creadoEn: fila.creadoEn,
  repuestoNombre: fila.repuesto?.nombre,
  repuestoCodigo: fila.repuesto?.codigo
})

export class RepuestoDAOPrisma implements RepuestoDAO {
  constructor(private readonly prisma: PrismaClient) {}

  async guardar(repuesto: RepuestoNuevo): Promise<Repuesto> {
    const fila = await this.prisma.repuesto.create({
      data: {
        codigo: repuesto.codigo,
        nombre: repuesto.nombre,
        descripcion: repuesto.descripcion,
        stock: repuesto.stock,
        precioUnitario: repuesto.precioUnitario
      }
    })
    return aDominioRepuesto(fila)
  }

  async porId(id: number): Promise<Repuesto | null> {
    const fila = await this.prisma.repuesto.findUnique({
      where: { id }
    })
    return fila ? aDominioRepuesto(fila) : null
  }

  async porCodigo(codigo: string): Promise<Repuesto | null> {
    const fila = await this.prisma.repuesto.findUnique({
      where: { codigo }
    })
    return fila ? aDominioRepuesto(fila) : null
  }

  async todos(): Promise<Repuesto[]> {
    const filas = await this.prisma.repuesto.findMany({
      orderBy: { nombre: 'asc' }
    })
    return filas.map(aDominioRepuesto)
  }

  async actualizar(repuesto: Repuesto): Promise<Repuesto> {
    const fila = await this.prisma.repuesto.update({
      where: { id: repuesto.id },
      data: {
        codigo: repuesto.codigo,
        nombre: repuesto.nombre,
        descripcion: repuesto.descripcion,
        stock: repuesto.stock,
        precioUnitario: repuesto.precioUnitario
      }
    })
    return aDominioRepuesto(fila)
  }

  async descontarStock(id: number, cantidad: number): Promise<Repuesto> {
    const fila = await this.prisma.repuesto.update({
      where: { id },
      data: {
        stock: {
          decrement: cantidad
        }
      }
    })
    return aDominioRepuesto(fila)
  }

  async asociarAMantenimiento(
    mantenimientoId: number,
    repuestoId: number,
    cantidad: number,
    costoUnitario: number
  ): Promise<RepuestoUsado> {
    const fila = await this.prisma.repuestoMantenimiento.create({
      data: {
        mantenimientoId,
        repuestoId,
        cantidad,
        costoUnitario
      },
      include: {
        repuesto: true
      }
    })
    return aDominioRepuestoUsado(fila)
  }

  async listarPorMantenimiento(mantenimientoId: number): Promise<RepuestoUsado[]> {
    const filas = await this.prisma.repuestoMantenimiento.findMany({
      where: { mantenimientoId },
      include: {
        repuesto: true
      },
      orderBy: { creadoEn: 'desc' }
    })
    return filas.map(aDominioRepuestoUsado)
  }

  async eliminarAsociacion(id: number): Promise<void> {
    await this.prisma.repuestoMantenimiento.delete({
      where: { id }
    })
  }
}
