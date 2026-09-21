import type { Repuesto } from '../../dominio/modelo/Repuesto.js'
import type { RepuestoDAO } from '../../dominio/puertos/index.js'

export class RepuestoNoEncontrado extends Error {
  constructor(id: number) {
    super(`Repuesto con ID ${id} no encontrado`)
    this.name = 'RepuestoNoEncontrado'
  }
}

export class ConsultarRepuestos {
  constructor(private readonly repuestoDAO: RepuestoDAO) {}

  async todos(): Promise<Repuesto[]> {
    return this.repuestoDAO.todos()
  }

  async porId(id: number): Promise<Repuesto> {
    const repuesto = await this.repuestoDAO.porId(id)
    if (!repuesto) {
      throw new RepuestoNoEncontrado(id)
    }
    return repuesto
  }
}
