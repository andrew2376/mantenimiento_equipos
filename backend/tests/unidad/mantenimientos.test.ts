import { describe, it, expect, beforeEach } from 'vitest'
import { EquipoDAOEnMemoria } from '../dobles/EquipoDAOEnMemoria'
import { MantenimientoDAOEnMemoria } from '../dobles/MantenimientoDAOEnMemoria'
import { RegistrarEquipo } from '../../src/aplicacion/casos-uso/RegistrarEquipo'
import { RegistrarMantenimiento, EquipoInexistente } from '../../src/aplicacion/casos-uso/RegistrarMantenimiento'
import { ConsultarMantenimientos } from '../../src/aplicacion/casos-uso/ConsultarMantenimientos'
import { ActualizarEstadoMantenimiento } from '../../src/aplicacion/casos-uso/ActualizarEstadoMantenimiento'

describe('Módulo de Mantenimientos - Pruebas Unitarias', () => {
  let equipoDao: EquipoDAOEnMemoria
  let mantenimientoDao: MantenimientoDAOEnMemoria
  let registrarEquipo: RegistrarEquipo
  let registrarMantenimiento: RegistrarMantenimiento
  let consultarMantenimientos: ConsultarMantenimientos
  let actualizarEstado: ActualizarEstadoMantenimiento

  beforeEach(() => {
    equipoDao = new EquipoDAOEnMemoria()
    mantenimientoDao = new MantenimientoDAOEnMemoria()

    registrarEquipo = new RegistrarEquipo(equipoDao)
    registrarMantenimiento = new RegistrarMantenimiento(mantenimientoDao, equipoDao)
    consultarMantenimientos = new ConsultarMantenimientos(mantenimientoDao, equipoDao)
    actualizarEstado = new ActualizarEstadoMantenimiento(mantenimientoDao, equipoDao)
  })

  it('debe registrar un mantenimiento para un equipo existente y cambiar el estado del equipo a EN_MANTENIMIENTO', async () => {
    const equipo = await registrarEquipo.ejecutar({
      serial: 'EQ-200',
      nombre: 'Servidor Dell PowerEdge',
      ubicacion: 'Centro de Cómputo',
    })

    const mant = await registrarMantenimiento.ejecutar({
      equipoId: equipo.id,
      descripcion: 'Falla en disco duro secundario',
      tipo: 'CORRECTIVO',
      estado: 'PENDIENTE',
    })

    expect(mant.id).toBe(1)
    expect(mant.equipoId).toBe(equipo.id)
    expect(mant.estado).toBe('PENDIENTE')

    const equipoActualizado = await equipoDao.porId(equipo.id)
    expect(equipoActualizado?.estado).toBe('EN_MANTENIMIENTO')
  })

  it('debe lanzar error al intentar registrar mantenimiento para un equipo inexistente', async () => {
    await expect(
      registrarMantenimiento.ejecutar({
        equipoId: 9999,
        descripcion: 'Limpieza preventiva',
      })
    ).rejects.toThrow(EquipoInexistente)
  })

  it('debe consultar el historial de mantenimientos de un equipo', async () => {
    const equipo = await registrarEquipo.ejecutar({
      serial: 'EQ-300',
      nombre: 'Laptop Asus',
      ubicacion: 'Coordinación',
    })

    await registrarMantenimiento.ejecutar({
      equipoId: equipo.id,
      descripcion: 'Primer mantenimiento preventivo',
      tipo: 'PREVENTIVO',
    })

    await registrarMantenimiento.ejecutar({
      equipoId: equipo.id,
      descripcion: 'Segundo mantenimiento (cambio de pasta térmica)',
      tipo: 'PREVENTIVO',
    })

    const historial = await consultarMantenimientos.historialPorEquipo(equipo.id)
    expect(historial).toHaveLength(2)
  })

  it('debe actualizar estado a FINALIZADO y restablecer el estado del equipo a OPERATIVO', async () => {
    const equipo = await registrarEquipo.ejecutar({
      serial: 'EQ-400',
      nombre: 'iMac 27',
      ubicacion: 'Diseño',
    })

    const mant = await registrarMantenimiento.ejecutar({
      equipoId: equipo.id,
      descripcion: 'Reinstalación de sistema operativo',
      estado: 'EN_PROCESO',
    })

    expect((await equipoDao.porId(equipo.id))?.estado).toBe('EN_MANTENIMIENTO')

    const actualizado = await actualizarEstado.ejecutar({
      id: mant.id,
      estado: 'FINALIZADO',
      diagnostico: 'Sistema operativo reinstalado y optimizado correctamente',
      tecnico: 'Antonia Gallego',
    })

    expect(actualizado.estado).toBe('FINALIZADO')
    expect(actualizado.diagnostico).toBe('Sistema operativo reinstalado y optimizado correctamente')
    expect(actualizado.tecnico).toBe('Antonia Gallego')

    const equipoFinal = await equipoDao.porId(equipo.id)
    expect(equipoFinal?.estado).toBe('OPERATIVO')
  })
})
