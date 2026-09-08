import { Router, Request, Response } from 'express'
import type { RegistrarEquipo } from '../../../aplicacion/casos-uso/RegistrarEquipo.js'
import type { ObtenerEquipos } from '../../../aplicacion/casos-uso/ObtenerEquipos.js'

export function crearRutasEquipos(
  registrarEquipo: RegistrarEquipo,
  obtenerEquipos: ObtenerEquipos
): Router {
  const router = Router()

  router.post('/equipos', async (req: Request, res: Response): Promise<void> => {
    try {
      const equipo = await registrarEquipo.ejecutar(req.body)
      res.status(201).json(equipo)
    } catch (error) {
      console.error('Error al registrar equipo:', error)
      res.status(500).json({ mensaje: 'Error al registrar el equipo' })
    }
  })

  router.get('/equipos', async (_req: Request, res: Response): Promise<void> => {
    try {
      const equipos = await obtenerEquipos.ejecutar()
      res.status(200).json(equipos)
    } catch (error) {
      console.error('Error al listar equipos:', error)
      res.status(500).json({ mensaje: 'Error al listar equipos' })
    }
  })

  router.get('/equipos/:id', async (req: Request, res: Response): Promise<void> => {
    try {
      const equipo = await obtenerEquipos.ejecutarPorId(Number(req.params.id))
      if (!equipo) {
        res.status(404).json({ mensaje: 'Equipo no encontrado' })
        return
      }
      res.status(200).json(equipo)
    } catch (error) {
      console.error('Error al obtener equipo:', error)
      res.status(500).json({ mensaje: 'Error al obtener equipo' })
    }
  })

  return router
}

