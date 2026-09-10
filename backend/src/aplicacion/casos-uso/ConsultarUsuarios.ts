import type { Usuario } from '../../dominio/modelo/Usuario.js'
import type { UsuarioDAO } from '../../dominio/puertos/index.js'

export class UsuarioNoEncontrado extends Error {
  constructor(id: number) {
    super(`Usuario no encontrado (ID: ${id})`)
    this.name = 'UsuarioNoEncontrado'
  }
}

export class ConsultarUsuarios {
  constructor(
    private readonly usuarios: UsuarioDAO
  ) {}

  async porId(id: number): Promise<Usuario> {
    const usuario = await this.usuarios.porId(id)

    if (!usuario) {
      throw new UsuarioNoEncontrado(id)
    }

    return usuario
  }

  async porCorreo(correo: string): Promise<Usuario> {
    const usuario = await this.usuarios.porCorreo(
      correo.trim().toLowerCase()
    )

    if (!usuario) {
      throw new Error(
        `Usuario no encontrado con el correo: ${correo}`
      )
    }

    return usuario
  }

  async listarTodos(): Promise<Usuario[]> {
    return this.usuarios.todos()
  }
}