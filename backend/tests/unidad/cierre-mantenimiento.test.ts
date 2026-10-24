import { describe, it, expect, beforeEach } from 'vitest'
import { EquipoDAOEnMemoria } from '../dobles/EquipoDAOEnMemoria'
import { MantenimientoDAOEnMemoria } from '../dobles/MantenimientoDAOEnMemoria'
import { TicketDAOEnMemoria } from '../dobles/TicketDAOEnMemoria'
import { RegistrarEquipo } from '../../src/aplicacion/casos-uso/RegistrarEquipo'
import { RegistrarMantenimiento } from '../../src/aplicacion/casos-uso/RegistrarMantenimiento'
import {
  CerrarMantenimiento,
  MantenimientoYaCerrado,
  DiagnosticoRequeridoParaCierre
} from '../../src/aplicacion/casos-uso/CerrarMantenimiento'
import { MantenimientoNoEncontrado } from '../../src/aplicacion/casos-uso/ConsultarMantenimientos'
import { ActualizarEstadoMantenimiento } from '../../src/aplicacion/casos-uso/ActualizarEstadoMantenimiento'

describe('ACT-027: Cierre de Mantenimiento con Sincronización de Ticket', () => {
  let equipoDao: EquipoDAOEnMemoria
  let mantenimientoDao: MantenimientoDAOEnMemoria
  let ticketDao: TicketDAOEnMemoria
  let registrarEquipo: RegistrarEquipo
  let registrarMantenimiento: RegistrarMantenimiento
  let cerrarMantenimiento: CerrarMantenimiento
  let actualizarEstado: ActualizarEstadoMantenimiento

  beforeEach(() => {
    equipoDao = new EquipoDAOEnMemoria()
    mantenimientoDao = new MantenimientoDAOEnMemoria()
    ticketDao = new TicketDAOEnMemoria()

    registrarEquipo = new RegistrarEquipo(equipoDao)
    registrarMantenimiento = new RegistrarMantenimiento(mantenimientoDao, equipoDao)
    cerrarMantenimiento = new CerrarMantenimiento(mantenimientoDao, equipoDao, ticketDao)
    actualizarEstado = new ActualizarEstadoMantenimiento(mantenimientoDao, equipoDao, ticketDao)
  })

  it('debe cerrar el mantenimiento y sincronizar el ticket asociado cambiando estado a RESUELTO y seteando fechaCierre', async () => {
    const equipo = await registrarEquipo.ejecutar({
      codigoInventario: 'EQ-SRV-001',
      nombre: 'Servidor Principal',
      marca: 'Dell',
      ubicacion: 'Data Center'
    })

    const ticket = await ticketDao.guardar({
      titulo: 'Falla de memoria RAM',
      descripcion: 'El servidor se reinicia aleatoriamente con kernel panic',
      prioridad: 'ALTA',
      estado: 'EN_MANTENIMIENTO',
      equipoId: equipo.id,
      solicitanteId: 2,
      tecnicoId: 3
    })

    const mantenimiento = await registrarMantenimiento.ejecutar({
      equipoId: equipo.id,
      ticketId: ticket.id,
      descripcion: 'Reemplazo de módulo DDR4 en banco 2',
      tipo: 'CORRECTIVO',
      estado: 'EN_PROCESO',
      diagnostico: 'Módulo de memoria DDR4 de 16GB defectuoso',
      tecnico: 'Carlos Gómez'
    })

    const resultado = await cerrarMantenimiento.ejecutar({
      id: mantenimiento.id,
      diagnostico: 'Módulo reemplazado exitosamente y pruebas de estrés superadas',
      tecnico: 'Carlos Gómez'
    })

    expect(resultado.mantenimiento.estado).toBe('FINALIZADO')
    expect(resultado.mantenimiento.diagnostico).toBe(
      'Módulo reemplazado exitosamente y pruebas de estrés superadas'
    )
    expect(resultado.equipoOperativo).toBe(true)

    // Verificar ticket sincronizado
    expect(resultado.ticketSincronizado).not.toBeNull()
    expect(resultado.ticketSincronizado?.id).toBe(ticket.id)
    expect(resultado.ticketSincronizado?.estado).toBe('RESUELTO')
    expect(resultado.ticketSincronizado?.fechaCierre).toBeInstanceOf(Date)

    const ticketEnBD = await ticketDao.porId(ticket.id)
    expect(ticketEnBD?.estado).toBe('RESUELTO')
    expect(ticketEnBD?.fechaCierre).toBeDefined()

    // Verificar estado del equipo restablecido a OPERATIVO (1)
    const equipoActualizado = await equipoDao.porId(equipo.id)
    expect(equipoActualizado?.estado).toBe(1)
  })

  it('debe cerrar exitosamente un mantenimiento que no tiene ticket asociado (preventivo)', async () => {
    const equipo = await registrarEquipo.ejecutar({
      codigoInventario: 'EQ-PRT-100',
      nombre: 'Impresora Láser HP',
      marca: 'HP',
      ubicacion: 'Oficina Contable'
    })

    const mantenimiento = await registrarMantenimiento.ejecutar({
      equipoId: equipo.id,
      descripcion: 'Mantenimiento preventivo semestral de rodillos',
      tipo: 'PREVENTIVO',
      estado: 'EN_PROCESO',
      diagnostico: 'Rodillos limpios y fusor en estado óptimo',
      tecnico: 'Antonia G.'
    })

    const resultado = await cerrarMantenimiento.ejecutar({
      id: mantenimiento.id
    })

    expect(resultado.mantenimiento.estado).toBe('FINALIZADO')
    expect(resultado.ticketSincronizado).toBeNull()
    expect(resultado.equipoOperativo).toBe(true)

    const equipoActualizado = await equipoDao.porId(equipo.id)
    expect(equipoActualizado?.estado).toBe(1)
  })

  it('no debe cambiar el equipo a OPERATIVO si aún tiene otro mantenimiento activo', async () => {
    const equipo = await registrarEquipo.ejecutar({
      codigoInventario: 'EQ-SRV-002',
      nombre: 'Servidor Base de Datos',
      marca: 'Dell',
      ubicacion: 'Data Center'
    })

    const mant1 = await registrarMantenimiento.ejecutar({
      equipoId: equipo.id,
      descripcion: 'Mantenimiento fuente poder 1',
      tipo: 'CORRECTIVO',
      estado: 'EN_PROCESO',
      diagnostico: 'Fuente dañada'
    })

    await registrarMantenimiento.ejecutar({
      equipoId: equipo.id,
      descripcion: 'Mantenimiento fuente poder 2',
      tipo: 'CORRECTIVO',
      estado: 'PENDIENTE'
    })

    const resultado = await cerrarMantenimiento.ejecutar({
      id: mant1.id,
      diagnostico: 'Fuente reemplazada'
    })

    expect(resultado.mantenimiento.estado).toBe('FINALIZADO')
    expect(resultado.equipoOperativo).toBe(false)

    const equipoBD = await equipoDao.porId(equipo.id)
    // Sigue en mantenimiento (2 = EN_MANTENIMIENTO) porque mant2 está PENDIENTE
    expect(equipoBD?.estado).toBe(2)
  })

  it('debe permitir proveer el diagnóstico al momento de cerrar si no se había ingresado antes', async () => {
    const equipo = await registrarEquipo.ejecutar({
      codigoInventario: 'EQ-SW-50',
      nombre: 'Switch Cisco 24p',
      marca: 'Cisco',
      ubicacion: 'Rack 1'
    })

    const mantenimiento = await registrarMantenimiento.ejecutar({
      equipoId: equipo.id,
      descripcion: 'Revisión de puertos dañados',
      tipo: 'CORRECTIVO',
      estado: 'EN_PROCESO'
    })

    const resultado = await cerrarMantenimiento.ejecutar({
      id: mantenimiento.id,
      diagnostico: 'Se limpiaron contactos y se reemplazó cable de alimentación',
      tecnico: 'Antonia G.'
    })

    expect(resultado.mantenimiento.estado).toBe('FINALIZADO')
    expect(resultado.mantenimiento.diagnostico).toBe(
      'Se limpiaron contactos y se reemplazó cable de alimentación'
    )
  })

  it('debe rechazar el cierre si el mantenimiento no cuenta con diagnóstico previo ni se provee uno', async () => {
    const equipo = await registrarEquipo.ejecutar({
      codigoInventario: 'EQ-PC-99',
      nombre: 'PC Escritorio',
      marca: 'Lenovo',
      ubicacion: 'Sistemas'
    })

    const mantenimiento = await registrarMantenimiento.ejecutar({
      equipoId: equipo.id,
      descripcion: 'Pantalla azul',
      tipo: 'CORRECTIVO',
      estado: 'EN_PROCESO'
    })

    await expect(
      cerrarMantenimiento.ejecutar({
        id: mantenimiento.id,
        diagnostico: '' // vacío
      })
    ).rejects.toThrow(DiagnosticoRequeridoParaCierre)
  })

  it('debe rechazar el cierre si el mantenimiento ya se encuentra FINALIZADO o CANCELADO', async () => {
    const equipo = await registrarEquipo.ejecutar({
      codigoInventario: 'EQ-PC-100',
      nombre: 'PC Contabilidad',
      marca: 'HP',
      ubicacion: 'Piso 2'
    })

    const mantenimiento = await registrarMantenimiento.ejecutar({
      equipoId: equipo.id,
      descripcion: 'Mantenimiento finalizado previo',
      tipo: 'PREVENTIVO',
      estado: 'EN_PROCESO',
      diagnostico: 'Todo en orden'
    })

    await cerrarMantenimiento.ejecutar({ id: mantenimiento.id })

    // Intentar cerrar de nuevo
    await expect(
      cerrarMantenimiento.ejecutar({ id: mantenimiento.id })
    ).rejects.toThrow(MantenimientoYaCerrado)
  })

  it('debe lanzar MantenimientoNoEncontrado si el ID no existe', async () => {
    await expect(
      cerrarMantenimiento.ejecutar({ id: 99999, diagnostico: 'Prueba' })
    ).rejects.toThrow(MantenimientoNoEncontrado)
  })

  it('debe sincronizar ticket en ActualizarEstadoMantenimiento cuando estado pasa a FINALIZADO', async () => {
    const equipo = await registrarEquipo.ejecutar({
      codigoInventario: 'EQ-LAP-12',
      nombre: 'Thinkpad X1',
      marca: 'Lenovo',
      ubicacion: 'Gerencia'
    })

    const ticket = await ticketDao.guardar({
      titulo: 'Teclado no responde',
      descripcion: 'Falla de tecla espaciadora',
      prioridad: 'MEDIA',
      estado: 'EN_MANTENIMIENTO',
      equipoId: equipo.id,
      solicitanteId: 1
    })

    const mantenimiento = await registrarMantenimiento.ejecutar({
      equipoId: equipo.id,
      ticketId: ticket.id,
      descripcion: 'Cambio de teclado',
      tipo: 'CORRECTIVO',
      estado: 'EN_PROCESO'
    })

    await actualizarEstado.ejecutar({
      id: mantenimiento.id,
      estado: 'FINALIZADO',
      diagnostico: 'Teclado reemplazado por repuesto original',
      tecnico: 'Carlos Gómez'
    })

    const ticketActualizado = await ticketDao.porId(ticket.id)
    expect(ticketActualizado?.estado).toBe('RESUELTO')
    expect(ticketActualizado?.fechaCierre).toBeDefined()
  })
})
