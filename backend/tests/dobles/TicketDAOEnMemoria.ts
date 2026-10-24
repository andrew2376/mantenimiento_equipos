import type { Ticket, TicketNuevo } from '../../src/dominio/modelo/Ticket'
import type { TicketDAO } from '../../src/dominio/puertos'

export class TicketDAOEnMemoria implements TicketDAO {
  private idAutoincrement = 1
  public readonly registros: Map<number, Ticket> = new Map()

  async guardar(t: TicketNuevo): Promise<Ticket> {
    const id = this.idAutoincrement++
    const ahora = new Date()
    const nuevo: Ticket = {
      id,
      titulo: t.titulo,
      descripcion: t.descripcion,
      prioridad: t.prioridad,
      estado: t.estado,
      equipoId: t.equipoId,
      solicitanteId: t.solicitanteId,
      tecnicoId: t.tecnicoId,
      equipo: t.equipo,
      solicitante: t.solicitante,
      tecnico: t.tecnico,
      fechaCierre: t.fechaCierre,
      creadoEn: ahora,
      actualizadoEn: ahora
    }
    this.registros.set(id, nuevo)
    return nuevo
  }

  async porId(id: number): Promise<Ticket | null> {
    return this.registros.get(id) ?? null
  }

  async todos(): Promise<Ticket[]> {
    return Array.from(this.registros.values())
  }

  async actualizar(ticket: Ticket): Promise<Ticket> {
    const actual = this.registros.get(ticket.id)
    if (!actual) {
      throw new Error(`Ticket con ID ${ticket.id} no encontrado`)
    }
    const actualizado: Ticket = {
      ...actual,
      ...ticket,
      actualizadoEn: new Date()
    }
    this.registros.set(ticket.id, actualizado)
    return actualizado
  }
}
