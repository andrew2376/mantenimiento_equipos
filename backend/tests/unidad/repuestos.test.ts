import { describe, it, expect, beforeEach } from 'vitest'
import { RepuestoDAOEnMemoria } from '../dobles/RepuestoDAOEnMemoria'
import { MantenimientoDAOEnMemoria } from '../dobles/MantenimientoDAOEnMemoria'
import {
  GestionarRepuestos,
  RepuestoCodigoDuplicado,
  RepuestoNoEncontrado
} from '../../src/aplicacion/casos-uso/GestionarRepuestos'
import { AsociarRepuestoMantenimiento } from '../../src/aplicacion/casos-uso/AsociarRepuestoMantenimiento'

describe('Módulo de Repuestos - Pruebas Unitarias', () => {
  let repuestosDAO: RepuestoDAOEnMemoria
  let mantenimientosDAO: MantenimientoDAOEnMemoria
  let gestionarRepuestos: GestionarRepuestos
  let asociarRepuesto: AsociarRepuestoMantenimiento

  beforeEach(() => {
    repuestosDAO = new RepuestoDAOEnMemoria()
    mantenimientosDAO = new MantenimientoDAOEnMemoria()
    gestionarRepuestos = new GestionarRepuestos(repuestosDAO)
    asociarRepuesto = new AsociarRepuestoMantenimiento(mantenimientosDAO, repuestosDAO)
  })

  it('debe registrar un repuesto en el catálogo correctamente', async () => {
    const repuesto = await gestionarRepuestos.registrar({
      nombre: 'Memoria RAM 16GB DDR4',
      codigo: 'REP-RAM-16',
      costoUnitario: 180000,
      stock: 10
    })

    expect(repuesto.id).toBe(1)
    expect(repuesto.codigo).toBe('REP-RAM-16')
    expect(repuesto.costoUnitario).toBe(180000)
    expect(repuesto.stock).toBe(10)
    expect(repuesto.activo).toBe(true)
  })

  it('debe lanzar error al intentar registrar un código de repuesto duplicado', async () => {
    await gestionarRepuestos.registrar({
      nombre: 'Disco SSD 500GB',
      codigo: 'REP-SSD-500',
      costoUnitario: 150000
    })

    await expect(
      gestionarRepuestos.registrar({
        nombre: 'Otro Disco SSD',
        codigo: 'REP-SSD-500',
        costoUnitario: 160000
      })
    ).rejects.toThrow(RepuestoCodigoDuplicado)
  })

  it('debe consultar un repuesto por su ID', async () => {
    const creado = await gestionarRepuestos.registrar({
      nombre: 'Pasta Térmica Arctic MX-4',
      codigo: 'REP-PAS-01',
      costoUnitario: 35000
    })

    const consultado = await gestionarRepuestos.porId(creado.id)
    expect(consultado.nombre).toBe('Pasta Térmica Arctic MX-4')
  })

  it('debe lanzar error si se consulta un repuesto inexistente', async () => {
    await expect(gestionarRepuestos.porId(999)).rejects.toThrow(RepuestoNoEncontrado)
  })

  it('debe asociar un repuesto a un mantenimiento existente', async () => {
    const m = await mantenimientosDAO.guardar({
      descripcion: 'Mantenimiento de prueba',
      tipo: 'CORRECTIVO',
      estado: 'PENDIENTE',
      diagnostico: null,
      tecnico: null,
      equipoId: 1,
      ticketId: null
    })

    const repuesto = await gestionarRepuestos.registrar({
      nombre: 'Fuente de poder 650W',
      codigo: 'REP-PSU-650',
      costoUnitario: 220000
    })

    const asociacion = await asociarRepuesto.ejecutar({
      mantenimientoId: m.id,
      repuestoId: repuesto.id,
      cantidad: 2
    })

    expect(asociacion.mantenimientoId).toBe(m.id)
    expect(asociacion.repuestoId).toBe(repuesto.id)
    expect(asociacion.cantidad).toBe(2)
    expect(asociacion.costoUnitario).toBe(220000)

    const lista = await asociarRepuesto.listarPorMantenimiento(m.id)
    expect(lista.length).toBe(1)
    expect(lista[0]?.repuesto?.nombre).toBe('Fuente de poder 650W')
  })
})
