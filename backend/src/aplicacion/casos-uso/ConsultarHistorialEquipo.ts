import type { PrismaClient } from '../../infraestructura/persistencia/generado/client.js'
import type { HistorialEquipoDTO, EventoHistorial } from '../../dominio/modelo/Historial.js'
import { EquipoNoEncontrado } from './ConsultarEquipos.js'

export class ConsultarHistorialEquipo {
  constructor(private readonly prisma: PrismaClient) {}

  async ejecutar(equipoId: number): Promise<HistorialEquipoDTO> {
    const equipo = await this.prisma.equipo.findUnique({
      where: { id: equipoId },
      include: {
        tickets: {
          include: {
            usuarios_tickets_solicitante_idTousuarios: true,
            usuarios_tickets_tecnico_idTousuarios: true
          },
          orderBy: { creado_en: 'desc' }
        },
        mantenimientos: {
          include: {
            repuestos: {
              include: {
                repuesto: true
              }
            },
            ticket: true
          },
          orderBy: { fecha: 'desc' }
        }
      }
    })

    if (!equipo) {
      throw new EquipoNoEncontrado(equipoId)
    }

    const eventos: EventoHistorial[] = []
    let totalCostoRepuestos = 0
    let totalRepuestosUsados = 0

    // 1. Eventos de Mantenimiento y Repuestos
    for (const m of equipo.mantenimientos) {
      eventos.push({
        id: `mant-${m.id}`,
        fecha: m.fecha.toISOString(),
        tipo: 'MANTENIMIENTO',
        titulo: `Mantenimiento ${m.tipo} #${m.id}`,
        descripcion: m.descripcion + (m.diagnostico ? ` — Diagnóstico: ${m.diagnostico}` : ''),
        estado: m.estado,
        responsable: m.tecnico ?? undefined
      })

      // Repuestos consumidos en este mantenimiento
      for (const r of m.repuestos) {
        const subtotal = Number(r.costoUnitario) * r.cantidad
        totalCostoRepuestos += subtotal
        totalRepuestosUsados += r.cantidad

        eventos.push({
          id: `rep-${r.id}`,
          fecha: r.creadoEn.toISOString(),
          tipo: 'REPUESTO',
          titulo: `Repuesto consumido: ${r.repuesto?.nombre || 'Pieza'} (x${r.cantidad})`,
          descripcion: `Instalado en Mantenimiento #${m.id}. Costo unitario: $${Number(r.costoUnitario).toFixed(2)} (Subtotal: $${subtotal.toFixed(2)})`,
          costo: subtotal,
          responsable: m.tecnico ?? undefined
        })
      }
    }

    // 2. Eventos de Tickets
    for (const t of equipo.tickets) {
      eventos.push({
        id: `ticket-${t.id}`,
        fecha: t.creado_en.toISOString(),
        tipo: 'TICKET',
        titulo: `Ticket #${t.id}: ${t.titulo}`,
        descripcion: t.descripcion,
        estado: t.estado,
        responsable: t.usuarios_tickets_tecnico_idTousuarios?.nombre ?? (t.usuarios_tickets_solicitante_idTousuarios?.nombre ? `Solicitante: ${t.usuarios_tickets_solicitante_idTousuarios.nombre}` : undefined)
      })
    }

    // Ordenar cronológicamente descendente (más reciente primero)
    eventos.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())

    return {
      equipo: {
        id: equipo.id,
        codigoInventario: equipo.codigoInventario,
        nombre: equipo.nombre,
        tipo: equipo.tipo,
        marca: equipo.marca,
        modelo: equipo.modelo,
        numeroSerie: equipo.numeroSerie,
        ubicacion: equipo.ubicacion,
        estado: equipo.estado,
        creadoEn: equipo.createdAt.toISOString()
      },
      estadisticas: {
        totalTickets: equipo.tickets.length,
        totalMantenimientos: equipo.mantenimientos.length,
        totalRepuestosUsados,
        costoTotalRepuestos: totalCostoRepuestos
      },
      lineaDeTiempo: eventos
    }
  }
}
