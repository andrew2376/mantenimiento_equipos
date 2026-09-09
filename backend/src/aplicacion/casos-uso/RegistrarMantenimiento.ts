import type {
  Mantenimiento,
  TipoMantenimiento,
  EstadoMantenimiento
} from '../../dominio/modelo/Mantenimiento.js'

import type {
  EquipoDAO,
  MantenimientoDAO
} from '../../dominio/puertos/index.js'

export class EquipoInexistente extends Error {

  constructor(equipoId: number) {
    super(
      `No se puede registrar mantenimiento para un equipo inexistente (ID: ${equipoId})`
    )

    this.name = 'EquipoInexistente'
  }
}

export interface RegistroMantenimientoDTO {

  descripcion: string

  tipo?: TipoMantenimiento

  estado?: EstadoMantenimiento

  diagnostico?: string | null

  tecnico?: string | null

  equipoId: number
}

export class RegistrarMantenimiento {

  constructor(
    private readonly mantenimientos: MantenimientoDAO,
    private readonly equipos: EquipoDAO
  ) {}

  async ejecutar(
    datos: RegistroMantenimientoDTO
  ): Promise<Mantenimiento> {

    const equipo = await this.equipos.porId(datos.equipoId)

    if (!equipo) {
      throw new EquipoInexistente(datos.equipoId)
    }

    const nuevoMantenimiento =
      await this.mantenimientos.guardar({

        descripcion: datos.descripcion.trim(),

        tipo: datos.tipo ?? 'CORRECTIVO',

        estado: datos.estado ?? 'PENDIENTE',

        diagnostico: datos.diagnostico
          ? datos.diagnostico.trim()
          : null,

        tecnico: datos.tecnico
          ? datos.tecnico.trim()
          : null,

        equipoId: datos.equipoId
      })

    // Si el mantenimiento está activo,
    // colocamos el equipo en estado "EN MANTENIMIENTO".
    if (
      nuevoMantenimiento.estado === 'EN_PROCESO' ||
      nuevoMantenimiento.estado === 'PENDIENTE'
    ) {
      await this.equipos.actualizar({
        ...equipo,
        estado: 2
      })
    }

    return nuevoMantenimiento
  }
}