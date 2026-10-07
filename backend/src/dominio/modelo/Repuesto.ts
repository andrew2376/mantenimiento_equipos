/**
 * Entidad de Dominio: Repuesto
 */
export interface Repuesto {
  id: number
  nombre: string
  codigo: string
  descripcion?: string | null
  costoUnitario: number
  stock: number
  activo: boolean
  creadoEn: Date
}

/**
 * Estructura para registrar un nuevo repuesto en el catálogo.
 * El DAO asigna id y fecha.
 */
export type RepuestoNuevo = Omit<Repuesto, 'id' | 'creadoEn'>

/**
 * Estructura para asociar un repuesto a un mantenimiento.
 */
export interface MantenimientoRepuesto {
  id: number
  mantenimientoId: number
  repuestoId: number
  cantidad: number
  costoUnitario: number
  creadoEn: Date
  repuesto?: Repuesto
}

export type MantenimientoRepuestoNuevo = Omit<MantenimientoRepuesto, 'id' | 'creadoEn' | 'repuesto'>

/**
 * DTO que viaja al exterior por HTTP.
 */
export interface RepuestoDTO {
  id: number
  nombre: string
  codigo: string
  descripcion?: string | null
  costoUnitario: number
  stock: number
  activo: boolean
  creadoEn: string
}

export interface MantenimientoRepuestoDTO {
  id: number
  mantenimientoId: number
  repuestoId: number
  cantidad: number
  costoUnitario: number
  subtotal: number
  creadoEn: string
  repuesto?: RepuestoDTO
}

export function aRepuestoDTO(repuesto: Repuesto): RepuestoDTO {
  return {
    id: repuesto.id,
    nombre: repuesto.nombre,
    codigo: repuesto.codigo,
    descripcion: repuesto.descripcion,
    costoUnitario: repuesto.costoUnitario,
    stock: repuesto.stock,
    activo: repuesto.activo,
    creadoEn: repuesto.creadoEn.toISOString()
  }
}

export function aMantenimientoRepuestoDTO(mr: MantenimientoRepuesto): MantenimientoRepuestoDTO {
  return {
    id: mr.id,
    mantenimientoId: mr.mantenimientoId,
    repuestoId: mr.repuestoId,
    cantidad: mr.cantidad,
    costoUnitario: mr.costoUnitario,
    subtotal: mr.cantidad * mr.costoUnitario,
    creadoEn: mr.creadoEn.toISOString(),
    repuesto: mr.repuesto ? aRepuestoDTO(mr.repuesto) : undefined
  }
}
