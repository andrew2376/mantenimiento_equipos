import { describe, it, beforeEach } from 'node:test'
import assert from 'node:assert/strict'
import { EquipoDAOEnMemoria } from '../dobles/EquipoDAOEnMemoria.js'
import { RegistrarEquipo } from '../../src/aplicacion/casos-uso/RegistrarEquipo.js'
import { ObtenerEquipos } from '../../src/aplicacion/casos-uso/ObtenerEquipos.js'

describe('Dominio y Casos de Uso: Equipos', () => {
  let equipoDAO: EquipoDAOEnMemoria
  let registrarEquipo: RegistrarEquipo
  let obtenerEquipos: ObtenerEquipos

  beforeEach(() => {
    equipoDAO = new EquipoDAOEnMemoria()
    registrarEquipo = new RegistrarEquipo(equipoDAO)
    obtenerEquipos = new ObtenerEquipos(equipoDAO)
  })

  it('debe registrar un nuevo equipo y devolver su DTO', async () => {
    const nuevo = await registrarEquipo.ejecutar({
      codigoInventario: 'EQ-001',
      nombre: 'Portátil Dell Latitude',
      tipo: 'PORTATIL',
      marca: 'Dell',
      modelo: 'Latitude 5420',
      numeroSerie: 'SN12345678',
      ubicacion: 'Laboratorio 1',
      estado: 'OPERATIVO'
    })

    assert.ok(nuevo.id)
    assert.equal(nuevo.codigoInventario, 'EQ-001')
    assert.equal(nuevo.nombre, 'Portátil Dell Latitude')
    assert.equal(nuevo.estado, 'OPERATIVO')
  })

  it('debe listar todos los equipos registrados', async () => {
    await registrarEquipo.ejecutar({
      codigoInventario: 'EQ-001',
      nombre: 'Portátil Dell',
      tipo: 'PORTATIL',
      marca: 'Dell',
      ubicacion: 'Sala A',
      estado: 'OPERATIVO'
    })

    await registrarEquipo.ejecutar({
      codigoInventario: 'EQ-002',
      nombre: 'PC Escritorio HP',
      tipo: 'ESCRITORIO',
      marca: 'HP',
      ubicacion: 'Sala B',
      estado: 'OPERATIVO'
    })

    const lista = await obtenerEquipos.ejecutar()
    assert.equal(lista.length, 2)
    assert.equal(lista[0].codigoInventario, 'EQ-001')
    assert.equal(lista[1].codigoInventario, 'EQ-002')
  })

  it('debe obtener un equipo por su ID', async () => {
    const creado = await registrarEquipo.ejecutar({
      codigoInventario: 'EQ-003',
      nombre: 'Servidor Lenovo',
      tipo: 'SERVIDOR',
      marca: 'Lenovo',
      ubicacion: 'Data Center',
      estado: 'OPERATIVO'
    })

    const encontrado = await obtenerEquipos.ejecutarPorId(creado.id)
    assert.notEqual(encontrado, null)
    assert.equal(encontrado?.codigoInventario, 'EQ-003')
  })
})

