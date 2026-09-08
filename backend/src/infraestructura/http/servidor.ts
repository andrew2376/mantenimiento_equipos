import express, { Express } from 'express'
import { crearRutasEquipos } from './rutas/equipos.js'
import { crearRutasMantenimientos } from './rutas/mantenimientos.js'
import type { RegistrarEquipo } from '../../aplicacion/casos-uso/RegistrarEquipo.js'
import type { ObtenerEquipos } from '../../aplicacion/casos-uso/ObtenerEquipos.js'
import type { RegistrarMantenimiento } from '../../aplicacion/casos-uso/RegistrarMantenimiento.js'
import type { ObtenerMantenimientos } from '../../aplicacion/casos-uso/ObtenerMantenimientos.js'

export interface DependenciasServidor {
  registrarEquipo: RegistrarEquipo
  obtenerEquipos: ObtenerEquipos
  registrarMantenimiento: RegistrarMantenimiento
  obtenerMantenimientos: ObtenerMantenimientos
}

export function crearServidor(deps: DependenciasServidor): Express {
  const app = express()

  app.use(express.json())

  // Rutas de la API
  app.use(crearRutasEquipos(deps.registrarEquipo, deps.obtenerEquipos))
  app.use(crearRutasMantenimientos(deps.registrarMantenimiento, deps.obtenerMantenimientos))

  // Endpoint de salud y bienvenida
  app.get('/', (_req, res) => {
    res.json({
      nombre: 'API Sistema de Mantenimiento de Equipos',
      version: '1.0.0',
      arquitectura: 'Hexagonal (Puertos y Adaptadores)',
      endpoints: [
        'POST /equipos',
        'GET /equipos',
        'GET /equipos/:id',
        'POST /mantenimientos',
        'GET /mantenimientos',
        'GET /mantenimientos/:id',
        'GET /mantenimientos?equipoId=:id'
      ]
    })
  })

  return app
}

