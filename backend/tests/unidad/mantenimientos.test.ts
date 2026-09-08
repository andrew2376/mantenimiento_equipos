import { describe, it, beforeEach } from 'node:test'
import assert from 'node:assert/strict'
import { MantenimientoDAOEnMemoria } from '../dobles/MantenimientoDAOEnMemoria.js'
import { RegistrarMantenimiento } from '../../src/aplicacion/casos-uso/RegistrarMantenimiento.js'
import { ObtenerMantenimientos } from '../../src/aplicacion/casos-uso/ObtenerMantenimientos.js'

describe('Dominio y Casos de Uso: Mantenimientos', () => {
  let mantenimientoDAO: MantenimientoDAOEnMemoria
  let registrarMantenimiento: RegistrarMantenimiento
  let obtenerMantenimientos: ObtenerMantenimientos

  beforeEach(() => {
    mantenimientoDAO = new MantenimientoDAOEnMemoria()
    registrarMantenimiento = new RegistrarMantenimiento(mantenimientoDAO)
    obtenerMantenimientos = new ObtenerMantenimientos(mantenimientoDAO)
  })

  it('debe registrar una orden de mantenimiento preventivo/correctivo', async () => {
    const orden = await registrarMantenimiento.ejecutar({
      equipoId: 1,
      solicitante: 'Profesor Carlos',
      tecnicoAsignado: 'Técnico Juan',
      tipo: 'CORRECTIVO',
      descripcionFalla: 'Pantalla azul al iniciar el sistema',
      diagnostico: 'Falla en módulo de memoria RAM',
      actividadesRealizadas: 'Reemplazo de memoria RAM DDR4',
      repuestosUtilizados: '1x RAM 8GB DDR4',
      estado: 'EN_PROCESO',
      fechaSolicitud: new Date()
    })

    assert.ok(orden.id)
    assert.equal(orden.equipoId, 1)
    assert.equal(orden.tipo, 'CORRECTIVO')
    assert.equal(orden.estado, 'EN_PROCESO')
  })

  it('debe listar los mantenimientos asociados a un equipo específico', async () => {
    await registrarMantenimiento.ejecutar({
      equipoId: 1,
      solicitante: 'Antonia Gallego',
      tipo: 'PREVENTIVO',
      descripcionFalla: 'Mantenimiento preventivo semestral',
      estado: 'FINALIZADO',
      fechaSolicitud: new Date()
    })

    await registrarMantenimiento.ejecutar({
      equipoId: 2,
      solicitante: 'Andrew Barbosa',
      tipo: 'CORRECTIVO',
      descripcionFalla: 'Falla en teclado',
      estado: 'SOLICITADO',
      fechaSolicitud: new Date()
    })

    const historialEquipo1 = await obtenerMantenimientos.ejecutarPorEquipo(1)
    assert.equal(historialEquipo1.length, 1)
    assert.equal(historialEquipo1[0].solicitante, 'Antonia Gallego')
  })
})

