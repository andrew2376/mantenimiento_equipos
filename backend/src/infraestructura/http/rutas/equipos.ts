import { Router } from 'express'

import {
  aEquipoDTO,
  esTipoEquipo
} from '../../../dominio/modelo/Equipo.js'

import type {
  RegistrarEquipo,
  RegistroEquipoDTO
} from '../../../aplicacion/casos-uso/RegistrarEquipo.js'

import {
  NumeroSerieYaRegistrado
} from '../../../aplicacion/casos-uso/RegistrarEquipo.js'

import type {
  ConsultarEquipos
} from '../../../aplicacion/casos-uso/ConsultarEquipos.js'

import {
  EquipoNoEncontrado
} from '../../../aplicacion/casos-uso/ConsultarEquipos.js'

import type {
  ActualizarEquipo,
  ActualizarEquipoDTO
} from '../../../aplicacion/casos-uso/ActualizarEquipo.js'


export interface DependenciasEquipos {

  registrarEquipo: RegistrarEquipo

  consultarEquipos: ConsultarEquipos

  actualizarEquipo: ActualizarEquipo

}


// ==========================================
// VALIDACIÓN PARA REGISTRAR EQUIPO
// ==========================================

function validarRegistroEquipo(
  cuerpo: unknown
): RegistroEquipoDTO | string {

  const d =
    (cuerpo ?? {}) as Record<string, unknown>


  if (
    typeof d['codigoInventario'] !== 'string' ||
    d['codigoInventario'].trim().length < 2
  ) {

    return 'El código de inventario es obligatorio'

  }


  if (
    typeof d['nombre'] !== 'string' ||
    d['nombre'].trim().length < 2
  ) {

    return 'El nombre del equipo es obligatorio'

  }


  if (
    typeof d['marca'] !== 'string' ||
    d['marca'].trim().length < 2
  ) {

    return 'La marca del equipo es obligatoria'

  }


  if (
    typeof d['ubicacion'] !== 'string' ||
    d['ubicacion'].trim().length < 2
  ) {

    return 'La ubicación del equipo es obligatoria'

  }


  if (
    d['tipo'] !== undefined &&
    !esTipoEquipo(d['tipo'])
  ) {

    return (
      'El tipo de equipo no es válido ' +
      '(PORTATIL, ESCRITORIO, SERVIDOR, TODO_EN_UNO, OTRO)'
    )

  }


  if (
    d['estado'] !== undefined &&
    (
      typeof d['estado'] !== 'number' ||
      !Number.isInteger(d['estado'])
    )
  ) {

    return 'El estado del equipo debe ser un número entero'

  }


  if (
    d['numeroSerie'] !== undefined &&
    d['numeroSerie'] !== null &&
    typeof d['numeroSerie'] !== 'string'
  ) {

    return 'El número de serie debe ser un texto'

  }


  return {

    codigoInventario:
      d['codigoInventario'] as string,

    nombre:
      d['nombre'] as string,

    tipo:
      d['tipo'] as RegistroEquipoDTO['tipo'],

    marca:
      d['marca'] as string,

    modelo:
      typeof d['modelo'] === 'string'
        ? d['modelo']
        : undefined,

    numeroSerie:
      typeof d['numeroSerie'] === 'string'
        ? d['numeroSerie']
        : undefined,

    ubicacion:
      d['ubicacion'] as string,

    estado:
      typeof d['estado'] === 'number'
        ? d['estado']
        : undefined

  }

}


// ==========================================
// VALIDACIÓN PARA ACTUALIZAR EQUIPO
// ==========================================

