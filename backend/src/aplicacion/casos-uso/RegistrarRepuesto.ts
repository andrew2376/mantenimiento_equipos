import type { Repuesto, RepuestoNuevo } from '../../dominio/modelo/Repuesto.js'
import type { RepuestoDAO } from '../../dominio/puertos/index.js'

export class RepuestoDuplicado extends Error {
  constructor(codigo: string) {
    super(`Ya existe un repuesto registrado con el código "${codigo}"`)
    this.name = 'RepuestoDuplicado'
  }
}

export class DatosRepuestoInvalidos extends Error {
  constructor(mensaje: string) {
    super(mensaje)
    this.name = 'DatosRepuestoInvalidos'
  }
}

export interface RegistroRepuestoDTO {
  codigo: string
  nombre: string
  descripcion?: string | null
  stock?: number
  precioUnitario?: number
}

export class RegistrarRepuesto {
  constructor(private readonly repuestoDAO: RepuestoDAO) {}

  async ejecutar(datos: RegistroRepuestoDTO): Promise<Repuesto> {
    const codigo = datos.codigo.trim().toUpperCase()
    const nombre = datos.nombre.trim()

    if (!codigo) {
      throw new DatosRepuestoInvalidos('El código del repuesto es obligatorio')
    }

    if (!nombre) {
      throw new DatosRepuestoInvalidos('El nombre del repuesto es obligatorio')
    }

    const stock = Number(datos.stock ?? 0)
    if (isNaN(stock) || stock < 0) {
      throw new DatosRepuestoInvalidos('El stock no puede ser negativo')
    }

    const precioUnitario = Number(datos.precioUnitario ?? 0)
    if (isNaN(precioUnitario) || precioUnitario < 0) {
      throw new DatosRepuestoInvalidos('El precio unitario no puede ser negativo')
    }

    const existente = await this.repuestoDAO.porCodigo(codigo)
    if (existente) {
      throw new RepuestoDuplicado(codigo)
    }

    const nuevo: RepuestoNuevo = {
      codigo,
      nombre,
      descripcion: datos.descripcion?.trim() || null,
      stock,
      precioUnitario
    }

    return this.repuestoDAO.guardar(nuevo)
  }
}
