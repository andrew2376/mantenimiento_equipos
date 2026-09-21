export interface Repuesto {
  id: number
  codigo: string
  nombre: string
  descripcion: string | null
  stock: number
  precioUnitario: number
  creadoEn: Date
}

export type RepuestoNuevo = Omit<Repuesto, 'id' | 'creadoEn'>

export interface RepuestoDTO {
  id: number
  codigo: string
  nombre: string
  descripcion: string | null
  stock: number
  precioUnitario: number
  creadoEn: string
}

export interface RepuestoUsado {
  id: number
  mantenimientoId: number
  repuestoId: number
  cantidad: number
  costoUnitario: number
  creadoEn: Date
  repuestoNombre?: string
  repuestoCodigo?: string
}

export interface RepuestoUsadoDTO {
  id: number
  mantenimientoId: number
  repuestoId: number
  cantidad: number
  costoUnitario: number
  subtotal: number
  creadoEn: string
  repuestoNombre?: string
  repuestoCodigo?: string
}

export function aRepuestoDTO(r: Repuesto): RepuestoDTO {
  return {
    id: r.id,
    codigo: r.codigo,
    nombre: r.nombre,
    descripcion: r.descripcion,
    stock: r.stock,
    precioUnitario: Number(r.precioUnitario),
    creadoEn: r.creadoEn.toISOString()
  }
}

export function aRepuestoUsadoDTO(ru: RepuestoUsado): RepuestoUsadoDTO {
  const costo = Number(ru.costoUnitario)
  return {
    id: ru.id,
    mantenimientoId: ru.mantenimientoId,
    repuestoId: ru.repuestoId,
    cantidad: ru.cantidad,
    costoUnitario: costo,
    subtotal: costo * ru.cantidad,
    creadoEn: ru.creadoEn.toISOString(),
    repuestoNombre: ru.repuestoNombre,
    repuestoCodigo: ru.repuestoCodigo
  }
}
