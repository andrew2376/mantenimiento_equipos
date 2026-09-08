import { Router, Request, Response } from 'express'
import type { RegistrarMantenimiento } from '../../../aplicacion/casos-uso/RegistrarMantenimiento.js'
import type { ObtenerMantenimientos } from '../../../aplicacion/casos-uso/ObtenerMantenimientos.js'

export function crearRutasMantenimientos(
  registrarMantenimiento: RegistrarMantenimiento,
  obtenerMantenimientos: ObtenerMantenimientos
): Router {
  const router = Router()

  router.post('/mantenimientos', async (req: Request, res: Response): Promise<void> => {
    try {
      const mantenimiento = await registrarMantenimiento.ejecutar(req.body)
      res.status(201).json(mantenimiento)
    } catch (error) {
      console.error('Error al registrar mantenimiento:', error)
      res.status(500).json({ mensaje: 'Error al registrar el mantenimiento' })
    }
  })

  router.get('/mantenimientos', async (req: Request, res: Response): Promise<void> => {
    try {
      const { equipoId } = req.query
      let mantenimientos
      if (equipoId) {
        mantenimientos = await obtenerMantenimientos.ejecutarPorEquipo(Number(equipoId))
      } else {
        mantenimientos = await obtenerMantenimientos.ejecutar()
      }
      res.status(200).json(mantenimientos)
    } catch (error) {
      console.error('Error al obtener mantenimientos:', error)
      res.status(500).json({ mensaje: 'Error al obtener mantenimientos' })
    }
  })

  router.get('/mantenimientos/:id', async (req: Request, res: Response): Promise<void> => {
    try {
      const mantenimiento = await obtenerMantenimientos.ejecutarPorId(Number(req.params.id))
      if (!mantenimiento) {
        res.status(404).json({ mensaje: 'Mantenimiento no encontrado' })
        return
      }
      res.status(200).json(mantenimiento)
    } catch (error) {
      console.error('Error al consultar mantenimiento:', error)
      res.status(500).json({ mensaje: 'Error al consultar mantenimiento' })
    }
  })

  return router
}

