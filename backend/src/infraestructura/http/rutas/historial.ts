import { Router } from 'express'
import type { ConsultarHistorialEquipo } from '../../../aplicacion/casos-uso/ConsultarHistorialEquipo.js'
import { EquipoNoEncontrado } from '../../../aplicacion/casos-uso/ConsultarEquipos.js'

export interface DependenciasHistorial {
  consultarHistorialEquipo: ConsultarHistorialEquipo
}

export function rutasHistorial(deps: DependenciasHistorial): Router {
  const rutas = Router()

  // GET /api/historial/equipo/:equipoId - Historial completo de un equipo
  rutas.get('/equipo/:equipoId', async (req, res, next) => {
    const equipoId = Number(req.params.equipoId)
    if (isNaN(equipoId)) {
      return void res.status(400).json({ error: 'El ID del equipo debe ser un número entero' })
    }

    try {
      const historial = await deps.consultarHistorialEquipo.ejecutar(equipoId)
      res.json(historial)
    } catch (error) {
      if (error instanceof EquipoNoEncontrado) {
        return void res.status(404).json({ error: error.message })
      }
      next(error)
    }
  })

  return rutas
}
