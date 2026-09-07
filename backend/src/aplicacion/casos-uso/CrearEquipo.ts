import { Equipo } from '../../dominio/modelo/Equipo.js'
import { EquipoRepository } from '../../dominio/puertos/EquipoRepository.js'

export class CrearEquipo {
  constructor(private readonly equipoRepository: EquipoRepository) {}

  async ejecutar(equipo: Equipo): Promise<Equipo> {
    return await this.equipoRepository.crear(equipo)
  }
}