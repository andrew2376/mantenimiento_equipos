import type {
  Mantenimiento
} from '../../dominio/modelo/Mantenimiento.js'

import type {
  MantenimientoDAO
} from '../../dominio/puertos/index.js'

import { MantenimientoNoEncontrado } from './ConsultarMantenimientos.js'

export class DiagnosticoInvalido extends Error {
  constructor(mensaje: string = 'El diagnóstico debe tener al menos 10 caracteres detallando la falla y la solución') {
    super(mensaje)
    this.name = 'DiagnosticoInvalido'
  }
}

export class TecnicoInvalido extends Error {
  constructor(mensaje: string = 'El nombre del técnico es obligatorio (mínimo 2 caracteres)') {
    super(mensaje)
    this.name = 'TecnicoInvalido'
  }
}

export class MantenimientoNoModificable extends Error {
  constructor(estado: string) {
    super(`No se puede registrar diagnóstico en un mantenimiento con estado ${estado}`)
    this.name = 'MantenimientoNoModificable'
  }
}

export interface RegistrarDiagnosticoDTO {
  mantenimientoId: number
  diagnostico: string
  tecnico: string
}

export class RegistrarDiagnostico {
  constructor(
    private readonly mantenimientos: MantenimientoDAO
  ) {}

  async ejecutar(datos: RegistrarDiagnosticoDTO): Promise<Mantenimiento> {
    const id = Number(datos.mantenimientoId)
    if (isNaN(id) || id <= 0) {
      throw new Error('El ID del mantenimiento debe ser un número entero positivo')
    }

    const diagnosticoLimpio = typeof datos.diagnostico === 'string' ? datos.diagnostico.trim() : ''
    if (diagnosticoLimpio.length < 10) {
      throw new DiagnosticoInvalido()
    }

    const tecnicoLimpio = typeof datos.tecnico === 'string' ? datos.tecnico.trim() : ''
    if (tecnicoLimpio.length < 2) {
      throw new TecnicoInvalido()
    }

    const mantenimiento = await this.mantenimientos.porId(id)
    if (!mantenimiento) {
      throw new MantenimientoNoEncontrado(id)
    }

    // Regla de integridad: No se puede diagnosticar un mantenimiento que ya concluyó o fue cancelado
    if (mantenimiento.estado === 'FINALIZADO' || mantenimiento.estado === 'CANCELADO') {
      throw new MantenimientoNoModificable(mantenimiento.estado)
    }

    // Transición de estado: Si está PENDIENTE, pasa a EN_PROCESO al registrar el diagnóstico
    const nuevoEstado = mantenimiento.estado === 'PENDIENTE' ? 'EN_PROCESO' : mantenimiento.estado

    const actualizado = await this.mantenimientos.actualizar(id, {
      diagnostico: diagnosticoLimpio,
      tecnico: tecnicoLimpio,
      estado: nuevoEstado
    })

    if (!actualizado) {
      throw new MantenimientoNoEncontrado(id)
    }

    return actualizado
  }
}
