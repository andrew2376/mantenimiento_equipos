import type {
  Ticket
} from '../../dominio/modelo/Ticket.js'

import type {
  TicketDAO
} from '../../dominio/puertos/index.js'

import {
  TicketNoEncontrado
} from './ConsultarTickets.js'



const TRANSICIONES_PERMITIDAS: Record<
  Ticket['estado'],
  readonly Ticket['estado'][]
> = {
  ABIERTO: [
    'ASIGNADO',
    'CANCELADO'
  ],

  ASIGNADO: [
    'EN_DIAGNOSTICO',
    'CANCELADO'
  ],

  EN_DIAGNOSTICO: [
    'ASIGNADO',
    'EN_MANTENIMIENTO',
    'RESUELTO',
    'CANCELADO'
  ],

  EN_MANTENIMIENTO: [
    'EN_DIAGNOSTICO',
    'RESUELTO',
    'CANCELADO'
  ],

  RESUELTO: [
    'EN_DIAGNOSTICO',
    'CERRADO'
  ],

  CERRADO: [],

  CANCELADO: []
}


export class TransicionEstadoTicketInvalida extends Error {

  constructor(
    public readonly estadoActual: Ticket['estado'],
    public readonly estadoSolicitado: Ticket['estado']
  ) {
    super(
      `No se permite cambiar el estado del ticket ` +
      `de ${estadoActual} a ${estadoSolicitado}`
    )

    this.name = 'TransicionEstadoTicketInvalida'
  }

}

function validarTransicionEstado(
  estadoActual: Ticket['estado'],
  estadoSolicitado: Ticket['estado']
): void {

  // Mantener el mismo estado no constituye una transición.
  if (estadoActual === estadoSolicitado) {
    return
  }

  const estadosPermitidos =
    TRANSICIONES_PERMITIDAS[estadoActual]

  if (!estadosPermitidos.includes(estadoSolicitado)) {
    throw new TransicionEstadoTicketInvalida(
      estadoActual,
      estadoSolicitado
    )
  }

}

export interface ActualizarTicketDTO {

  id: number

  titulo?: string

  descripcion?: string

  prioridad?: Ticket['prioridad']

  estado?: Ticket['estado']

  equipoId?: number

  solicitanteId?: number

  tecnicoId?: number | null

  fechaCierre?: Date | null

}


export class ActualizarTicket {

  constructor(
    private readonly tickets: TicketDAO
  ) {}


  async ejecutar(
    datos: ActualizarTicketDTO
  ): Promise<Ticket> {

    // 1. Consultar el ticket existente.
    const actual =
      await this.tickets.porId(datos.id)

    if (!actual) {
      throw new TicketNoEncontrado(
        datos.id
      )
    }

    // 2. Validar el cambio de estado solicitado.
    if (datos.estado !== undefined) {

      validarTransicionEstado(
        actual.estado,
        datos.estado
      )

    }

    // 3. Construir el ticket actualizado.
    const actualizado: Ticket = {

      ...actual,

      titulo:
        datos.titulo?.trim()
        ?? actual.titulo,

      descripcion:
        datos.descripcion?.trim()
        ?? actual.descripcion,

      prioridad:
        datos.prioridad
        ?? actual.prioridad,

      estado:
        datos.estado
        ?? actual.estado,

      equipoId:
        datos.equipoId
        ?? actual.equipoId,

      solicitanteId:
        datos.solicitanteId
        ?? actual.solicitanteId,

      tecnicoId:
        datos.tecnicoId !== undefined
          ? datos.tecnicoId ?? undefined
          : actual.tecnicoId,

      fechaCierre:
        datos.fechaCierre !== undefined
          ? datos.fechaCierre ?? undefined
          : actual.fechaCierre,

      actualizadoEn:
        new Date()

    }

    // 4. Persistir únicamente si pasó las validaciones.
    return this.tickets.actualizar(
      actualizado
    )

  }

}