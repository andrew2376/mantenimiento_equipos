import type { Equipo, EstadoEquipo, TipoEquipo } from '../../dominio/modelo/Equipo'
import type { EquipoDAO } from '../../dominio/puertos'

export class SerialYaRegistrado extends Error {
  constructor(serial: string) {
    super(`Ya existe un equipo registrado con el serial: ${serial}`)
    this.name = 'SerialYaRegistrado'
  }
}

export interface RegistroEquipoDTO {
  serial: string
  nombre: string
  tipo?: TipoEquipo
  ubicacion: string
  estado?: EstadoEquipo
}

export class RegistrarEquipo {
  constructor(private readonly equipos: EquipoDAO) {}

  async ejecutar(datos: RegistroEquipoDTO): Promise<Equipo> {
    const serial = datos.serial.trim().toUpperCase()
    const existente = await this.equipos.porSerial(serial)
    if (existente) {
      throw new SerialYaRegistrado(serial)
    }

    return this.equipos.guardar({
      serial,
      nombre: datos.nombre.trim(),
      tipo: datos.tipo ?? 'PORTATIL',
      ubicacion: datos.ubicacion.trim(),
      estado: datos.estado ?? 'OPERATIVO',
    })
  }
}
