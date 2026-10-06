import type {
  Equipo,
  EquipoNuevo,
  TipoEquipo
} from '../../dominio/modelo/Equipo.js'

import type { EquipoDAO } from '../../dominio/puertos/index.js'

export class NumeroSerieYaRegistrado extends Error {

  constructor(numeroSerie: string) {
    super(
      `Ya existe un equipo registrado con el número de serie: ${numeroSerie}`
    )

    this.name = 'NumeroSerieYaRegistrado'
  }
}

export interface RegistroEquipoDTO {

  codigoInventario: string

  nombre: string

  tipo?: TipoEquipo

  marca: string

  modelo?: string

  numeroSerie?: string

  ubicacion: string

  estado?: number
}

export class RegistrarEquipo {

  constructor(
    private readonly equipos: EquipoDAO
  ) {}

  async ejecutar(
    datos: RegistroEquipoDTO
  ): Promise<Equipo> {

    const numeroSerie = datos.numeroSerie
      ?.trim()
      .toUpperCase()

    if (numeroSerie) {

      const equipos = await this.equipos.todos()

      const existente = equipos.find(
        equipo =>
          equipo.numeroSerie?.toUpperCase() === numeroSerie
      )

      if (existente) {
        throw new NumeroSerieYaRegistrado(numeroSerie)
      }
    }

    const nuevoEquipo: EquipoNuevo = {

      codigoInventario: datos.codigoInventario
        .trim()
        .toUpperCase(),

      nombre: datos.nombre.trim(),

      tipo: datos.tipo ?? 'PORTATIL',

      marca: datos.marca.trim(),

      modelo: datos.modelo?.trim() || undefined,

      numeroSerie,

      ubicacion: datos.ubicacion.trim(),

      estado: datos.estado ?? 1
    }

    return this.equipos.guardar(nuevoEquipo)
  }
}