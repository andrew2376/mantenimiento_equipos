import { Router } from 'express'

import { EquipoController } from '../controllers/EquipoController.js'

export function crearEquipoRoutes(
  equipoController: EquipoController
): Router {
  const router = Router()

  router.post('/equipos', (req, res) => {
    equipoController.crear(req, res)
  })

  return router
}