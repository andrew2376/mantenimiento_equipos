
import { PrismaClient } from './generado/client.js'

import type { DashboardDAO } from '../../dominio/puertos/index.js'
import type { Dashboard } from '../../dominio/modelo/Dashboard.js'

export class DashboardDAOPrisma implements DashboardDAO {
  constructor(
    private readonly prisma: PrismaClient
  ) {}

  async obtenerResumen(): Promise<Dashboard> {
    const fechaActual = new Date()

    // Fecha inicial: hace seis meses, incluyendo el mes actual.
    const fechaInicio = new Date(
      fechaActual.getFullYear(),
      fechaActual.getMonth() - 5,
      1
    )

    const [
      totalEquipos,
      equiposActivos,
      equiposInactivos,

      totalTickets,
      ticketsPendientes,
      ticketsCriticosPendientes,
      ticketsResueltos,
      ticketsPorEstado,
      ticketsPorPrioridad,

      totalMantenimientos,
      mantenimientosPendientes,
      mantenimientosEnProceso,
      mantenimientosFinalizados,
      mantenimientosPreventivos,
      mantenimientosCorrectivos,
      mantenimientosPorEstado,
      mantenimientosPorTipo,

      totalRepuestos,
      repuestosActivos,
      repuestosAgotados,
      repuestosInventario,

      fechasTickets,
      fechasMantenimientos,

      ticketsRecientes,
      mantenimientosRecientes,
      mantenimientosPorEquipo
    ] = await Promise.all([

      // EQUIPOS
      this.prisma.equipo.count(),

      this.prisma.equipo.count({
        where: { activo: true }
      }),

      this.prisma.equipo.count({
        where: { activo: false }
      }),

      // TICKETS
      this.prisma.tickets.count(),

      this.prisma.tickets.count({
        where: {
          estado: {
            in: [
              'ABIERTO',
              'ASIGNADO',
              'EN_DIAGNOSTICO',
              'EN_MANTENIMIENTO'
            ]
          }
        }
      }),

      this.prisma.tickets.count({
        where: {
          prioridad: 'CRITICA',
          estado: {
            notIn: ['RESUELTO', 'CERRADO', 'CANCELADO']
          }
        }
      }),

      this.prisma.tickets.count({
        where: {
          estado: {
            in: ['RESUELTO', 'CERRADO']
          }
        }
      }),

      this.prisma.tickets.groupBy({
        by: ['estado'],
        _count: {
          _all: true
        }
      }),

      this.prisma.tickets.groupBy({
        by: ['prioridad'],
        _count: {
          _all: true
        }
      }),

      // MANTENIMIENTOS
      this.prisma.mantenimiento.count(),

      this.prisma.mantenimiento.count({
        where: { estado: 'PENDIENTE' }
      }),

      this.prisma.mantenimiento.count({
        where: { estado: 'EN_PROCESO' }
      }),

      this.prisma.mantenimiento.count({
        where: { estado: 'FINALIZADO' }
      }),

      this.prisma.mantenimiento.count({
        where: { tipo: 'PREVENTIVO' }
      }),

      this.prisma.mantenimiento.count({
        where: { tipo: 'CORRECTIVO' }
      }),

      this.prisma.mantenimiento.groupBy({
        by: ['estado'],
        _count: {
          _all: true
        }
      }),

      this.prisma.mantenimiento.groupBy({
        by: ['tipo'],
        _count: {
          _all: true
        }
      }),

      // REPUESTOS
      this.prisma.repuesto.count(),

      this.prisma.repuesto.count({
        where: { activo: true }
      }),

      this.prisma.repuesto.findMany({
        where: {
          activo: true,
          stock: 0
        },
        orderBy: {
          nombre: 'asc'
        },
        take: 5,
        select: {
          id: true,
          nombre: true,
          codigo: true,
          stock: true
        }
      }),

      this.prisma.repuesto.findMany({
        where: { activo: true },
        select: {
          stock: true,
          costoUnitario: true
        }
      }),

      // ACTIVIDAD DE LOS ÚLTIMOS SEIS MESES
      this.prisma.tickets.findMany({
        where: {
          creado_en: {
            gte: fechaInicio
          }
        },
        select: {
          creado_en: true
        }
      }),

      this.prisma.mantenimiento.findMany({
        where: {
          fecha: {
            gte: fechaInicio
          }
        },
        select: {
          fecha: true
        }
      }),

      // TICKETS RECIENTES
      this.prisma.tickets.findMany({
        take: 5,
        orderBy: {
          creado_en: 'desc'
        },
        include: {
          equipos: {
            select: {
              nombre: true
            }
          }
        }
      }),

      // MANTENIMIENTOS RECIENTES
      this.prisma.mantenimiento.findMany({
        take: 5,
        orderBy: {
          fecha: 'desc'
        },
        select: {
          id: true,
          descripcion: true,
          tipo: true,
          estado: true,
          equipoId: true,
          fecha: true
        }
      }),

      // EQUIPOS CON MÁS MANTENIMIENTOS
      this.prisma.mantenimiento.groupBy({
        by: ['equipoId'],
        _count: {
          _all: true
        },
        orderBy: {
          _count: {
            equipoId: 'desc'
          }
        },
        take: 5
      })
    ])

    // ACTIVIDAD MENSUAL
    const actividadMensual = Array.from(
      { length: 6 },
      (_, indice) => {
        const fecha = new Date(
          fechaActual.getFullYear(),
          fechaActual.getMonth() - 5 + indice,
          1
        )

        const mes = `${fecha.getFullYear()}-${String(
          fecha.getMonth() + 1
        ).padStart(2, '0')}`

        const nombreMes = new Intl.DateTimeFormat('es-CO', {
          month: 'short'
        }).format(fecha)

        return {
          mes: nombreMes.charAt(0).toUpperCase() + nombreMes.slice(1),
          clave: mes,
          tickets: 0,
          mantenimientos: 0
        }
      }
    )

    for (const ticket of fechasTickets) {
      const clave = `${ticket.creado_en.getFullYear()}-${String(
        ticket.creado_en.getMonth() + 1
      ).padStart(2, '0')}`

      const mes = actividadMensual.find(
        item => item.clave === clave
      )

      if (mes) mes.tickets++
    }

    for (const mantenimiento of fechasMantenimientos) {
      const clave = `${mantenimiento.fecha.getFullYear()}-${String(
        mantenimiento.fecha.getMonth() + 1
      ).padStart(2, '0')}`

      const mes = actividadMensual.find(
        item => item.clave === clave
      )

      if (mes) mes.mantenimientos++
    }

    // EQUIPOS CON MÁS MANTENIMIENTOS
    const equiposIds = mantenimientosPorEquipo.map(
      item => item.equipoId
    )

    const equipos = await this.prisma.equipo.findMany({
      where: {
        id: {
          in: equiposIds
        }
      },
      select: {
        id: true,
        nombre: true,
        codigoInventario: true
      }
    })

    const equiposFrecuentes = mantenimientosPorEquipo.map(item => {
      const equipo = equipos.find(
        equipo => equipo.id === item.equipoId
      )

      return {
        id: item.equipoId,
        nombre: equipo?.nombre ?? 'Equipo no encontrado',
        codigoInventario: equipo?.codigoInventario ?? '',
        cantidadMantenimientos: item._count._all
      }
    })

    // VALOR DEL INVENTARIO
    const valorInventario = repuestosInventario.reduce(
      (total, repuesto) => {
        return total +
          Number(repuesto.costoUnitario) * repuesto.stock
      },
      0
    )

    // RESPUESTA DEL DASHBOARD
    return {
      equipos: {
        total: totalEquipos,
        activos: equiposActivos,
        inactivos: equiposInactivos
      },

      tickets: {
        total: totalTickets,
        pendientes: ticketsPendientes,
        criticosPendientes: ticketsCriticosPendientes,
        resueltos: ticketsResueltos,

        porEstado: ticketsPorEstado.map(item => ({
          nombre: item.estado,
          cantidad: item._count._all
        })),

        porPrioridad: ticketsPorPrioridad.map(item => ({
          nombre: item.prioridad,
          cantidad: item._count._all
        }))
      },

      mantenimientos: {
        total: totalMantenimientos,
        pendientes: mantenimientosPendientes,
        enProceso: mantenimientosEnProceso,
        finalizados: mantenimientosFinalizados,
        preventivos: mantenimientosPreventivos,
        correctivos: mantenimientosCorrectivos,

        porEstado: mantenimientosPorEstado.map(item => ({
          nombre: item.estado,
          cantidad: item._count._all
        })),

        porTipo: mantenimientosPorTipo.map(item => ({
          nombre: item.tipo,
          cantidad: item._count._all
        }))
      },

      repuestos: {
        total: totalRepuestos,
        activos: repuestosActivos,
        unidadesDisponibles: repuestosInventario.reduce(
          (total, repuesto) => total + repuesto.stock,
          0
        ),
        agotados: await this.prisma.repuesto.count({
          where: {
            activo: true,
            stock: 0
          }
        }),
        valorInventario
      },

      actividadMensual: actividadMensual.map(
        ({ clave, ...mes }) => mes
      ),

      ticketsRecientes: ticketsRecientes.map(ticket => ({
        id: ticket.id,
        titulo: ticket.titulo,
        estado: ticket.estado,
        prioridad: ticket.prioridad,
        equipo: ticket.equipos.nombre,
        creadoEn: ticket.creado_en
      })),

      mantenimientosRecientes,

      equiposFrecuentes,

      repuestosAgotados,

      actualizadoEn: new Date()
    }
  }
}
