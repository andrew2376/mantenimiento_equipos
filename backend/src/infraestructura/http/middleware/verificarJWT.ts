import type {
  Request,
  Response,
  NextFunction
} from 'express'

import jwt from 'jsonwebtoken'


export interface DatosJWT {

  id: number

  correo: string

  rol: string

}


export function verificarJWT(
  req: Request,
  res: Response,
  next: NextFunction
): void {

  // ==========================================
  // OBTENER HEADER AUTHORIZATION
  // ==========================================

  const authorization =
    req.headers.authorization


  if (!authorization) {

    res.status(401).json({
      error: 'Token de autenticación requerido'
    })

    return
  }


  // ==========================================
  // VALIDAR FORMATO BEARER
  // ==========================================

  const partes =
    authorization.split(' ')


  if (
    partes.length !== 2 ||
    partes[0] !== 'Bearer'
  ) {

    res.status(401).json({
      error: 'Formato de token inválido'
    })

    return
  }


  const token = partes[1]


  if (!token) {

    res.status(401).json({
      error: 'Token de autenticación requerido'
    })

    return
  }


  // ==========================================
  // OBTENER SECRET
  // ==========================================

  const secret =
    process.env['JWT_SECRET']


  if (!secret) {

    res.status(500).json({
      error: 'JWT_SECRET no está configurado'
    })

    return
  }


  // ==========================================
  // VERIFICAR TOKEN
  // ==========================================

  try {

    const datos =
      jwt.verify(
        token,
        secret
      ) as DatosJWT


    // Guardamos los datos del token
    // para poder utilizarlos posteriormente.

    res.locals.usuario = datos


    next()

  } catch {

    res.status(401).json({
      error: 'Token inválido o expirado'
    })

    return
  }

}