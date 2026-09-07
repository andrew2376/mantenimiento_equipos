import { Request, Response } from 'express'

import { CrearEquipo } from '../../aplicacion/casos-uso/CrearEquipo.js'

export class EquipoController {
  constructor(
    private readonly crearEquipo: CrearEquipo
  ) {}

  async crear(req: Request, res: Response): Promise<void> {
    try {
      const equipo = await this.crearEquipo.ejecutar(req.body)

      res.status(201).json(equipo)
    } catch (error) {
      console.error('Error al crear equipo:', error)

      res.status(500).json({
        mensaje: 'Error al crear el equipo'
      })
    }
  }
}