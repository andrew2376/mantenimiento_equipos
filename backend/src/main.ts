// Raíz de composición: único punto de entrada donde se instancian
// las implementaciones concretas de infraestructura y se inyectan
// en los casos de uso y servidor HTTP.

import { prisma } from './infraestructura/persistencia/prisma'

import { EquipoDAOPrisma } from './infraestructura/persistencia/EquipoDAOPrisma'

import { MantenimientoDAOPrisma } from './infraestructura/persistencia/MantenimientoDAOPrisma'

import { UsuarioDAOPrisma } from './infraestructura/persistencia/UsuarioDAOPrisma'

import { TicketDAOPrisma } from './infraestructura/persistencia/TicketDAOPrisma'

import { RepuestoDAOPrisma } from './infraestructura/persistencia/RepuestoDAOPrisma'

import { ServicioClavesBcrypt } from './infraestructura/identidad/ServicioClavesBcrypt'

import { RegistrarEquipo } from './aplicacion/casos-uso/RegistrarEquipo'

import { ConsultarEquipos } from './aplicacion/casos-uso/ConsultarEquipos'

import { ActualizarEquipo } from './aplicacion/casos-uso/ActualizarEquipo'

import { RegistrarMantenimiento } from './aplicacion/casos-uso/RegistrarMantenimiento'

import { ConsultarMantenimientos } from './aplicacion/casos-uso/ConsultarMantenimientos'

import { ActualizarEstadoMantenimiento } from './aplicacion/casos-uso/ActualizarEstadoMantenimiento'

import { RegistrarUsuario } from './aplicacion/casos-uso/RegistrarUsuario'

import { ConsultarUsuarios } from './aplicacion/casos-uso/ConsultarUsuarios'

import { ActualizarUsuario } from './aplicacion/casos-uso/ActualizarUsuario'

import { IniciarSesion } from './aplicacion/casos-uso/iniciarSesion'

import { RegistrarTicket } from './aplicacion/casos-uso/RegistrarTicket'

import { ConsultarTickets } from './aplicacion/casos-uso/ConsultarTickets'

import { ActualizarTicket } from './aplicacion/casos-uso/ActualizarTicket'

import { RegistrarRepuesto } from './aplicacion/casos-uso/RegistrarRepuesto'

import { ConsultarRepuestos } from './aplicacion/casos-uso/ConsultarRepuestos'

import { AsignarRepuestosAMantenimiento } from './aplicacion/casos-uso/AsignarRepuestosAMantenimiento'

import { ConsultarHistorialEquipo } from './aplicacion/casos-uso/ConsultarHistorialEquipo'

import { GenerarReportes } from './aplicacion/casos-uso/GenerarReportes'

import { crearServidor } from './infraestructura/http/servidor'


// 1. Adaptadores de persistencia (Infraestructura)

const equipoDAO =
  new EquipoDAOPrisma(prisma)

const mantenimientoDAO =
  new MantenimientoDAOPrisma(prisma)

const usuarioDAO =
  new UsuarioDAOPrisma(prisma)

const ticketDAO =
  new TicketDAOPrisma(prisma)

const repuestoDAO =
  new RepuestoDAOPrisma(prisma)


// 2. Servicios de infraestructura

const servicioClaves =
  new ServicioClavesBcrypt()


// 3. Casos de uso (Aplicación)

// Equipos

const registrarEquipo =
  new RegistrarEquipo(equipoDAO)

const consultarEquipos =
  new ConsultarEquipos(equipoDAO)

const actualizarEquipo =
  new ActualizarEquipo(equipoDAO)


// Mantenimientos

const registrarMantenimiento =
  new RegistrarMantenimiento(
    mantenimientoDAO,
    equipoDAO
  )

const consultarMantenimientos =
  new ConsultarMantenimientos(
    mantenimientoDAO,
    equipoDAO
  )

const actualizarEstadoMantenimiento =
  new ActualizarEstadoMantenimiento(
    mantenimientoDAO,
    equipoDAO,
    ticketDAO
  )


// Usuarios

const registrarUsuario =
  new RegistrarUsuario(
    usuarioDAO,
    servicioClaves
  )

const consultarUsuarios =
  new ConsultarUsuarios(usuarioDAO)

const actualizarUsuario =
  new ActualizarUsuario(usuarioDAO)

const iniciarSesion =
  new IniciarSesion(
    usuarioDAO,
    servicioClaves
  )


// Tickets

const registrarTicket =
  new RegistrarTicket(ticketDAO)

const consultarTickets =
  new ConsultarTickets(ticketDAO)

const actualizarTicket =
  new ActualizarTicket(ticketDAO)


// Repuestos

const registrarRepuesto =
  new RegistrarRepuesto(repuestoDAO)

const consultarRepuestos =
  new ConsultarRepuestos(repuestoDAO)

const asignarRepuestosAMantenimiento =
  new AsignarRepuestosAMantenimiento(
    mantenimientoDAO,
    repuestoDAO
  )


// Historial

const consultarHistorialEquipo =
  new ConsultarHistorialEquipo(prisma)


// Reportes

const generarReportes =
  new GenerarReportes(prisma)


// 4. Servidor HTTP (Infraestructura)

const app = crearServidor({

  equipos: {
    registrarEquipo,
    consultarEquipos,
    actualizarEquipo,
  },

  mantenimientos: {
    registrarMantenimiento,
    consultarMantenimientos,
    actualizarEstadoMantenimiento,
  },

  usuarios: {
    registrarUsuario,
    consultarUsuarios,
    actualizarUsuario,
    iniciarSesion,
  },

  tickets: {
    registrarTicket,
    consultarTickets,
    actualizarTicket,
  },

  repuestos: {
    registrarRepuesto,
    consultarRepuestos,
    asignarRepuestosAMantenimiento,
  },

  historial: {
    consultarHistorialEquipo,
  },

  reportes: {
    generarReportes,
  },

})


// 5. Iniciar servidor

const PORT = Number(
  process.env['PORT'] ?? 3000
)

app.listen(PORT, () => {

  console.log(
    `🚀 Servidor ejecutándose en http://localhost:${PORT}`
  )

  console.log(
    `📡 Endpoints disponibles en http://localhost:${PORT}/api`
  )

})