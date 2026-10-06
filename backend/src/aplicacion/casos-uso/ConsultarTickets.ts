import type { Ticket } from '../../dominio/modelo/Ticket.js'

import type { TicketDAO } from '../../dominio/puertos/index.js'

export class TicketNoEncontrado extends Error {

  constructor(
    id: string | number
  ) {

    super(
      `No se encontró el ticket con identificador: ${id}`
    )

    this.name = 'TicketNoEncontrado'
  }

}

export class ConsultarTickets {

  constructor(
    private readonly tickets: TicketDAO
  ) {}

  async porId(
    id: number
  ): Promise<Ticket> {

    const ticket = await this.tickets.porId(id)

    if (!ticket) {
      throw new TicketNoEncontrado(id)
    }

    return ticket
  }

  async listarTodos(): Promise<Ticket[]> {

    return this.tickets.todos()

  }

}