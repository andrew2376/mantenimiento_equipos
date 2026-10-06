import type { PrismaClient } from './generado/client'

import type { EquipoModel as FilaEquipo } from './generado/models'

import type {
  Equipo,
  EquipoNuevo
} from '../../dominio/modelo/Equipo.js'

import type {
  EquipoDAO
} from '../../dominio/puertos/index.js'

const aDominio = (
  fila: FilaEquipo
): Equipo => ({
  id: fila.id,
  codigoInventario: fila.codigoInventario,
  nombre: fila.nombre,
  tipo: fila.tipo as Equipo['tipo'],
  marca: fila.marca,
  modelo: fila.modelo ?? undefined,
  numeroSerie: fila.numeroSerie ?? undefined,
  ubicacion: fila.ubicacion,
  estado: fila.estado,
  createdAt: fila.createdAt,
  updatedAt: fila.updatedAt
})

export class EquipoDAOPrisma implements EquipoDAO {

  constructor(
    private readonly prisma: PrismaClient
  ) {}

  async guardar(
    equipo: EquipoNuevo
  ): Promise<Equipo> {

    const fila =
      await this.prisma.equipo.create({
        data: {
          codigoInventario:
            equipo.codigoInventario,

          nombre:
            equipo.nombre,

          tipo:
            equipo.tipo,

          marca:
            equipo.marca,

          modelo:
            equipo.modelo ?? null,

          numeroSerie:
            equipo.numeroSerie ?? null,

          ubicacion:
            equipo.ubicacion,

          estado:
            equipo.estado
        }
      })

    return aDominio(fila)
  }

  async porId(
    id: number
  ): Promise<Equipo | null> {

    const fila =
      await this.prisma.equipo.findUnique({
        where: { id }
      })

    return fila
      ? aDominio(fila)
      : null
  }

  async todos(): Promise<Equipo[]> {

    const filas =
      await this.prisma.equipo.findMany({
        orderBy: {
          id: 'desc'
        }
      })

    return filas.map(aDominio)
  }

  async actualizar(
    equipo: Equipo
  ): Promise<Equipo> {

    const fila =
      await this.prisma.equipo.update({
        where: {
          id: equipo.id
        },

        data: {
          codigoInventario:
            equipo.codigoInventario,

          nombre:
            equipo.nombre,

          tipo:
            equipo.tipo,

          marca:
            equipo.marca,

          modelo:
            equipo.modelo ?? null,

          numeroSerie:
            equipo.numeroSerie ?? null,

          ubicacion:
            equipo.ubicacion,

          estado:
            equipo.estado
        }
      })

    return aDominio(fila)
  }

  async eliminar(
    id: number
  ): Promise<void> {

    await this.prisma.equipo.delete({
      where: { id }
    })
  }
}