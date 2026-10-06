import type {
  Usuario,
  UsuarioNuevo,
  RolUsuario
} from '../../dominio/modelo/Usuario.js'

import type {
  UsuarioDAO,
  ServicioClaves
} from '../../dominio/puertos/index.js'

export class CorreoYaRegistrado extends Error {

  constructor(correo: string) {
    super(
      `Ya existe un usuario registrado con el correo: ${correo}`
    )

    this.name = 'CorreoYaRegistrado'
  }

}

export interface RegistroUsuarioDTO {

  nombre: string

  correo: string

  clave: string

  rol?: RolUsuario

  activo?: boolean

}

export class RegistrarUsuario {

  constructor(
    private readonly usuarios: UsuarioDAO,
    private readonly servicioClaves: ServicioClaves
  ) {}

  async ejecutar(
    datos: RegistroUsuarioDTO
  ): Promise<Usuario> {

    const correo = datos.correo
      .trim()
      .toLowerCase()

    const existente =
      await this.usuarios.porCorreo(correo)

    if (existente) {
      throw new CorreoYaRegistrado(correo)
    }

    const claveHash =
      await this.servicioClaves.generarHash(
        datos.clave
      )

    const nuevoUsuario: UsuarioNuevo = {

      nombre: datos.nombre.trim(),

      correo,

      claveHash,

      rol: datos.rol ?? 'SOLICITANTE',

      activo: datos.activo ?? true

    }

    return this.usuarios.guardar(
      nuevoUsuario
    )
  }

}