import { Router } from 'express'
import { aRepuestoDTO, aRepuestoUsadoDTO } from '../../../dominio/modelo/Repuesto.js'
import type { RegistrarRepuesto } from '../../../aplicacion/casos-uso/RegistrarRepuesto.js'
import { RepuestoDuplicado, DatosRepuestoInvalidos } from '../../../aplicacion/casos-uso/RegistrarRepuesto.js'
import type { ConsultarRepuestos } from '../../../aplicacion/casos-uso/ConsultarRepuestos.js'
import { RepuestoNoEncontrado } from '../../../aplicacion/casos-uso/ConsultarRepuestos.js'
import type { AsignarRepuestosAMantenimiento } from '../../../aplicacion/casos-uso/AsignarRepuestosAMantenimiento.js'
import { StockInsuficiente } from '../../../aplicacion/casos-uso/AsignarRepuestosAMantenimiento.js'

export interface DependenciasRepuestos {
  registrarRepuesto: RegistrarRepuesto
  consultarRepuestos: ConsultarRepuestos
  asignarRepuestosAMantenimiento: AsignarRepuestosAMantenimiento
}

export function rutasRepuestos(deps: DependenciasRepuestos): Router {
  const rutas = Router()

  // GET /api/repuestos - Listar todos los repuestos del catálogo
  rutas.get('/', async (_req, res, next) => {
    try {
      const repuestos = await deps.consultarRepuestos.todos()
      res.json(repuestos.map(aRepuestoDTO))
    } catch (error) {
      next(error)
    }
  })

  // GET /api/repuestos/:id - Consultar repuesto por ID
  rutas.get('/:id', async (req, res, next) => {
    const id = Number(req.params.id)
    if (isNaN(id)) {
      return void res.status(400).json({ error: 'El ID debe ser un número entero' })
    }

    try {
      const repuesto = await deps.consultarRepuestos.porId(id)
      res.json(aRepuestoDTO(repuesto))
    } catch (error) {
      if (error instanceof RepuestoNoEncontrado) {
        return void res.status(404).json({ error: error.message })
      }
      next(error)
    }
  })

  // POST /api/repuestos - Registrar un nuevo repuesto en inventario
  rutas.post('/', async (req, res, next) => {
    const d = (req.body ?? {}) as Record<string, unknown>

    if (typeof d['codigo'] !== 'string' || typeof d['nombre'] !== 'string') {
      return void res.status(400).json({ error: 'Código y nombre son obligatorios' })
    }

    try {
      const repuesto = await deps.registrarRepuesto.ejecutar({
        codigo: d['codigo'],
        nombre: d['nombre'],
        descripcion: typeof d['descripcion'] === 'string' ? d['descripcion'] : null,
        stock: d['stock'] !== undefined ? Number(d['stock']) : 0,
        precioUnitario: d['precioUnitario'] !== undefined ? Number(d['precioUnitario']) : 0
      })
      res.status(201).json(aRepuestoDTO(repuesto))
    } catch (error) {
      if (error instanceof RepuestoDuplicado || error instanceof DatosRepuestoInvalidos) {
        return void res.status(400).json({ error: error.message })
      }
      next(error)
    }
  })

  // GET /api/repuestos/mantenimiento/:mantenimientoId - Consultar repuestos usados en un mantenimiento
  rutas.get('/mantenimiento/:mantenimientoId', async (req, res, next) => {
    const mantenimientoId = Number(req.params.mantenimientoId)
    if (isNaN(mantenimientoId)) {
      return void res.status(400).json({ error: 'El ID de mantenimiento debe ser un número entero' })
    }

    try {
      const usados = await deps.asignarRepuestosAMantenimiento.listarPorMantenimiento(mantenimientoId)
      res.json(usados.map(aRepuestoUsadoDTO))
    } catch (error) {
      next(error)
    }
  })

  // POST /api/repuestos/mantenimiento/:mantenimientoId - Asignar repuesto utilizado
  rutas.post('/mantenimiento/:mantenimientoId', async (req, res, next) => {
    const mantenimientoId = Number(req.params.mantenimientoId)
    if (isNaN(mantenimientoId)) {
      return void res.status(400).json({ error: 'El ID de mantenimiento debe ser un número entero' })
    }

    const d = (req.body ?? {}) as Record<string, unknown>
    const repuestoId = Number(d['repuestoId'])
    const cantidad = Number(d['cantidad'] ?? 1)

    if (isNaN(repuestoId) || repuestoId <= 0) {
      return void res.status(400).json({ error: 'El repuestoId es obligatorio y debe ser un número positivo' })
    }

    if (isNaN(cantidad) || cantidad <= 0) {
      return void res.status(400).json({ error: 'La cantidad debe ser un número positivo' })
    }

    try {
      const asignado = await deps.asignarRepuestosAMantenimiento.ejecutar({
        mantenimientoId,
        repuestoId,
        cantidad
      })
      res.status(201).json(aRepuestoUsadoDTO(asignado))
    } catch (error) {
      if (error instanceof StockInsuficiente || error instanceof RepuestoNoEncontrado) {
        return void res.status(400).json({ error: error.message })
      }
      next(error)
    }
  })

  return rutas
}
