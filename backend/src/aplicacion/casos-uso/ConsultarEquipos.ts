import type { Equipo } from '../../dominio/modelo/Equipo'
import type { EquipoDAO } from '../../dominio/puertos'

export class EquipoNoEncontrado extends Error {
  constructor(idOserial: string | number) {
    super(`No se encontró el equipo con identificador: ${idOserial}`)
    this.name = 'EquipoNoEncontrado'
  }
}

export class ConsultarEquipos {
  constructor(private readonly equipos: EquipoDAO) {}

  async porId(id: number): Promise<Equipo> {
    const equipo = await this.equipos.porId(id)
    if (!equipo) throw new EquipoNoEncontrado(id)
    return equipo
  }

  async porSerial(serial: string): Promise<Equipo> {
    const equipo = await this.equipos.porSerial(serial.trim().toUpperCase())
    if (!equipo) throw new EquipoNoEncontrado(serial)
    return equipo
  }

  async listarTodos(): Promise<Equipo[]> {
    return this.equipos.listar()
  }
}
