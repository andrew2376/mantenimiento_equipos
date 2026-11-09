
import { Router } from 'express'
import type { ConsultarDashboard } from '../../../aplicacion/casos-uso/ConsultarDashboard.js'

export interface DependenciasDashboard {
  consultarDashboard: ConsultarDashboard
}

export function crearRutasDashboard(
  dependencias: DependenciasDashboard
): Router {
  const router = Router()

  router.get('/', async (_req, res, next) => {
    try {
      const dashboard =
        await dependencias.consultarDashboard.ejecutar()

      res.json(dashboard)
    } catch (error) {
      next(error)
    }
  })

  return router
}
