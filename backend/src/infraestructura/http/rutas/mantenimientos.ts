import { Router } from 'express'
import { aMantenimientoDTO, esEstadoMantenimiento, esTipoMantenimiento } from '../../../dominio/modelo/Mantenimiento'
import { aTicketDTO } from '../../../dominio/modelo/Ticket'
import type { RegistrarMantenimiento, RegistroMantenimientoDTO } from '../../../aplicacion/casos-uso/RegistrarMantenimiento'
import { EquipoInexistente } from '../../../aplicacion/casos-uso/RegistrarMantenimiento'
import type { ConsultarMantenimientos } from '../../../aplicacion/casos-uso/ConsultarMantenimientos'
import { MantenimientoNoEncontrado } from '../../../aplicacion/casos-uso/ConsultarMantenimientos'
import { EquipoNoEncontrado } from '../../../aplicacion/casos-uso/ConsultarEquipos'
import type { ActualizarEstadoMantenimiento, ActualizarMantenimientoDTO } from '../../../aplicacion/casos-uso/ActualizarEstadoMantenimiento'
import type { RegistrarDiagnostico } from '../../../aplicacion/casos-uso/RegistrarDiagnostico'
import {
  DiagnosticoInvalido,
  TecnicoInvalido,
  MantenimientoNoModificable
} from '../../../aplicacion/casos-uso/RegistrarDiagnostico'
import type { CerrarMantenimiento } from '../../../aplicacion/casos-uso/CerrarMantenimiento'
import { MantenimientoYaCerrado, DiagnosticoRequeridoParaCierre } from '../../../aplicacion/casos-uso/CerrarMantenimiento'

export interface DependenciasMantenimientos {
  registrarMantenimiento: RegistrarMantenimiento
  consultarMantenimientos: ConsultarMantenimientos
  actualizarEstadoMantenimiento: ActualizarEstadoMantenimiento
  registrarDiagnostico: RegistrarDiagnostico
  cerrarMantenimiento?: CerrarMantenimiento
}

function validarRegistroMantenimiento(cuerpo: unknown): RegistroMantenimientoDTO | string {
  const d = (cuerpo ?? {}) as Record<string, unknown>
  if (typeof d['descripcion'] !== 'string' || d['descripcion'].trim().length < 5) {
    return 'La descripción del mantenimiento es obligatoria (mínimo 5 caracteres)'
  }
  const equipoId = Number(d['equipoId'])
  if (isNaN(equipoId) || equipoId <= 0) {
    return 'El campo equipoId es obligatorio y debe ser un número entero positivo'
  }
  if (d['tipo'] !== undefined && !esTipoMantenimiento(d['tipo'])) {
    return 'El tipo de mantenimiento no es válido (PREVENTIVO, CORRECTIVO)'
  }
  if (d['estado'] !== undefined && !esEstadoMantenimiento(d['estado'])) {
    return 'El estado del mantenimiento no es válido (PENDIENTE, EN_PROCESO, FINALIZADO, CANCELADO)'
  }

  const ticketId = d['ticketId'] !== undefined && d['ticketId'] !== null && d['ticketId'] !== '' ? Number(d['ticketId']) : null
  if (ticketId !== null && (isNaN(ticketId) || ticketId <= 0)) {
    return 'El campo ticketId debe ser un número entero positivo'
  }

  return {
    descripcion: d['descripcion'],
    equipoId,
    ticketId,
    tipo: d['tipo'] as any,
    estado: d['estado'] as any,
    diagnostico: typeof d['diagnostico'] === 'string' ? d['diagnostico'] : null,
    tecnico: typeof d['tecnico'] === 'string' ? d['tecnico'] : null,
  }
}

