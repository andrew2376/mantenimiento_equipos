import type { Mantenimiento } from '../../dominio/modelo/Mantenimiento.js'
import type { Ticket } from '../../dominio/modelo/Ticket.js'
import type {
  EquipoDAO,
  MantenimientoDAO,
  TicketDAO
} from '../../dominio/puertos/index.js'
import { MantenimientoNoEncontrado } from './ConsultarMantenimientos.js'

export class MantenimientoYaCerrado extends Error {
  constructor(id: number, estado: string) {
    super(`El mantenimiento con ID ${id} ya se encuentra ${estado} y no puede cerrarse de nuevo`)
    this.name = 'MantenimientoYaCerrado'
  }
}

export class DiagnosticoRequeridoParaCierre extends Error {
  constructor(id: number) {
    super(`El mantenimiento con ID ${id} requiere un diagnóstico técnico antes de ser cerrado`)
    this.name = 'DiagnosticoRequeridoParaCierre'
  }
}

export interface CerrarMantenimientoDTO {
  id: number
  diagnostico?: string | null
  tecnico?: string | null
}

export interface ResultadoCierreMantenimiento {
  mantenimiento: Mantenimiento
  ticketSincronizado: Ticket | null
  equipoOperativo: boolean
}

export class CerrarMantenimiento {
  constructor(
    private readonly mantenimientos: MantenimientoDAO,
    private readonly equipos: EquipoDAO,
    private readonly tickets: TicketDAO
  ) {}

  async ejecutar(
    datos: CerrarMantenimientoDTO
  ): Promise<ResultadoCierreMantenimiento> {
    const actual = await this.mantenimientos.porId(datos.id)
    if (!actual) {
      throw new MantenimientoNoEncontrado(datos.id)
    }

    if (actual.estado === 'FINALIZADO' || actual.estado === 'CANCELADO') {
      throw new MantenimientoYaCerrado(actual.id, actual.estado)
    }

    const diagnosticoFinal =
      (typeof datos.diagnostico === 'string' && datos.diagnostico.trim().length > 0)
        ? datos.diagnostico.trim()
        : (actual.diagnostico?.trim() || '')

    if (!diagnosticoFinal) {
      throw new DiagnosticoRequeridoParaCierre(actual.id)
    }

    const tecnicoFinal =
      (typeof datos.tecnico === 'string' && datos.tecnico.trim().length > 0)
        ? datos.tecnico.trim()
        : (actual.tecnico?.trim() || null)

    const mantenimientoActualizado = await this.mantenimientos.actualizar(actual.id, {
      estado: 'FINALIZADO',
      diagnostico: diagnosticoFinal,
      tecnico: tecnicoFinal
    })

    if (!mantenimientoActualizado) {
      throw new MantenimientoNoEncontrado(actual.id)
    }

    // 1. Sincronización del Ticket si existe
    let ticketSincronizado: Ticket | null = null
    const ticketId = actual.ticketId ?? mantenimientoActualizado.ticketId
    if (ticketId) {
      const ticket = await this.tickets.porId(ticketId)
      if (ticket) {
        ticket.estado = 'RESUELTO'
        ticket.fechaCierre = new Date()
        ticketSincronizado = await this.tickets.actualizar(ticket)
      }
    }

    // 2. Verificación y actualización del estado del equipo a OPERATIVO (1)
    let equipoOperativo = false
    const historial = await this.mantenimientos.listarPorEquipo(actual.equipoId)
    const tieneActivos = historial.some(
      (m) =>
        m.id !== actual.id &&
        (m.estado === 'PENDIENTE' || m.estado === 'EN_PROCESO')
    )

    if (!tieneActivos) {
      const equipo = await this.equipos.porId(actual.equipoId)
      if (equipo) {
        await this.equipos.actualizar({
          ...equipo,
          estado: 1
        })
        equipoOperativo = true
      }
    }

    return {
      mantenimiento: mantenimientoActualizado,
      ticketSincronizado,
      equipoOperativo
    }
  }
}
