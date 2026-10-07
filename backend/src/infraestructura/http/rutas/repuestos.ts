import { Router } from 'express'
import {
  aRepuestoDTO,
  aMantenimientoRepuestoDTO
} from '../../../dominio/modelo/Repuesto.js'
import type { GestionarRepuestos } from '../../../aplicacion/casos-uso/GestionarRepuestos.js'
import {
  RepuestoCodigoDuplicado,
  RepuestoNoEncontrado
} from '../../../aplicacion/casos-uso/GestionarRepuestos.js'
import type { AsociarRepuestoMantenimiento } from '../../../aplicacion/casos-uso/AsociarRepuestoMantenimiento.js'
import { MantenimientoNoEncontrado } from '../../../aplicacion/casos-uso/ConsultarMantenimientos.js'

export interface DependenciasRepuestos {
  gestionarRepuestos: GestionarRepuestos
  asociarRepuestoMantenimiento: AsociarRepuestoMantenimiento
}

export function rutasRepuestos(deps: DependenciasRepuestos): Router {
  const rutas = Router()

  // GET /api/repuestos - Listar catálogo de repuestos
  rutas.get('/', async (_req, res, next) => {
    try {
      const repuestos = await deps.gestionarRepuestos.listarTodos()
      res.json(repuestos.map(aRepuestoDTO))
    } catch (error) {
      next(error)
    }
  })

  // GET /api/repuestos/:id - Consultar repuesto por ID
  rutas.get('/:id', async (req, res, next) => {
    const id = Number(req.params.id)
    if (isNaN(id)) {
      return void res.status(400).json({ error: 'El ID del repuesto debe ser un número entero' })
    }

    try {
      const repuesto = await deps.gestionarRepuestos.porId(id)
      res.json(aRepuestoDTO(repuesto))
    } catch (error) {
      if (error instanceof RepuestoNoEncontrado) {
        return void res.status(404).json({ error: error.message })
      }
      next(error)
    }
  })

  // POST /api/repuestos - Registrar nuevo repuesto
  rutas.post('/', async (req, res, next) => {
    const d = (req.body ?? {}) as Record<string, unknown>

    if (typeof d['nombre'] !== 'string' || d['nombre'].trim().length < 2) {
      return void res.status(400).json({ error: 'El nombre del repuesto es obligatorio' })
    }

    if (typeof d['codigo'] !== 'string' || d['codigo'].trim().length < 2) {
      return void res.status(400).json({ error: 'El código del repuesto es obligatorio' })
    }

    const costoUnitario = Number(d['costoUnitario'])
    if (isNaN(costoUnitario) || costoUnitario < 0) {
      return void res.status(400).json({ error: 'El costo unitario debe ser un número mayor o igual a 0' })
    }

    try {
      const repuesto = await deps.gestionarRepuestos.registrar({
        nombre: d['nombre'],
        codigo: d['codigo'],
        descripcion: typeof d['descripcion'] === 'string' ? d['descripcion'] : null,
        costoUnitario,
        stock: typeof d['stock'] === 'number' ? d['stock'] : 0,
        activo: typeof d['activo'] === 'boolean' ? d['activo'] : true
      })
      res.status(201).json(aRepuestoDTO(repuesto))
    } catch (error) {
      if (error instanceof RepuestoCodigoDuplicado) {
        return void res.status(409).json({ error: error.message })
      }
      next(error)
    }
  })

  // GET /api/repuestos/mantenimiento/:mantenimientoId - Listar repuestos de un mantenimiento
  rutas.get('/mantenimiento/:mantenimientoId', async (req, res, next) => {
    const mantenimientoId = Number(req.params.mantenimientoId)
    if (isNaN(mantenimientoId)) {
      return void res.status(400).json({ error: 'El ID del mantenimiento debe ser un número entero' })
    }

    try {
      const repuestos = await deps.asociarRepuestoMantenimiento.listarPorMantenimiento(mantenimientoId)
      res.json(repuestos.map(aMantenimientoRepuestoDTO))
    } catch (error) {
      next(error)
    }
  })

  // POST /api/repuestos/mantenimiento - Asociar repuesto a mantenimiento
  rutas.post('/mantenimiento', async (req, res, next) => {
    const d = (req.body ?? {}) as Record<string, unknown>

    const mantenimientoId = Number(d['mantenimientoId'])
    const repuestoId = Number(d['repuestoId'])
    const cantidad = Number(d['cantidad'] ?? 1)
    const costoUnitario = d['costoUnitario'] !== undefined ? Number(d['costoUnitario']) : undefined

    if (isNaN(mantenimientoId) || mantenimientoId <= 0) {
      return void res.status(400).json({ error: 'El ID del mantenimiento es obligatorio y debe ser válido' })
    }

    if (isNaN(repuestoId) || repuestoId <= 0) {
      return void res.status(400).json({ error: 'El ID del repuesto es obligatorio y debe ser válido' })
    }

    if (isNaN(cantidad) || cantidad <= 0) {
      return void res.status(400).json({ error: 'La cantidad debe ser mayor a 0' })
    }

    try {
      const resultado = await deps.asociarRepuestoMantenimiento.ejecutar({
        mantenimientoId,
        repuestoId,
        cantidad,
        costoUnitario
      })
      res.status(201).json(aMantenimientoRepuestoDTO(resultado))
    } catch (error) {
      if (error instanceof MantenimientoNoEncontrado || error instanceof RepuestoNoEncontrado) {
        return void res.status(404).json({ error: error.message })
      }
      next(error)
    }
  })

  // DELETE /api/repuestos/mantenimiento/:id - Eliminar repuesto de mantenimiento
  rutas.delete('/mantenimiento/:id', async (req, res, next) => {
    const id = Number(req.params.id)
    if (isNaN(id)) {
      return void res.status(400).json({ error: 'El ID debe ser un número entero' })
    }

    try {
      const ok = await deps.asociarRepuestoMantenimiento.eliminar(id)
      if (!ok) {
        return void res.status(404).json({ error: 'No se encontró el registro a eliminar' })
      }
      res.status(204).send()
    } catch (error) {
      next(error)
    }
  })

  return rutas
}
