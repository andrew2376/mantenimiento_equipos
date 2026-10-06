import jwt from 'jsonwebtoken'

import type {
  UsuarioDAO,
  ServicioClaves
} from '../../dominio/puertos/index.js'

import type {
  RolUsuario
} from '../../dominio/modelo/Usuario.js'

export interface DatosInicioSesion {
  correo: string
  clave: string
}

export interface ResultadoInicioSesion {
  token: string
  usuario: {
    id: number
    nombre: string
    correo: string
    rol: RolUsuario
    activo: boolean
    creadoEn: string
  }
}

export class IniciarSesion {

  constructor(
    private readonly usuarioDAO: UsuarioDAO,
    private readonly servicioClaves: ServicioClaves
  ) {}

  async ejecutar(
    datos: DatosInicioSesion
  ): Promise<ResultadoInicioSesion> {

    const correo = datos.correo.trim()

    if (
      correo.length === 0 ||
      datos.clave.length === 0
    ) {
      throw new Error(
        'Correo y clave son obligatorios'
      )
    }

    const usuario =
      await this.usuarioDAO.porCorreo(correo)

    if (!usuario) {
      throw new Error(
        'Correo o clave incorrectos'
      )
    }

    const claveCorrecta =
      await this.servicioClaves.comparar(
        datos.clave,
        usuario.claveHash
      )

    if (!claveCorrecta) {
      throw new Error(
        'Correo o clave incorrectos'
      )
    }

    if (!usuario.activo) {
      throw new Error(
        'El usuario está inactivo'
      )
    }

    const secret =
      process.env['JWT_SECRET']

    if (!secret) {
      throw new Error(
        'JWT_SECRET no está configurado'
      )
    }

    const token = jwt.sign(
      {
        id: usuario.id,
        correo: usuario.correo,
        rol: usuario.rol
      },
      secret,
      {
        expiresIn: '8h'
      }
    )

    return {
      token,

      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        correo: usuario.correo,
        rol: usuario.rol,
        activo: usuario.activo,
        creadoEn: usuario.creadoEn.toISOString()
      }
    }
  }
}