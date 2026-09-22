import type { PrismaClient } from './generado/client'

import type {
  MantenimientoModel as FilaMantenimiento
} from './generado/models'

import type {
  Mantenimiento,
  MantenimientoNuevo,
  EstadoMantenimiento,
  TipoMantenimiento
} from '../../dominio/modelo/Mantenimiento.js'

import type {
  ActualizarMantenimientoDatos,
  MantenimientoDAO
} from '../../dominio/puertos/index.js'

const aDominio = (
  fila: FilaMantenimiento
): Mantenimiento => ({
  id: fila.id,
  descripcion: fila.descripcion,
  tipo: fila.tipo as TipoMantenimiento,
  estado: fila.estado as EstadoMantenimiento,
  diagnostico: fila.diagnostico,
  tecnico: fila.tecnico,
  fecha: fila.fecha,
  equipoId: fila.equipoId
})

export class MantenimientoDAOPrisma
  implements MantenimientoDAO {

  constructor(
    private readonly prisma: PrismaClient
  ) {}

  async guardar(
    m: MantenimientoNuevo
  ): Promise<Mantenimiento> {

    const fila =
      await this.prisma.mantenimiento.create({
        data: {
          descripcion: m.descripcion,
          tipo: m.tipo,
          estado: m.estado,
          diagnostico: m.diagnostico,
          tecnico: m.tecnico,
          equipoId: m.equipoId
        }
      })

    return aDominio(fila)
  }

  async porId(
    id: number
  ): Promise<Mantenimiento | null> {

    const fila =
      await this.prisma.mantenimiento.findUnique({
        where: { id }
      })

    return fila
      ? aDominio(fila)
      : null
  }

  async listarPorEquipo(
    equipoId: number
  ): Promise<Mantenimiento[]> {

    const filas =
      await this.prisma.mantenimiento.findMany({
        where: { equipoId },
        orderBy: {
          fecha: 'desc'
        }
      })

    return filas.map(aDominio)
  }

  async listar(): Promise<Mantenimiento[]> {

    const filas =
      await this.prisma.mantenimiento.findMany({
        orderBy: {
          fecha: 'desc'
        }
      })

    return filas.map(aDominio)
  }

  async actualizar(
    id: number,
    datos: ActualizarMantenimientoDatos
  ): Promise<Mantenimiento | null> {

    try {

      const fila =
        await this.prisma.mantenimiento.update({
          where: { id },

          data: {
            ...(datos.estado !== undefined
              ? { estado: datos.estado }
              : {}),

            ...(datos.diagnostico !== undefined
              ? { diagnostico: datos.diagnostico }
              : {}),

            ...(datos.tecnico !== undefined
              ? { tecnico: datos.tecnico }
              : {})
          }
        })

      return aDominio(fila)

    } catch {

      return null
    }
  }
}