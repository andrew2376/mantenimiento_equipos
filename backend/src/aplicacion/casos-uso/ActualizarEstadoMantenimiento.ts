import type {
  EstadoMantenimiento,
  Mantenimiento
} from '../../dominio/modelo/Mantenimiento.js'

import type {
  EquipoDAO,
  MantenimientoDAO
} from '../../dominio/puertos/index.js'

import { MantenimientoNoEncontrado } from './ConsultarMantenimientos.js'

export interface ActualizarMantenimientoDTO {

  id: number

  estado?: EstadoMantenimiento

  diagnostico?: string

  tecnico?: string
}

export class ActualizarEstadoMantenimiento {

  constructor(
    private readonly mantenimientos: MantenimientoDAO,
    private readonly equipos: EquipoDAO
  ) {}

  async ejecutar(
    datos: ActualizarMantenimientoDTO
  ): Promise<Mantenimiento> {

    const actual = await this.mantenimientos.porId(datos.id)

    if (!actual) {
      throw new MantenimientoNoEncontrado(datos.id)
    }

    const actualizado = await this.mantenimientos.actualizar(
      datos.id,
      {
        estado: datos.estado,
        diagnostico: datos.diagnostico,
        tecnico: datos.tecnico
      }
    )

    if (!actualizado) {
      throw new MantenimientoNoEncontrado(datos.id)
    }

    // Si se finaliza o cancela el mantenimiento,
    // verificamos si el equipo ya no tiene mantenimientos activos.
    if (
      datos.estado === 'FINALIZADO' ||
      datos.estado === 'CANCELADO'
    ) {

      const historial =
        await this.mantenimientos.listarPorEquipo(
          actual.equipoId
        )

      const tieneActivos = historial.some(
        (m) =>
          m.id !== datos.id &&
          (
            m.estado === 'PENDIENTE' ||
            m.estado === 'EN_PROCESO'
          )
      )

      if (!tieneActivos) {

        const equipo =
          await this.equipos.porId(actual.equipoId)

        if (equipo) {

          await this.equipos.actualizar({
            ...equipo,
            estado: 1
          })

        }
      }
    }

    return actualizado
  }
}