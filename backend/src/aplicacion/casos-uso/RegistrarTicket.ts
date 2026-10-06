import type {
  Ticket,
  TicketNuevo,
  PrioridadTicket
} from '../../dominio/modelo/Ticket.js'

import type {
  TicketDAO
} from '../../dominio/puertos/index.js'

export interface RegistroTicketDTO {

  titulo: string

  descripcion: string

  prioridad?: PrioridadTicket

  equipoId: number

  solicitanteId: number

  tecnicoId?: number
}

export class RegistrarTicket {

  constructor(
    private readonly tickets: TicketDAO
  ) {}

  async ejecutar(
    datos: RegistroTicketDTO
  ): Promise<Ticket> {

    const nuevoTicket: TicketNuevo = {

      titulo: datos.titulo.trim(),

      descripcion: datos.descripcion.trim(),

      prioridad: datos.prioridad ?? 'MEDIA',

      estado: 'ABIERTO',

      equipoId: datos.equipoId,

      solicitanteId: datos.solicitanteId,

      tecnicoId: datos.tecnicoId

    }

    return this.tickets.guardar(nuevoTicket)
  }

}