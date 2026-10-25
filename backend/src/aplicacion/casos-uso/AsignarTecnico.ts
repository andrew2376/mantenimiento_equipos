import type { Ticket } from '../../dominio/modelo/Ticket.js'
import type { TicketDAO, UsuarioDAO } from '../../dominio/puertos/index.js'

import { TicketNoEncontrado } from './ConsultarTickets.js'

export class TecnicoNoEncontrado extends Error {
  constructor(id: number) {
    super(`No existe un técnico con ID ${id}`)
    this.name = 'TecnicoNoEncontrado'
  }
}

export class UsuarioNoEsTecnico extends Error {
  constructor(id: number) {
    super(`El usuario con ID ${id} no tiene el rol TECNICO`)
    this.name = 'UsuarioNoEsTecnico'
  }
}

export class TecnicoInactivo extends Error {
  constructor(id: number) {
    super(`El técnico con ID ${id} está inactivo`)
    this.name = 'TecnicoInactivo'
  }
}

export interface AsignarTecnicoDTO {
  ticketId: number
  tecnicoId: number
}

export class AsignarTecnico {
  constructor(
    private readonly tickets: TicketDAO,
    private readonly usuarios: UsuarioDAO
  ) {}

  async ejecutar(datos: AsignarTecnicoDTO): Promise<Ticket> {
    // 1. Verificar que el ticket exista.
    const ticket = await this.tickets.porId(datos.ticketId)

    if (!ticket) {
      throw new TicketNoEncontrado(datos.ticketId)
    }

    // 2. Verificar que el usuario exista.
    const usuario = await this.usuarios.porId(datos.tecnicoId)

    if (!usuario) {
      throw new TecnicoNoEncontrado(datos.tecnicoId)
    }

    // 3. Verificar que tenga el rol de técnico.
    if (usuario.rol !== 'TECNICO') {
      throw new UsuarioNoEsTecnico(datos.tecnicoId)
    }

    // 4. Verificar que esté activo.
    if (!usuario.activo) {
      throw new TecnicoInactivo(datos.tecnicoId)
    }

    // 5. Asignar el técnico sin modificar el estado del ticket.
    const actualizado: Ticket = {
      ...ticket,
      tecnicoId: usuario.id,
      actualizadoEn: new Date()
    }

    // 6. Guardar la asignación.
    return this.tickets.actualizar(actualizado)
  }
}