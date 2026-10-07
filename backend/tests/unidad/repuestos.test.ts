import { describe, it, expect, beforeEach } from 'vitest'
import { RepuestoDAOEnMemoria } from '../dobles/RepuestoDAOEnMemoria'
import { MantenimientoDAOEnMemoria } from '../dobles/MantenimientoDAOEnMemoria'
import {
  GestionarRepuestos,
  RepuestoCodigoDuplicado,
  RepuestoNoEncontrado
} from '../../src/aplicacion/casos-uso/GestionarRepuestos'
import {
  AsociarRepuestoMantenimiento,
  StockInsuficiente
} from '../../src/aplicacion/casos-uso/AsociarRepuestoMantenimiento'

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

  it('debe asociar un repuesto a un mantenimiento y descontar el stock del catálogo', async () => {
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
      costoUnitario: 220000,
      stock: 8
    })

    const asociacion = await asociarRepuesto.ejecutar({
      mantenimientoId: m.id,
      repuestoId: repuesto.id,
      cantidad: 5
    })

    expect(asociacion.mantenimientoId).toBe(m.id)
    expect(asociacion.repuestoId).toBe(repuesto.id)
    expect(asociacion.cantidad).toBe(5)
    expect(asociacion.costoUnitario).toBe(220000)

    // Verificar que el stock bajó de 8 a 3
    const repuestoActualizado = await gestionarRepuestos.porId(repuesto.id)
    expect(repuestoActualizado.stock).toBe(3)

    const lista = await asociarRepuesto.listarPorMantenimiento(m.id)
    expect(lista.length).toBe(1)
    expect(lista[0]?.repuesto?.nombre).toBe('Fuente de poder 650W')
  })

  it('debe lanzar error StockInsuficiente si la cantidad solicitada supera el stock', async () => {
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
      nombre: 'Tarjeta de video GTX 1660',
      codigo: 'REP-GPU-1660',
      costoUnitario: 950000,
      stock: 2
    })

    await expect(
      asociarRepuesto.ejecutar({
        mantenimientoId: m.id,
        repuestoId: repuesto.id,
        cantidad: 5
      })
    ).rejects.toThrow(StockInsuficiente)
  })

  it('debe restaurar el stock al almacén cuando se elimina la asociación', async () => {
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
      nombre: 'Ventilador Cooler 120mm',
      codigo: 'REP-FAN-120',
      costoUnitario: 45000,
      stock: 10
    })

    const asociacion = await asociarRepuesto.ejecutar({
      mantenimientoId: m.id,
      repuestoId: repuesto.id,
      cantidad: 4
    })

    let repActualizado = await gestionarRepuestos.porId(repuesto.id)
    expect(repActualizado.stock).toBe(6)

    // Eliminar asociación y comprobar restauración
    await asociarRepuesto.eliminar(asociacion.id)
    repActualizado = await gestionarRepuestos.porId(repuesto.id)
    expect(repActualizado.stock).toBe(10)
  })
})
