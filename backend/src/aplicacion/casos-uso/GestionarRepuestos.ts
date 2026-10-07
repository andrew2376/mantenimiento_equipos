import type { Repuesto, RepuestoNuevo } from '../../dominio/modelo/Repuesto.js'
import type { RepuestoDAO } from '../../dominio/puertos/index.js'

export class RepuestoCodigoDuplicado extends Error {
  constructor(codigo: string) {
    super(`Ya existe un repuesto registrado con el código '${codigo}'`)
    this.name = 'RepuestoCodigoDuplicado'
  }
}

export class RepuestoNoEncontrado extends Error {
  constructor(id: number) {
    super(`No se encontró el repuesto con ID ${id}`)
    this.name = 'RepuestoNoEncontrado'
  }
}

export interface RegistroRepuestoDTO {
  nombre: string
  codigo: string
  descripcion?: string | null
  costoUnitario: number
  stock?: number
  activo?: boolean
}

export class GestionarRepuestos {
  constructor(private readonly repuestos: RepuestoDAO) {}

  async registrar(dto: RegistroRepuestoDTO): Promise<Repuesto> {
    const existe = await this.repuestos.porCodigo(dto.codigo.trim())
    if (existe) {
      throw new RepuestoCodigoDuplicado(dto.codigo.trim())
    }

    const nuevo: RepuestoNuevo = {
      nombre: dto.nombre.trim(),
      codigo: dto.codigo.trim(),
      descripcion: dto.descripcion?.trim() ?? null,
      costoUnitario: dto.costoUnitario,
      stock: dto.stock ?? 0,
      activo: dto.activo ?? true
    }

    return this.repuestos.guardar(nuevo)
  }

  async listarTodos(): Promise<Repuesto[]> {
    return this.repuestos.todos()
  }

  async porId(id: number): Promise<Repuesto> {
    const repuesto = await this.repuestos.porId(id)
    if (!repuesto) {
      throw new RepuestoNoEncontrado(id)
    }
    return repuesto
  }
}
