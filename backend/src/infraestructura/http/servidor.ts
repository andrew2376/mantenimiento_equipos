import express, { Router } from 'express'
import type { ErrorRequestHandler, Express } from 'express'
import cors from 'cors'
import { rutasEquipos, type DependenciasEquipos } from './rutas/equipos'
import { rutasMantenimientos, type DependenciasMantenimientos } from './rutas/mantenimientos'

export interface DependenciasServidor {
  equipos: DependenciasEquipos
  mantenimientos: DependenciasMantenimientos
}

const manejadorErrores: ErrorRequestHandler = (error, _req, res, _next) => {
  console.error('[Error no controlado]', error)
  res.status(500).json({ error: 'Error interno del servidor' })
}

export function crearServidor(deps: DependenciasServidor): Express {
  const app = express()

  // Middlewares globales
  app.use(cors())
  app.use(express.json())

  // Enrutador principal de la API
  const api = Router()

  // Endpoint de salud / monitoreo
  api.get('/salud', (_req, res) => {
    res.json({
      estado: 'ok',
      servicio: 'Sistema de Gestión y Trazabilidad de Mantenimiento de Equipos',
      version: '1.0.0',
    })
  })

  // Montar rutas de módulos
  api.use('/equipos', rutasEquipos(deps.equipos))
  api.use('/mantenimientos', rutasMantenimientos(deps.mantenimientos))

  // Montar API con prefijo /api
  app.use('/api', api)

  // Manejo de rutas inexistentes
  app.use((_req, res) => {
    res.status(404).json({ error: 'Ruta no encontrada' })
  })

  // Middleware de errores
  app.use(manejadorErrores)

  return app
}
