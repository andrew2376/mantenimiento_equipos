import { Router } from 'express'
import { aEquipoDTO, esEstadoEquipo, esTipoEquipo } from '../../../dominio/modelo/Equipo'
import type { RegistrarEquipo, RegistroEquipoDTO } from '../../../aplicacion/casos-uso/RegistrarEquipo'
import { SerialYaRegistrado } from '../../../aplicacion/casos-uso/RegistrarEquipo'
import type { ConsultarEquipos } from '../../../aplicacion/casos-uso/ConsultarEquipos'
import { EquipoNoEncontrado } from '../../../aplicacion/casos-uso/ConsultarEquipos'

export interface DependenciasEquipos {
  registrarEquipo: RegistrarEquipo
  consultarEquipos: ConsultarEquipos
}

function validarRegistroEquipo(cuerpo: unknown): RegistroEquipoDTO | string {
  const d = (cuerpo ?? {}) as Record<string, unknown>
  if (typeof d['serial'] !== 'string' || d['serial'].trim().length < 2) {
    return 'El serial es obligatorio y debe tener al menos 2 caracteres'
  }
  if (typeof d['nombre'] !== 'string' || d['nombre'].trim().length < 2) {
    return 'El nombre o modelo del equipo es obligatorio'
  }
  if (typeof d['ubicacion'] !== 'string' || d['ubicacion'].trim().length < 2) {
    return 'La ubicación del equipo es obligatoria'
  }
  if (d['tipo'] !== undefined && !esTipoEquipo(d['tipo'])) {
    return 'El tipo de equipo no es válido (PORTATIL, ESCRITORIO, SERVIDOR, TODO_EN_UNO, OTRO)'
  }
  if (d['estado'] !== undefined && !esEstadoEquipo(d['estado'])) {
    return 'El estado del equipo no es válido (OPERATIVO, EN_MANTENIMIENTO, DE_BAJA, EN_REVISION)'
  }

  return {
    serial: d['serial'],
    nombre: d['nombre'],
    tipo: d['tipo'] as any,
    ubicacion: d['ubicacion'],
    estado: d['estado'] as any,
  }
}

export function rutasEquipos(deps: DependenciasEquipos): Router {
  const rutas = Router()

  // POST /api/equipos - Registrar un nuevo equipo
  rutas.post('/', async (req, res, next) => {
    const validacion = validarRegistroEquipo(req.body)
    if (typeof validacion === 'string') {
      return void res.status(400).json({ error: validacion })
    }

    try {
      const equipo = await deps.registrarEquipo.ejecutar(validacion)
      res.status(201).json(aEquipoDTO(equipo))
    } catch (error) {
      if (error instanceof SerialYaRegistrado) {
        return void res.status(409).json({ error: error.message })
      }
      next(error)
    }
  })

  // GET /api/equipos - Listar todos los equipos
  rutas.get('/', async (_req, res, next) => {
    try {
      const equipos = await deps.consultarEquipos.listarTodos()
      res.json(equipos.map(aEquipoDTO))
    } catch (error) {
      next(error)
    }
  })

  // GET /api/equipos/serial/:serial - Consultar equipo por serial
  rutas.get('/serial/:serial', async (req, res, next) => {
    try {
      const equipo = await deps.consultarEquipos.porSerial(req.params.serial)
      res.json(aEquipoDTO(equipo))
    } catch (error) {
      if (error instanceof EquipoNoEncontrado) {
        return void res.status(404).json({ error: error.message })
      }
      next(error)
    }
  })

  // GET /api/equipos/:id - Consultar equipo por ID
  rutas.get('/:id', async (req, res, next) => {
    const id = Number(req.params.id)
    if (isNaN(id)) {
      return void res.status(400).json({ error: 'El ID del equipo debe ser un número entero' })
    }

    try {
      const equipo = await deps.consultarEquipos.porId(id)
      res.json(aEquipoDTO(equipo))
    } catch (error) {
      if (error instanceof EquipoNoEncontrado) {
        return void res.status(404).json({ error: error.message })
      }
      next(error)
    }
  })

  return rutas
}
