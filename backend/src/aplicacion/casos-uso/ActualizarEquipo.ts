import type {
  Equipo
} from '../../dominio/modelo/Equipo.js'

import type {
  EquipoDAO
} from '../../dominio/puertos/index.js'

import {
  EquipoNoEncontrado
} from './ConsultarEquipos.js'


export interface ActualizarEquipoDTO {

  id: number

  codigoInventario?: string

  nombre?: string

  tipo?: Equipo['tipo']

  marca?: string

  modelo?: string | null

  numeroSerie?: string | null

  ubicacion?: string

  estado?: number

}


export class ActualizarEquipo {

  constructor(
    private readonly equipos: EquipoDAO
  ) {}


  async ejecutar(
    datos: ActualizarEquipoDTO
  ): Promise<Equipo> {

    const actual =
      await this.equipos.porId(datos.id)

    if (!actual) {

      throw new EquipoNoEncontrado(
        datos.id
      )

    }


    const actualizado: Equipo = {

      ...actual,

      codigoInventario:
        datos.codigoInventario
          ?.trim()
          .toUpperCase()
        ?? actual.codigoInventario,

      nombre:
        datos.nombre?.trim()
        ?? actual.nombre,

      tipo:
        datos.tipo
        ?? actual.tipo,

      marca:
        datos.marca?.trim()
        ?? actual.marca,

      modelo:
        datos.modelo !== undefined
          ? datos.modelo?.trim() || undefined
          : actual.modelo,

      numeroSerie:
        datos.numeroSerie !== undefined
          ? datos.numeroSerie
              ?.trim()
              .toUpperCase() || undefined
          : actual.numeroSerie,

      ubicacion:
        datos.ubicacion?.trim()
        ?? actual.ubicacion,

      estado:
        datos.estado
        ?? actual.estado,

      updatedAt:
        new Date()

    }


    return this.equipos.actualizar(
      actualizado
    )

  }

}