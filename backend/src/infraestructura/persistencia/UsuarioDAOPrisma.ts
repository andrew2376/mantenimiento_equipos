import type { PrismaClient } from './generado/client'

import type {
  Usuario,
  UsuarioNuevo,
  RolUsuario
} from '../../dominio/modelo/Usuario.js'

import type {
  UsuarioDAO
} from '../../dominio/puertos/index.js'

export class UsuarioDAOPrisma implements UsuarioDAO {

  constructor(
    private readonly prisma: PrismaClient
  ) {}

  async guardar(
    usuario: UsuarioNuevo
  ): Promise<Usuario> {

    const fila = await this.prisma.usuario.create({
      data: {
        nombre: usuario.nombre,
        correo: usuario.correo,
        claveHash: usuario.claveHash,
        rol: usuario.rol,
        activo: usuario.activo
      }
    })

    return {
      id: fila.id,
      nombre: fila.nombre,
      correo: fila.correo,
      claveHash: fila.claveHash,
      rol: fila.rol as RolUsuario,
      activo: fila.activo,
      creadoEn: fila.creadoEn
    }
  }

  async porId(
    id: number
  ): Promise<Usuario | null> {

    const fila =
      await this.prisma.usuario.findUnique({
        where: { id }
      })

    if (!fila) {
      return null
    }

    return {
      id: fila.id,
      nombre: fila.nombre,
      correo: fila.correo,
      claveHash: fila.claveHash,
      rol: fila.rol as RolUsuario,
      activo: fila.activo,
      creadoEn: fila.creadoEn
    }
  }

  async porCorreo(
    correo: string
  ): Promise<Usuario | null> {

    const fila =
      await this.prisma.usuario.findUnique({
        where: { correo }
      })

    if (!fila) {
      return null
    }

    return {
      id: fila.id,
      nombre: fila.nombre,
      correo: fila.correo,
      claveHash: fila.claveHash,
      rol: fila.rol as RolUsuario,
      activo: fila.activo,
      creadoEn: fila.creadoEn
    }
  }

  async todos(): Promise<Usuario[]> {

    const filas =
      await this.prisma.usuario.findMany({
        orderBy: {
          id: 'asc'
        }
      })

    return filas.map((fila) => ({
      id: fila.id,
      nombre: fila.nombre,
      correo: fila.correo,
      claveHash: fila.claveHash,
      rol: fila.rol as RolUsuario,
      activo: fila.activo,
      creadoEn: fila.creadoEn
    }))
  }

  async actualizar(
    usuario: Usuario
  ): Promise<Usuario> {

    const fila =
      await this.prisma.usuario.update({
        where: {
          id: usuario.id
        },
        data: {
          nombre: usuario.nombre,
          correo: usuario.correo,
          claveHash: usuario.claveHash,
          rol: usuario.rol,
          activo: usuario.activo
        }
      })

    return {
      id: fila.id,
      nombre: fila.nombre,
      correo: fila.correo,
      claveHash: fila.claveHash,
      rol: fila.rol as RolUsuario,
      activo: fila.activo,
      creadoEn: fila.creadoEn
    }
  }
}