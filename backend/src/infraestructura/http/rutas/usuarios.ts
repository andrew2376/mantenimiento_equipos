import { Router } from 'express'

import type { RegistrarUsuario } from '../../../aplicacion/casos-uso/RegistrarUsuario'

import type { ConsultarUsuarios } from '../../../aplicacion/casos-uso/ConsultarUsuarios'

import type { ActualizarUsuario } from '../../../aplicacion/casos-uso/ActualizarUsuario'

export interface DependenciasUsuarios {

  registrarUsuario: RegistrarUsuario

  consultarUsuarios: ConsultarUsuarios

  actualizarUsuario: ActualizarUsuario

}

export function rutasUsuarios(
  deps: DependenciasUsuarios
): Router {

  const router = Router()


  // POST /api/usuarios
  router.post('/', async (req, res, next) => {

    try {

      const {
        nombre,
        correo,
        clave,
        rol,
        activo
      } = req.body

      if (
        typeof nombre !== 'string' ||
        typeof correo !== 'string' ||
        typeof clave !== 'string'
      ) {

        res.status(400).json({
          error: 'nombre, correo y clave son obligatorios'
        })

        return
      }

      if (
        nombre.trim().length === 0 ||
        correo.trim().length === 0 ||
        clave.length === 0
      ) {

        res.status(400).json({
          error: 'nombre, correo y clave no pueden estar vacíos'
        })

        return
      }

      const usuario =
        await deps.registrarUsuario.ejecutar({
          nombre,
          correo,
          clave,
          rol,
          activo
        })

      res.status(201).json({
        id: usuario.id,
        nombre: usuario.nombre,
        correo: usuario.correo,
        rol: usuario.rol,
        activo: usuario.activo,
        creadoEn: usuario.creadoEn.toISOString()
      })

    } catch (error) {

      next(error)

    }

  })


  // GET /api/usuarios
  router.get('/', async (_req, res, next) => {

    try {

      const usuarios =
        await deps.consultarUsuarios.listarTodos()

      res.json(
        usuarios.map(usuario => ({

          id: usuario.id,

          nombre: usuario.nombre,

          correo: usuario.correo,

          rol: usuario.rol,

          activo: usuario.activo,

          creadoEn: usuario.creadoEn.toISOString()

        }))
      )

    } catch (error) {

      next(error)

    }

  })


  // GET /api/usuarios/:id
  router.get('/:id', async (req, res, next) => {

    try {

      const id = Number(req.params.id)

      if (!Number.isInteger(id) || id <= 0) {

        res.status(400).json({
          error: 'ID inválido'
        })

        return

      }

      const usuario =
        await deps.consultarUsuarios.porId(id)

      res.json({

        id: usuario.id,

        nombre: usuario.nombre,

        correo: usuario.correo,

        rol: usuario.rol,

        activo: usuario.activo,

        creadoEn: usuario.creadoEn.toISOString()

      })

    } catch (error) {

      next(error)

    }

  })


  return router

}