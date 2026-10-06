import { describe, it, expect, beforeEach } from 'vitest'
import { EquipoDAOEnMemoria } from '../dobles/EquipoDAOEnMemoria'
import { RegistrarEquipo, SerialYaRegistrado } from '../../src/aplicacion/casos-uso/RegistrarEquipo'
import { ConsultarEquipos, EquipoNoEncontrado } from '../../src/aplicacion/casos-uso/ConsultarEquipos'

describe('Módulo de Equipos - Pruebas Unitarias', () => {
  let dao: EquipoDAOEnMemoria
  let registrarEquipo: RegistrarEquipo
  let consultarEquipos: ConsultarEquipos

  beforeEach(() => {
    dao = new EquipoDAOEnMemoria()
    registrarEquipo = new RegistrarEquipo(dao)
    consultarEquipos = new ConsultarEquipos(dao)
  })

  it('debe registrar un nuevo equipo correctamente', async () => {
    const nuevo = await registrarEquipo.ejecutar({
      serial: 'EQ-001',
      nombre: 'Laptop Dell Inspiron 15',
      tipo: 'PORTATIL',
      ubicacion: 'Laboratorio de Sistemas 1',
    })

    expect(nuevo.id).toBe(1)
    expect(nuevo.serial).toBe('EQ-001')
    expect(nuevo.estado).toBe('OPERATIVO')
    expect(nuevo.creadoEn).toBeInstanceOf(Date)
  })

  it('debe lanzar error si se intenta registrar un serial duplicado', async () => {
    await registrarEquipo.ejecutar({
      serial: 'EQ-001',
      nombre: 'Laptop 1',
      ubicacion: 'Oficina A',
    })

    await expect(
      registrarEquipo.ejecutar({
        serial: 'eq-001', // debe ser case-insensitive
        nombre: 'Laptop 2',
        ubicacion: 'Oficina B',
      })
    ).rejects.toThrow(SerialYaRegistrado)
  })

  it('debe consultar un equipo por su ID', async () => {
    const creado = await registrarEquipo.ejecutar({
      serial: 'EQ-002',
      nombre: 'PC Torre HP',
      tipo: 'ESCRITORIO',
      ubicacion: 'Biblioteca',
    })

    const encontrado = await consultarEquipos.porId(creado.id)
    expect(encontrado.serial).toBe('EQ-002')
    expect(encontrado.nombre).toBe('PC Torre HP')
  })

  it('debe lanzar error al consultar un ID de equipo inexistente', async () => {
    await expect(consultarEquipos.porId(999)).rejects.toThrow(EquipoNoEncontrado)
  })

  it('debe listar todos los equipos registrados', async () => {
    await registrarEquipo.ejecutar({ serial: 'EQ-101', nombre: 'PC 1', ubicacion: 'Lab 1' })
    await registrarEquipo.ejecutar({ serial: 'EQ-102', nombre: 'PC 2', ubicacion: 'Lab 2' })

    const lista = await consultarEquipos.listarTodos()
    expect(lista).toHaveLength(2)
  })
})
