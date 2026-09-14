import type {
  Ticket
} from '../../dominio/modelo/Ticket.js'

import type {
  TicketDAO
} from '../../dominio/puertos/index.js'

import {
  TicketNoEncontrado
} from './ConsultarTickets.js'


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

    const actual =

      await this.tickets.porId(datos.id)

    if (!actual) {

      throw new TicketNoEncontrado(
        datos.id
      )

    }


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


    return this.tickets.actualizar(

      actualizado

    )

  }

}