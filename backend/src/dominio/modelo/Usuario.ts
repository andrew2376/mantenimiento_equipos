export const ROLES_USUARIO = [
  'SOLICITANTE',
  'TECNICO',
  'ADMINISTRADOR',
  'SUPERVISOR'
] as const

export type RolUsuario = (typeof ROLES_USUARIO)[number]

/**
 * Entidad de Dominio: Usuario
 */
export interface Usuario {
  id: number
  nombre: string
  correo: string
  claveHash: string
  rol: RolUsuario
  activo: boolean
  creadoEn: Date
}

/**
 * Estructura para registrar un nuevo usuario.
 * El DAO asigna id y fecha.
 */
export type UsuarioNuevo = Omit<
  Usuario,
  'id' | 'creadoEn'
>

/**
 * DTO que viaja al exterior por HTTP.
 * No incluye claveHash por seguridad.
 */
export interface UsuarioDTO {
  id: number
  nombre: string
  correo: string
  rol: RolUsuario
  activo: boolean
  creadoEn: string
}

export function esRolUsuario(
  valor: unknown
): valor is RolUsuario {
  return ROLES_USUARIO.includes(
    valor as RolUsuario
  )
}

export function aUsuarioDTO(
  usuario: Usuario
): UsuarioDTO {
  return {
    id: usuario.id,
    nombre: usuario.nombre,
    correo: usuario.correo,
    rol: usuario.rol,
    activo: usuario.activo,
    creadoEn: usuario.creadoEn.toISOString()
  }
}