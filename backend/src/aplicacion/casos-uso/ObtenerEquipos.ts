import type { EquipoDTO } from '../../dominio/modelo/Equipo.js'
import { aEquipoDTO } from '../../dominio/modelo/Equipo.js'
import type { EquipoDAO } from '../../dominio/puertos/index.js'

export class ObtenerEquipos {
  constructor(private readonly equipoDAO: EquipoDAO) {}

  async ejecutar(): Promise<EquipoDTO[]> {
    const equipos = await this.equipoDAO.listar()
    return equipos.map(aEquipoDTO)
  }

  async ejecutarPorId(id: number): Promise<EquipoDTO | null> {
    const equipo = await this.equipoDAO.porId(id)
    return equipo ? aEquipoDTO(equipo) : null
  }
}

export { ObtenerEquipos as ListarEquipos }
