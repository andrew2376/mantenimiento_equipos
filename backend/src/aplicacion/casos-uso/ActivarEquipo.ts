import type {
  Equipo
} from '../../dominio/modelo/Equipo.js'

import type {
  EquipoDAO
} from '../../dominio/puertos/index.js'

import {
  EquipoNoEncontrado
} from './ConsultarEquipos.js'

export class ActivarEquipo {

  constructor(
    private readonly equipos: EquipoDAO
  ) {}

  async ejecutar(
    id: number
  ): Promise<Equipo> {

    const equipo =
      await this.equipos.porId(id)

    if (!equipo) {
      throw new EquipoNoEncontrado(id)
    }

    const actualizado: Equipo = {
      ...equipo,
      activo: true,
      updatedAt: new Date()
    }

    return this.equipos.actualizar(
      actualizado
    )
  }
}