export function rutasMantenimientos(deps: DependenciasMantenimientos): Router {
  const rutas = Router()

  // POST /api/mantenimientos - Registrar una nueva solicitud o mantenimiento
  rutas.post('/', async (req, res, next) => {
    const validacion = validarRegistroMantenimiento(req.body)
    if (typeof validacion === 'string') {
      return void res.status(400).json({ error: validacion })
    }

    try {
      const mantenimiento = await deps.registrarMantenimiento.ejecutar(validacion)
      res.status(201).json(aMantenimientoDTO(mantenimiento))
    } catch (error) {
      if (error instanceof EquipoInexistente) {
        return void res.status(404).json({ error: error.message })
      }
      next(error)
    }
  })

  // GET /api/mantenimientos - Listar todos los mantenimientos
  rutas.get('/', async (_req, res, next) => {
    try {
      const mantenimientos = await deps.consultarMantenimientos.listarTodos()
      res.json(mantenimientos.map(aMantenimientoDTO))
    } catch (error) {
      next(error)
    }
  })

  // GET /api/mantenimientos/equipo/:equipoId - Consultar historial de mantenimiento de un equipo
  rutas.get('/equipo/:equipoId', async (req, res, next) => {
    const equipoId = Number(req.params.equipoId)
    if (isNaN(equipoId)) {
      return void res.status(400).json({ error: 'El ID del equipo debe ser un número entero' })
    }

    try {
      const historial = await deps.consultarMantenimientos.historialPorEquipo(equipoId)
      res.json(historial.map(aMantenimientoDTO))
    } catch (error) {
      if (error instanceof EquipoNoEncontrado) {
        return void res.status(404).json({ error: error.message })
      }
      next(error)
    }
  })

  // GET /api/mantenimientos/:id - Consultar mantenimiento por ID
  rutas.get('/:id', async (req, res, next) => {
    const id = Number(req.params.id)
    if (isNaN(id)) {
      return void res.status(400).json({ error: 'El ID del mantenimiento debe ser un número entero' })
    }

    try {
      const m = await deps.consultarMantenimientos.porId(id)
      res.json(aMantenimientoDTO(m))
    } catch (error) {
      if (error instanceof MantenimientoNoEncontrado) {
        return void res.status(404).json({ error: error.message })
      }
      next(error)
    }
  })

  // PATCH /api/mantenimientos/:id - Actualizar estado, diagnóstico o técnico
  rutas.patch('/:id', async (req, res, next) => {
    const id = Number(req.params.id)
    if (isNaN(id)) {
      return void res.status(400).json({ error: 'El ID del mantenimiento debe ser un número entero' })
    }

    const d = (req.body ?? {}) as Record<string, unknown>
    if (d['estado'] !== undefined && !esEstadoMantenimiento(d['estado'])) {
      return void res.status(400).json({ error: 'Estado de mantenimiento inválido' })
    }

    const payload: ActualizarMantenimientoDTO = {
      id,
      estado: d['estado'] as any,
      diagnostico: typeof d['diagnostico'] === 'string' ? d['diagnostico'] : (d['diagnostico'] === null ? null : undefined),
      tecnico: typeof d['tecnico'] === 'string' ? d['tecnico'] : (d['tecnico'] === null ? null : undefined),
      descripcion: typeof d['descripcion'] === 'string' ? d['descripcion'] : undefined,
      tipo: d['tipo'] !== undefined && esTipoMantenimiento(d['tipo']) ? (d['tipo'] as any) : undefined,
      equipoId: d['equipoId'] !== undefined && !isNaN(Number(d['equipoId'])) ? Number(d['equipoId']) : undefined,
      ticketId: d['ticketId'] !== undefined ? (d['ticketId'] ? Number(d['ticketId']) : null) : undefined,
    }

    try {
      const actualizado = await deps.actualizarEstadoMantenimiento.ejecutar(payload)
      res.json(aMantenimientoDTO(actualizado))
    } catch (error) {
      if (error instanceof MantenimientoNoEncontrado) {
        return void res.status(404).json({ error: error.message })
      }
      next(error)
    }
  })

  // PATCH /api/mantenimientos/:id/diagnostico - Registrar o actualizar diagnóstico detallado (ACT-024)
  rutas.patch('/:id/diagnostico', async (req, res, next) => {
    const mantenimientoId = Number(req.params.id)
    if (isNaN(mantenimientoId) || mantenimientoId <= 0) {
      return void res.status(400).json({ error: 'El ID del mantenimiento debe ser un número entero positivo' })
    }

    const d = (req.body ?? {}) as Record<string, unknown>
    if (typeof d['diagnostico'] !== 'string' || d['diagnostico'].trim().length < 10) {
      return void res.status(400).json({ error: 'El diagnóstico debe tener al menos 10 caracteres detallando la falla y la solución' })
    }

    if (typeof d['tecnico'] !== 'string' || d['tecnico'].trim().length < 2) {
      return void res.status(400).json({ error: 'El nombre del técnico es obligatorio (mínimo 2 caracteres)' })
    }

    try {
      const actualizado = await deps.registrarDiagnostico.ejecutar({
        mantenimientoId,
        diagnostico: d['diagnostico'],
        tecnico: d['tecnico']
      })
      res.json(aMantenimientoDTO(actualizado))
    } catch (error) {
      if (error instanceof MantenimientoNoEncontrado) {
        return void res.status(404).json({ error: error.message })
      }
      if (error instanceof DiagnosticoInvalido || error instanceof TecnicoInvalido) {
        return void res.status(400).json({ error: error.message })
      }
      if (error instanceof MantenimientoNoModificable) {
        return void res.status(409).json({ error: error.message })
      }
      next(error)
    }
  })

  // POST /api/mantenimientos/:id/cerrar - Cierre de mantenimiento con sincronización de ticket (ACT-027)
  rutas.post('/:id/cerrar', async (req, res, next) => {
    const id = Number(req.params.id)
    if (isNaN(id)) {
      return void res.status(400).json({ error: 'El ID del mantenimiento debe ser un número entero' })
    }

    const d = (req.body ?? {}) as Record<string, unknown>
    const diagnostico = typeof d['diagnostico'] === 'string' ? d['diagnostico'] : undefined
    const tecnico = typeof d['tecnico'] === 'string' ? d['tecnico'] : undefined

    try {
      if (deps.cerrarMantenimiento) {
        const resultado = await deps.cerrarMantenimiento.ejecutar({ id, diagnostico, tecnico })
        return void res.json({
          mantenimiento: aMantenimientoDTO(resultado.mantenimiento),
          ticketSincronizado: resultado.ticketSincronizado ? aTicketDTO(resultado.ticketSincronizado) : null,
          equipoOperativo: resultado.equipoOperativo,
          mensaje: 'Mantenimiento finalizado exitosamente y ticket sincronizado'
        })
      } else {
        const actualizado = await deps.actualizarEstadoMantenimiento.ejecutar({
          id,
          estado: 'FINALIZADO',
          diagnostico,
          tecnico
        })
        return void res.json(aMantenimientoDTO(actualizado))
      }
    } catch (error) {
      if (error instanceof MantenimientoNoEncontrado) {
        return void res.status(404).json({ error: error.message })
      }
      if (error instanceof MantenimientoYaCerrado || error instanceof DiagnosticoRequeridoParaCierre) {
        return void res.status(400).json({ error: error.message })
      }
      next(error)
    }
  })

  return rutas
}
