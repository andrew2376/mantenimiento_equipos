import { describe, it, expect, beforeEach } from 'vitest'
import { MantenimientoDAOEnMemoria } from '../dobles/MantenimientoDAOEnMemoria'
import {
  RegistrarDiagnostico,
  DiagnosticoInvalido,
  TecnicoInvalido,
  MantenimientoNoModificable
} from '../../src/aplicacion/casos-uso/RegistrarDiagnostico'
import { MantenimientoNoEncontrado } from '../../src/aplicacion/casos-uso/ConsultarMantenimientos'

describe('ACT-024: Registro de diagnóstico detallado del equipo - Pruebas Unitarias', () => {
  let mantenimientosDAO: MantenimientoDAOEnMemoria
  let registrarDiagnostico: RegistrarDiagnostico

  beforeEach(() => {
    mantenimientosDAO = new MantenimientoDAOEnMemoria()
    registrarDiagnostico = new RegistrarDiagnostico(mantenimientosDAO)
  })

  it('debe registrar el diagnóstico exitosamente y cambiar estado de PENDIENTE a EN_PROCESO', async () => {
    const mantenimiento = await mantenimientosDAO.guardar({
      descripcion: 'Pantalla azul recurrente en Windows',
      tipo: 'CORRECTIVO',
      estado: 'PENDIENTE',
      diagnostico: null,
      tecnico: null,
      equipoId: 1
    })

    const actualizado = await registrarDiagnostico.ejecutar({
      mantenimientoId: mantenimiento.id,
      diagnostico: 'Falla en sectores del disco duro y memoria RAM desajustada. Se requiere cambio.',
      tecnico: 'Carlos Técnico'
    })

    expect(actualizado.id).toBe(mantenimiento.id)
    expect(actualizado.diagnostico).toBe('Falla en sectores del disco duro y memoria RAM desajustada. Se requiere cambio.')
    expect(actualizado.tecnico).toBe('Carlos Técnico')
    expect(actualizado.estado).toBe('EN_PROCESO')
  })

  it('debe registrar diagnóstico conservando el estado si ya estaba EN_PROCESO', async () => {
    const mantenimiento = await mantenimientosDAO.guardar({
      descripcion: 'Mantenimiento preventivo anual',
      tipo: 'PREVENTIVO',
      estado: 'EN_PROCESO',
      diagnostico: null,
      tecnico: 'Carlos Técnico',
      equipoId: 2
    })

    const actualizado = await registrarDiagnostico.ejecutar({
      mantenimientoId: mantenimiento.id,
      diagnostico: 'Limpieza interna realizada, cambio de pasta térmica en procesador.',
      tecnico: 'Carlos Técnico'
    })

    expect(actualizado.estado).toBe('EN_PROCESO')
    expect(actualizado.diagnostico).toContain('Limpieza interna')
  })

  it('debe lanzar DiagnosticoInvalido si el diagnóstico tiene menos de 10 caracteres', async () => {
    const mantenimiento = await mantenimientosDAO.guardar({
      descripcion: 'Revisión general',
      tipo: 'PREVENTIVO',
      estado: 'PENDIENTE',
      diagnostico: null,
      tecnico: null,
      equipoId: 1
    })

    await expect(
      registrarDiagnostico.ejecutar({
        mantenimientoId: mantenimiento.id,
        diagnostico: 'Muy corto',
        tecnico: 'Carlos Técnico'
      })
    ).rejects.toThrow(DiagnosticoInvalido)
  })

  it('debe lanzar DiagnosticoInvalido si el diagnóstico está compuesto solo de espacios', async () => {
    const mantenimiento = await mantenimientosDAO.guardar({
      descripcion: 'Revisión general',
      tipo: 'PREVENTIVO',
      estado: 'PENDIENTE',
      diagnostico: null,
      tecnico: null,
      equipoId: 1
    })

    await expect(
      registrarDiagnostico.ejecutar({
        mantenimientoId: mantenimiento.id,
        diagnostico: '            ',
        tecnico: 'Carlos Técnico'
      })
    ).rejects.toThrow(DiagnosticoInvalido)
  })

  it('debe lanzar TecnicoInvalido si el nombre del técnico tiene menos de 2 caracteres', async () => {
    const mantenimiento = await mantenimientosDAO.guardar({
      descripcion: 'Revisión general',
      tipo: 'PREVENTIVO',
      estado: 'PENDIENTE',
      diagnostico: null,
      tecnico: null,
      equipoId: 1
    })

    await expect(
      registrarDiagnostico.ejecutar({
        mantenimientoId: mantenimiento.id,
        diagnostico: 'Diagnóstico técnico detallado y suficiente para el equipo',
        tecnico: ' '
      })
    ).rejects.toThrow(TecnicoInvalido)
  })

  it('debe lanzar MantenimientoNoEncontrado si el ID de mantenimiento no existe', async () => {
    await expect(
      registrarDiagnostico.ejecutar({
        mantenimientoId: 9999,
        diagnostico: 'Diagnóstico técnico detallado sobre un mantenimiento inexistente',
        tecnico: 'Carlos Técnico'
      })
    ).rejects.toThrow(MantenimientoNoEncontrado)
  })

  it('debe lanzar MantenimientoNoModificable si el mantenimiento ya está FINALIZADO', async () => {
    const mantenimiento = await mantenimientosDAO.guardar({
      descripcion: 'Mantenimiento cerrado',
      tipo: 'CORRECTIVO',
      estado: 'FINALIZADO',
      diagnostico: 'Diagnóstico previo al cierre del equipo',
      tecnico: 'Carlos Técnico',
      equipoId: 1
    })

    await expect(
      registrarDiagnostico.ejecutar({
        mantenimientoId: mantenimiento.id,
        diagnostico: 'Intento de modificar diagnóstico ya cerrado',
        tecnico: 'Otro Técnico'
      })
    ).rejects.toThrow(MantenimientoNoModificable)
  })

  it('debe lanzar MantenimientoNoModificable si el mantenimiento está CANCELADO', async () => {
    const mantenimiento = await mantenimientosDAO.guardar({
      descripcion: 'Mantenimiento cancelado por usuario',
      tipo: 'CORRECTIVO',
      estado: 'CANCELADO',
      diagnostico: null,
      tecnico: null,
      equipoId: 1
    })

    await expect(
      registrarDiagnostico.ejecutar({
        mantenimientoId: mantenimiento.id,
        diagnostico: 'Intento de diagnosticar un mantenimiento cancelado',
        tecnico: 'Carlos Técnico'
      })
    ).rejects.toThrow(MantenimientoNoModificable)
  })
})
