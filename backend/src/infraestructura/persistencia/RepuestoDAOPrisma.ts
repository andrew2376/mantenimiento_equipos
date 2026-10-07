import type { PrismaClient } from './generado/client'
import type {
  RepuestoModel as FilaRepuesto,
  MantenimientoRepuestoModel as FilaMantenimientoRepuesto
} from './generado/models'
import type {
  Repuesto,
  RepuestoNuevo,
  MantenimientoRepuesto,
  MantenimientoRepuestoNuevo
} from '../../dominio/modelo/Repuesto.js'
import type { RepuestoDAO } from '../../dominio/puertos/index.js'

const aDominio = (fila: FilaRepuesto): Repuesto => ({
  id: fila.id,
  nombre: fila.nombre,
  codigo: fila.codigo,
  descripcion: fila.descripcion,
  costoUnitario: Number(fila.costoUnitario),
  stock: fila.stock,
  activo: fila.activo,
  creadoEn: fila.creadoEn
})

const aDominioMR = (
  fila: FilaMantenimientoRepuesto & { repuesto?: FilaRepuesto }
): MantenimientoRepuesto => ({
  id: fila.id,
  mantenimientoId: fila.mantenimientoId,
  repuestoId: fila.repuestoId,
  cantidad: fila.cantidad,
  costoUnitario: Number(fila.costoUnitario),
  creadoEn: fila.creadoEn,
  repuesto: fila.repuesto ? aDominio(fila.repuesto) : undefined
})

export class RepuestoDAOPrisma implements RepuestoDAO {
  constructor(private readonly prisma: PrismaClient) {}

  async guardar(repuesto: RepuestoNuevo): Promise<Repuesto> {
    const fila = await this.prisma.repuesto.create({
      data: {
        nombre: repuesto.nombre,
        codigo: repuesto.codigo,
        descripcion: repuesto.descripcion ?? null,
        costoUnitario: repuesto.costoUnitario,
        stock: repuesto.stock,
        activo: repuesto.activo
      }
    })
    return aDominio(fila)
  }

  async porId(id: number): Promise<Repuesto | null> {
    const fila = await this.prisma.repuesto.findUnique({
      where: { id }
    })
    return fila ? aDominio(fila) : null
  }

  async porCodigo(codigo: string): Promise<Repuesto | null> {
    const fila = await this.prisma.repuesto.findUnique({
      where: { codigo }
    })
    return fila ? aDominio(fila) : null
  }

  async todos(): Promise<Repuesto[]> {
    const filas = await this.prisma.repuesto.findMany({
      orderBy: { nombre: 'asc' }
    })
    return filas.map(aDominio)
  }

  async actualizar(id: number, datos: Partial<RepuestoNuevo>): Promise<Repuesto | null> {
    try {
      const fila = await this.prisma.repuesto.update({
        where: { id },
        data: {
          ...(datos.nombre !== undefined && { nombre: datos.nombre }),
          ...(datos.codigo !== undefined && { codigo: datos.codigo }),
          ...(datos.descripcion !== undefined && { descripcion: datos.descripcion }),
          ...(datos.costoUnitario !== undefined && { costoUnitario: datos.costoUnitario }),
          ...(datos.stock !== undefined && { stock: datos.stock }),
          ...(datos.activo !== undefined && { activo: datos.activo })
        }
      })
      return aDominio(fila)
    } catch {
      return null
    }
  }

  async asociarAMantenimiento(datos: MantenimientoRepuestoNuevo): Promise<MantenimientoRepuesto> {
    const fila = await this.prisma.mantenimientoRepuesto.create({
      data: {
        mantenimientoId: datos.mantenimientoId,
        repuestoId: datos.repuestoId,
        cantidad: datos.cantidad,
        costoUnitario: datos.costoUnitario
      },
      include: {
        repuesto: true
      }
    })
    return aDominioMR(fila)
  }

  async asociacionPorId(id: number): Promise<MantenimientoRepuesto | null> {
    const fila = await this.prisma.mantenimientoRepuesto.findUnique({
      where: { id },
      include: {
        repuesto: true
      }
    })
    return fila ? aDominioMR(fila) : null
  }

  async listarPorMantenimiento(mantenimientoId: number): Promise<MantenimientoRepuesto[]> {
    const filas = await this.prisma.mantenimientoRepuesto.findMany({
      where: { mantenimientoId },
      include: {
        repuesto: true
      },
      orderBy: { creadoEn: 'asc' }
    })
    return filas.map(aDominioMR)
  }

  async eliminarDeMantenimiento(id: number): Promise<boolean> {
    try {
      await this.prisma.mantenimientoRepuesto.delete({
        where: { id }
      })
      return true
    } catch {
      return false
    }
  }
}
