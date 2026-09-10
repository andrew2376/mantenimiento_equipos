import type {
  Usuario,
  RolUsuario
} from '../../dominio/modelo/Usuario.js'

import type {
  UsuarioDAO
} from '../../dominio/puertos/index.js'

export interface ActualizarUsuarioDTO {
  nombre?: string
  correo?: string
  rol?: RolUsuario
  activo?: boolean
}

export class ActualizarUsuario {

  constructor(
    private readonly usuarios: UsuarioDAO
  ) {}

  async ejecutar(
    id: number,
    datos: ActualizarUsuarioDTO
  ): Promise<Usuario> {

    const usuario =
      await this.usuarios.porId(id)

    if (!usuario) {
      throw new Error(
        `Usuario no encontrado (ID: ${id})`
      )
    }

    const usuarioActualizado: Usuario = {
      ...usuario,

      nombre:
        datos.nombre !== undefined
          ? datos.nombre.trim()
          : usuario.nombre,

      correo:
        datos.correo !== undefined
          ? datos.correo.trim().toLowerCase()
          : usuario.correo,

      rol:
        datos.rol !== undefined
          ? datos.rol
          : usuario.rol,

      activo:
        datos.activo !== undefined
          ? datos.activo
          : usuario.activo
    }

    return this.usuarios.actualizar(
      usuarioActualizado
    )
  }
}