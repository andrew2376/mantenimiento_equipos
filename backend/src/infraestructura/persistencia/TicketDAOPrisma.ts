import type { PrismaClient } from './generado/client'

import type {
  Ticket,
  TicketNuevo,
  PrioridadTicket,
  EstadoTicket
} from '../../dominio/modelo/Ticket.js'

import type {
  TicketDAO
} from '../../dominio/puertos/index.js'

export class TicketDAOPrisma implements TicketDAO {

  constructor(
    private readonly prisma: PrismaClient
  ) {}

  async guardar(
    ticket: TicketNuevo
  ): Promise<Ticket> {

    const fila =
      await this.prisma.tickets.create({
        data: {
          titulo: ticket.titulo,
          descripcion: ticket.descripcion,
          prioridad: ticket.prioridad,
          estado: ticket.estado,
          equipo_id: ticket.equipoId,
          solicitante_id: ticket.solicitanteId,
          tecnico_id: ticket.tecnicoId,
          fecha_cierre: ticket.fechaCierre
        }
      })

    return {
      id: fila.id,
      titulo: fila.titulo,
      descripcion: fila.descripcion,
      prioridad:
        fila.prioridad as PrioridadTicket,
      estado:
        fila.estado as EstadoTicket,
      equipoId: fila.equipo_id,
      solicitanteId: fila.solicitante_id,
      tecnicoId:
        fila.tecnico_id ?? undefined,
      fechaCierre:
        fila.fecha_cierre ?? undefined,
      creadoEn: fila.creado_en,
      actualizadoEn: fila.actualizado_en
    }
  }

  async porId(
    id: number
  ): Promise<Ticket | null> {

    const fila =
      await this.prisma.tickets.findUnique({
        where: { id },

        include: {
          equipos: true,

          usuarios_tickets_solicitante_idTousuarios:
            true,

          usuarios_tickets_tecnico_idTousuarios:
            true
        }
      })

    if (!fila) {
      return null
    }

    return {
      id: fila.id,
      titulo: fila.titulo,
      descripcion: fila.descripcion,
      prioridad:
        fila.prioridad as PrioridadTicket,
      estado:
        fila.estado as EstadoTicket,

      equipoId: fila.equipo_id,
      solicitanteId: fila.solicitante_id,
      tecnicoId:
        fila.tecnico_id ?? undefined,

      equipo: {
        id: fila.equipos.id,
        codigoInventario:
          fila.equipos.codigoInventario,
        nombre:
          fila.equipos.nombre
      },

      solicitante: {
        id:
          fila.usuarios_tickets_solicitante_idTousuarios.id,
        nombre:
          fila.usuarios_tickets_solicitante_idTousuarios.nombre
      },

      tecnico:
        fila.usuarios_tickets_tecnico_idTousuarios
          ? {
              id:
                fila
                  .usuarios_tickets_tecnico_idTousuarios
                  .id,

              nombre:
                fila
                  .usuarios_tickets_tecnico_idTousuarios
                  .nombre
            }
          : undefined,

      fechaCierre:
        fila.fecha_cierre ?? undefined,

      creadoEn:
        fila.creado_en,

      actualizadoEn:
        fila.actualizado_en
    }
  }

  async todos(): Promise<Ticket[]> {

    const filas =
      await this.prisma.tickets.findMany({

        orderBy: {
          id: 'asc'
        },

        include: {
          equipos: true,

          usuarios_tickets_solicitante_idTousuarios:
            true,

          usuarios_tickets_tecnico_idTousuarios:
            true
        }
      })

    return filas.map((fila) => ({

      id: fila.id,

      titulo: fila.titulo,

      descripcion:
        fila.descripcion,

      prioridad:
        fila.prioridad as PrioridadTicket,

      estado:
        fila.estado as EstadoTicket,

      equipoId:
        fila.equipo_id,

      solicitanteId:
        fila.solicitante_id,

      tecnicoId:
        fila.tecnico_id ?? undefined,

      equipo: {
        id:
          fila.equipos.id,

        codigoInventario:
          fila.equipos.codigoInventario,

        nombre:
          fila.equipos.nombre
      },

      solicitante: {
        id:
          fila
            .usuarios_tickets_solicitante_idTousuarios
            .id,

        nombre:
          fila
            .usuarios_tickets_solicitante_idTousuarios
            .nombre
      },

      tecnico:
        fila
          .usuarios_tickets_tecnico_idTousuarios
          ? {
              id:
                fila
                  .usuarios_tickets_tecnico_idTousuarios
                  .id,

              nombre:
                fila
                  .usuarios_tickets_tecnico_idTousuarios
                  .nombre
            }
          : undefined,

      fechaCierre:
        fila.fecha_cierre ?? undefined,

      creadoEn:
        fila.creado_en,

      actualizadoEn:
        fila.actualizado_en

    }))
  }

  async actualizar(
    ticket: Ticket
  ): Promise<Ticket> {

    const fila =
      await this.prisma.tickets.update({

        where: {
          id: ticket.id
        },

        data: {
          titulo: ticket.titulo,
          descripcion: ticket.descripcion,
          prioridad: ticket.prioridad,
          estado: ticket.estado,
          equipo_id: ticket.equipoId,
          solicitante_id: ticket.solicitanteId,
          tecnico_id: ticket.tecnicoId,
          fecha_cierre: ticket.fechaCierre
        }
      })

    return {
      id: fila.id,
      titulo: fila.titulo,
      descripcion: fila.descripcion,
      prioridad:
        fila.prioridad as PrioridadTicket,
      estado:
        fila.estado as EstadoTicket,
      equipoId:
        fila.equipo_id,
      solicitanteId:
        fila.solicitante_id,
      tecnicoId:
        fila.tecnico_id ?? undefined,
      fechaCierre:
        fila.fecha_cierre ?? undefined,
      creadoEn:
        fila.creado_en,
      actualizadoEn:
        fila.actualizado_en
    }
  }
}