function validarActualizarEquipo(
  id: number,
  cuerpo: unknown
): ActualizarEquipoDTO | string {

  const d =
    (cuerpo ?? {}) as Record<string, unknown>


  if (
    typeof d['codigoInventario'] !== 'undefined' &&
    (
      typeof d['codigoInventario'] !== 'string' ||
      d['codigoInventario'].trim().length < 2
    )
  ) {

    return 'El código de inventario no es válido'

  }


  if (
    typeof d['nombre'] !== 'undefined' &&
    (
      typeof d['nombre'] !== 'string' ||
      d['nombre'].trim().length < 2
    )
  ) {

    return 'El nombre del equipo no es válido'

  }


  if (
    typeof d['tipo'] !== 'undefined' &&
    !esTipoEquipo(d['tipo'])
  ) {

    return (
      'El tipo de equipo no es válido ' +
      '(PORTATIL, ESCRITORIO, SERVIDOR, TODO_EN_UNO, OTRO)'
    )

  }


  if (
    typeof d['marca'] !== 'undefined' &&
    (
      typeof d['marca'] !== 'string' ||
      d['marca'].trim().length < 2
    )
  ) {

    return 'La marca del equipo no es válida'

  }


  if (
    typeof d['modelo'] !== 'undefined' &&
    d['modelo'] !== null &&
    typeof d['modelo'] !== 'string'
  ) {

    return 'El modelo debe ser un texto'

  }


  if (
    typeof d['numeroSerie'] !== 'undefined' &&
    d['numeroSerie'] !== null &&
    typeof d['numeroSerie'] !== 'string'
  ) {

    return 'El número de serie debe ser un texto'

  }


  if (
    typeof d['ubicacion'] !== 'undefined' &&
    (
      typeof d['ubicacion'] !== 'string' ||
      d['ubicacion'].trim().length < 2
    )
  ) {

    return 'La ubicación del equipo no es válida'

  }


  if (
    typeof d['estado'] !== 'undefined' &&
    (
      typeof d['estado'] !== 'number' ||
      !Number.isInteger(d['estado'])
    )
  ) {

    return 'El estado del equipo debe ser un número entero'

  }


  return {

    id,

    codigoInventario:
      typeof d['codigoInventario'] === 'string'
        ? d['codigoInventario']
        : undefined,

    nombre:
      typeof d['nombre'] === 'string'
        ? d['nombre']
        : undefined,

    tipo:
      esTipoEquipo(d['tipo'])
        ? d['tipo']
        : undefined,

    marca:
      typeof d['marca'] === 'string'
        ? d['marca']
        : undefined,

    modelo:
      d['modelo'] === null
        ? null
        : typeof d['modelo'] === 'string'
          ? d['modelo']
          : undefined,

    numeroSerie:
      d['numeroSerie'] === null
        ? null
        : typeof d['numeroSerie'] === 'string'
          ? d['numeroSerie']
          : undefined,

    ubicacion:
      typeof d['ubicacion'] === 'string'
        ? d['ubicacion']
        : undefined,

    estado:
      typeof d['estado'] === 'number'
        ? d['estado']
        : undefined

  }

}


// ==========================================
// RUTAS
// ==========================================

export function rutasEquipos(
  deps: DependenciasEquipos
): Router {

  const rutas = Router()


  // ========================================
  // POST /api/equipos
  // Registrar un nuevo equipo
  // ========================================

  rutas.post(
    '/',
    async (req, res, next) => {

      const validacion =
        validarRegistroEquipo(req.body)


      if (typeof validacion === 'string') {

        return void res
          .status(400)
          .json({
            error: validacion
          })

      }


      try {

        const equipo =
          await deps.registrarEquipo.ejecutar(
            validacion
          )


        res
          .status(201)
          .json(aEquipoDTO(equipo))


      } catch (error) {

        if (
          error instanceof NumeroSerieYaRegistrado
        ) {

          return void res
            .status(409)
            .json({
              error: error.message
            })

        }


        next(error)

      }

    }
  )


  // ========================================
  // GET /api/equipos
  // Listar todos los equipos
  // ========================================

  rutas.get(
    '/',
    async (_req, res, next) => {

      try {

        const equipos =
          await deps.consultarEquipos.listarTodos()


        res.json(
          equipos.map(aEquipoDTO)
        )


      } catch (error) {

        next(error)

      }

    }
  )


  // ========================================
  // GET /api/equipos/serial/:serial
  // Consultar por número de serie
  // ========================================

  rutas.get(
    '/serial/:serial',
    async (req, res, next) => {

      try {

        const equipo =
          await deps.consultarEquipos.porSerial(
            req.params.serial
          )


        res.json(
          aEquipoDTO(equipo)
        )


      } catch (error) {

        if (
          error instanceof EquipoNoEncontrado
        ) {

          return void res
            .status(404)
            .json({
              error: error.message
            })

        }


        next(error)

      }

    }
  )


  // ========================================
  // GET /api/equipos/:id
  // Consultar equipo por ID
  // ========================================

  rutas.get(
    '/:id',
    async (req, res, next) => {

      const id =
        Number(req.params.id)


      if (!Number.isInteger(id)) {

        return void res
          .status(400)
          .json({
            error:
              'El ID del equipo debe ser un número entero'
          })

      }


      try {

        const equipo =
          await deps.consultarEquipos.porId(id)


        res.json(
          aEquipoDTO(equipo)
        )


      } catch (error) {

        if (
          error instanceof EquipoNoEncontrado
        ) {

          return void res
            .status(404)
            .json({
              error: error.message
            })

        }


        next(error)

      }

    }
  )


  // ========================================
  // PUT /api/equipos/:id
  // Actualizar equipo
  // ========================================

  rutas.put(
    '/:id',
    async (req, res, next) => {

      const id =
        Number(req.params.id)


      if (!Number.isInteger(id)) {

        return void res
          .status(400)
          .json({
            error:
              'El ID del equipo debe ser un número entero'
          })

      }


      const validacion =
        validarActualizarEquipo(
          id,
          req.body
        )


      if (typeof validacion === 'string') {

        return void res
          .status(400)
          .json({
            error: validacion
          })

      }


      try {

        const equipo =
          await deps.actualizarEquipo.ejecutar(
            validacion
          )


        res.json(
          aEquipoDTO(equipo)
        )


      } catch (error) {

        if (
          error instanceof EquipoNoEncontrado
        ) {

          return void res
            .status(404)
            .json({
              error: error.message
            })

        }


        next(error)

      }

    }
  )


  return rutas

}