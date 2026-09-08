import type { PrismaClient, Equipo as FilaEquipo } from '@prisma/client'
import type { Equipo, EquipoNuevo, EstadoEquipo, TipoEquipo } from '../../dominio/modelo/Equipo'
import type { EquipoDAO } from '../../dominio/puertos'

const aDominio = (fila: FilaEquipo): Equipo => ({
  id: fila.id,
  serial: fila.serial,
  nombre: fila.nombre,
  tipo: fila.tipo as TipoEquipo,
  ubicacion: fila.ubicacion,
  estado: fila.estado as EstadoEquipo,
  creadoEn: fila.creadoEn,
})

export class EquipoDAOPrisma implements EquipoDAO {
  constructor(private readonly prisma: PrismaClient) {}

  async guardar(equipo: EquipoNuevo): Promise<Equipo> {
    const fila = await this.prisma.equipo.create({
      data: {
        serial: equipo.serial,
        nombre: equipo.nombre,
        tipo: equipo.tipo,
        ubicacion: equipo.ubicacion,
        estado: equipo.estado,
      },
    })
    return aDominio(fila)
  }

  async porId(id: number): Promise<Equipo | null> {
    const fila = await this.prisma.equipo.findUnique({
      where: { id },
    })
    return fila ? aDominio(fila) : null
  }

  async porSerial(serial: string): Promise<Equipo | null> {
    const fila = await this.prisma.equipo.findUnique({
      where: { serial },
    })
    return fila ? aDominio(fila) : null
  }

  async listar(): Promise<Equipo[]> {
    const filas = await this.prisma.equipo.findMany({
      orderBy: { id: 'desc' },
    })
    return filas.map(aDominio)
  }

  async actualizarEstado(id: number, estado: EstadoEquipo): Promise<Equipo | null> {
    try {
      const fila = await this.prisma.equipo.update({
        where: { id },
        data: { estado },
      })
      return aDominio(fila)
    } catch {
      return null
    }
  }
}
