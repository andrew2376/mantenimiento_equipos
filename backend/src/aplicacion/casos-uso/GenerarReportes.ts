import type { PrismaClient } from '../../infraestructura/persistencia/generado/client.js'
import type { ResumenGeneralDTO } from '../../dominio/modelo/Reporte.js'

export class GenerarReportes {
  constructor(private readonly prisma: PrismaClient) {}

  async ejecutar(): Promise<ResumenGeneralDTO> {
    const [
      equipos,
      tickets,
      mantenimientos,
      repuestos,
      repuestosUsados
    ] = await Promise.all([
      this.prisma.equipo.findMany(),
      this.prisma.tickets.findMany(),
      this.prisma.mantenimiento.findMany({
        include: {
          equipo: true
        }
      }),
      this.prisma.repuesto.findMany(),
      this.prisma.repuestoMantenimiento.findMany({
        include: {
          repuesto: true
        }
      })
    ])

    // Estadísticas de Equipos
    const totalEquipos = equipos.length
    const operativos = equipos.filter(e => e.estado === 1).length
    const enMantenimiento = equipos.filter(e => e.estado === 2).length
    const inactivos = totalEquipos - operativos - enMantenimiento

    // Estadísticas de Tickets
    const totalTickets = tickets.length
    const ticketsAbiertos = tickets.filter(t => t.estado === 'ABIERTO' || t.estado === 'ASIGNADO').length
    const ticketsEnProceso = tickets.filter(t => t.estado === 'EN_DIAGNOSTICO' || t.estado === 'EN_MANTENIMIENTO').length
    const ticketsResueltos = tickets.filter(t => t.estado === 'RESUELTO' || t.estado === 'CERRADO').length
    const tasaResolucion = totalTickets > 0 ? Math.round((ticketsResueltos / totalTickets) * 100) : 100

    // Estadísticas de Mantenimientos
    const totalMantenimientos = mantenimientos.length
    const preventivos = mantenimientos.filter(m => m.tipo === 'PREVENTIVO').length
    const correctivos = mantenimientos.filter(m => m.tipo === 'CORRECTIVO').length
    const finalizados = mantenimientos.filter(m => m.estado === 'FINALIZADO').length
    const pendientes = mantenimientos.filter(m => m.estado === 'PENDIENTE' || m.estado === 'EN_PROCESO').length

    // Estadísticas de Repuestos
    const totalReferencias = repuestos.length
    const unidadesEnStock = repuestos.reduce((acc, r) => acc + Number(r.stock), 0)
    let unidadesConsumidas = 0
    let costoTotalInvertido = 0

    const consumoPorRepuesto = new Map<number, { id: number, codigo: string, nombre: string, cantidad: number, costo: number }>()

    for (const ru of repuestosUsados) {
      unidadesConsumidas += ru.cantidad
      const subtotal = ru.cantidad * Number(ru.costoUnitario)
      costoTotalInvertido += subtotal

      const actual = consumoPorRepuesto.get(ru.repuestoId) ?? {
        id: ru.repuestoId,
        codigo: ru.repuesto?.codigo ?? `REP-${ru.repuestoId}`,
        nombre: ru.repuesto?.nombre ?? 'Repuesto',
        cantidad: 0,
        costo: 0
      }
      actual.cantidad += ru.cantidad
      actual.costo += subtotal
      consumoPorRepuesto.set(ru.repuestoId, actual)
    }

    const topRepuestosUtilizados = Array.from(consumoPorRepuesto.values())
      .sort((a, b) => b.cantidad - a.cantidad)
      .slice(0, 5)
      .map(r => ({
        id: r.id,
        codigo: r.codigo,
        nombre: r.nombre,
        cantidadConsumida: r.cantidad,
        costoTotal: r.costo
      }))

    // Top Equipos Intervenidos
    const intervencionesPorEquipo = new Map<number, { id: number, codigo: string, nombre: string, count: number }>()
    for (const m of mantenimientos) {
      const eq = intervencionesPorEquipo.get(m.equipoId) ?? {
        id: m.equipoId,
        codigo: m.equipo?.codigoInventario ?? `EQ-${m.equipoId}`,
        nombre: m.equipo?.nombre ?? 'Equipo',
        count: 0
      }
      eq.count++
      intervencionesPorEquipo.set(m.equipoId, eq)
    }

    const topEquiposIntervenidos = Array.from(intervencionesPorEquipo.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)
      .map(e => ({
        id: e.id,
        codigo: e.codigo,
        nombre: e.nombre,
        totalMantenimientos: e.count
      }))

    return {
      equipos: {
        total: totalEquipos,
        operativos,
        enMantenimiento,
        inactivos
      },
      tickets: {
        total: totalTickets,
        abiertos: ticketsAbiertos,
        enProceso: ticketsEnProceso,
        resueltos: ticketsResueltos,
        tasaResolucion
      },
      mantenimientos: {
        total: totalMantenimientos,
        preventivos,
        correctivos,
        finalizados,
        pendientes
      },
      repuestos: {
        totalReferencias,
        unidadesEnStock,
        unidadesConsumidas,
        costoTotalInvertido
      },
      topEquiposIntervenidos,
      topRepuestosUtilizados
    }
  }
}
