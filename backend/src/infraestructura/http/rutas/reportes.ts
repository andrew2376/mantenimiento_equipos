import { Router } from 'express'
import type { GenerarReportes } from '../../../aplicacion/casos-uso/GenerarReportes.js'

export interface DependenciasReportes {
  generarReportes: GenerarReportes
}

export function rutasReportes(deps: DependenciasReportes): Router {
  const rutas = Router()

  // GET /api/reportes/resumen - Resumen de indicadores clave
  rutas.get('/resumen', async (_req, res, next) => {
    try {
      const resumen = await deps.generarReportes.ejecutar()
      res.json(resumen)
    } catch (error) {
      next(error)
    }
  })

  return rutas
}
