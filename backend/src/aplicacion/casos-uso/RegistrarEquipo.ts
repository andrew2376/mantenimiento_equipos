import type { Equipo, EquipoNuevo, EquipoDTO } from '../../dominio/modelo/Equipo.js'
import { aEquipoDTO } from '../../dominio/modelo/Equipo.js'
import type { EquipoDAO } from '../../dominio/puertos/index.js'

export class RegistrarEquipo {
  constructor(private readonly equipoDAO: EquipoDAO) {}

  async ejecutar(datos: EquipoNuevo | Equipo): Promise<EquipoDTO> {
    const equipo = await this.equipoDAO.guardar(datos)
    return aEquipoDTO(equipo)
  }
}

// Alias para compatibilidad con código previo
export { RegistrarEquipo as CrearEquipo }

