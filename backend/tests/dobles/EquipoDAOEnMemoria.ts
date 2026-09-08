import type { Equipo, EquipoNuevo } from '../../src/dominio/modelo/Equipo.js'
import type { EquipoDAO } from '../../src/dominio/puertos/index.js'

export class EquipoDAOEnMemoria implements EquipoDAO {
  private equipos: Equipo[] = []
  private idConsecutivo = 1

  async guardar(datos: EquipoNuevo | Equipo): Promise<Equipo> {
    const id = 'id' in datos && datos.id ? datos.id : this.idConsecutivo++
    const equipo: Equipo = {
      ...datos,
      id,
      createdAt: new Date(),
      updatedAt: new Date()
    }
    this.equipos.push(equipo)
    return equipo
  }

  async listar(): Promise<Equipo[]> {
    return [...this.equipos]
  }

  async porId(id: number): Promise<Equipo | null> {
    return this.equipos.find((e) => e.id === id) ?? null
  }

  async porCodigoInventario(codigo: string): Promise<Equipo | null> {
    return this.equipos.find((e) => e.codigoInventario === codigo) ?? null
  }

  async actualizar(equipo: Equipo): Promise<Equipo> {
    const index = this.equipos.findIndex((e) => e.id === equipo.id)
    if (index === -1) throw new Error('Equipo no encontrado')
    this.equipos[index] = { ...equipo, updatedAt: new Date() }
    return this.equipos[index]
  }

  async eliminar(id: number): Promise<void> {
    this.equipos = this.equipos.filter((e) => e.id !== id)
  }
}

