import type { Equipo } from '../../dominio/modelo/Equipo.js'

import type { EquipoDAO } from '../../dominio/puertos/index.js'

export class EquipoNoEncontrado extends Error {

  constructor(
    idOIdentificador: string | number
  ) {
    super(
      `No se encontró el equipo con identificador: ${idOIdentificador}`
    )

    this.name = 'EquipoNoEncontrado'
  }
}

export class ConsultarEquipos {

  constructor(
    private readonly equipos: EquipoDAO
  ) {}

  async porId(
    id: number
  ): Promise<Equipo> {

    const equipo = await this.equipos.porId(id)

    if (!equipo) {
      throw new EquipoNoEncontrado(id)
    }

    return equipo
  }

  async porSerial(
    numeroSerie: string
  ): Promise<Equipo> {

    const serie = numeroSerie
      .trim()
      .toUpperCase()

    const equipos = await this.equipos.todos()

    const equipo = equipos.find(
      (item) =>
        item.numeroSerie?.toUpperCase() === serie
    )

    if (!equipo) {
      throw new EquipoNoEncontrado(numeroSerie)
    }

    return equipo
  }

  async listarTodos(): Promise<Equipo[]> {
    return this.equipos.todos()
  }
}