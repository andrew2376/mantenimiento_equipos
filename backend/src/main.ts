
// Raíz de composición: único punto de entrada donde se instancian
// las implementaciones concretas de infraestructura y se inyectan
// en los casos de uso y servidor HTTP.

// ==========================================
// 1. IMPORTACIONES DE INFRAESTRUCTURA
// ==========================================

import { prisma } from './infraestructura/persistencia/prisma'

import { EquipoDAOPrisma } from './infraestructura/persistencia/EquipoDAOPrisma'
import { MantenimientoDAOPrisma } from './infraestructura/persistencia/MantenimientoDAOPrisma'
import { UsuarioDAOPrisma } from './infraestructura/persistencia/UsuarioDAOPrisma'
import { TicketDAOPrisma } from './infraestructura/persistencia/TicketDAOPrisma'
import { RepuestoDAOPrisma } from './infraestructura/persistencia/RepuestoDAOPrisma'

import { ServicioClavesBcrypt } from './infraestructura/identidad/ServicioClavesBcrypt'

import { crearServidor } from './infraestructura/http/servidor'

// ==========================================
// 2. IMPORTACIONES DE CASOS DE USO
// ==========================================

// Equipos
import { RegistrarEquipo } from './aplicacion/casos-uso/RegistrarEquipo'
import { ConsultarEquipos } from './aplicacion/casos-uso/ConsultarEquipos'
import { ActualizarEquipo } from './aplicacion/casos-uso/ActualizarEquipo'
import { DesactivarEquipo } from './aplicacion/casos-uso/DesactivarEquipo'
import { ActivarEquipo } from './aplicacion/casos-uso/ActivarEquipo'

// Mantenimientos
import { RegistrarMantenimiento } from './aplicacion/casos-uso/RegistrarMantenimiento'
import { ConsultarMantenimientos } from './aplicacion/casos-uso/ConsultarMantenimientos'
import { ActualizarEstadoMantenimiento } from './aplicacion/casos-uso/ActualizarEstadoMantenimiento'
import { RegistrarDiagnostico } from './aplicacion/casos-uso/RegistrarDiagnostico'
import { CerrarMantenimiento } from './aplicacion/casos-uso/CerrarMantenimiento'

// Usuarios
import { RegistrarUsuario } from './aplicacion/casos-uso/RegistrarUsuario'
import { ConsultarUsuarios } from './aplicacion/casos-uso/ConsultarUsuarios'
import { ActualizarUsuario } from './aplicacion/casos-uso/ActualizarUsuario'
import { IniciarSesion } from './aplicacion/casos-uso/iniciarSesion'
import { CambiarClave } from './aplicacion/casos-uso/CambiarClave'

// Tickets
import { RegistrarTicket } from './aplicacion/casos-uso/RegistrarTicket'
import { ConsultarTickets } from './aplicacion/casos-uso/ConsultarTickets'
import { ActualizarTicket } from './aplicacion/casos-uso/ActualizarTicket'
import { AsignarTecnico } from './aplicacion/casos-uso/AsignarTecnico'

// Repuestos
import { GestionarRepuestos } from './aplicacion/casos-uso/GestionarRepuestos'
import { AsociarRepuestoMantenimiento } from './aplicacion/casos-uso/AsociarRepuestoMantenimiento'


// ==========================================
// 3. ADAPTADORES DE PERSISTENCIA
// ==========================================

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


// ==========================================
// 4. SERVICIOS DE INFRAESTRUCTURA
// ==========================================

const servicioClaves =
  new ServicioClavesBcrypt()


// ==========================================
// 5. CASOS DE USO
// ==========================================

// EQUIPOS

const registrarEquipo =
  new RegistrarEquipo(equipoDAO)

const consultarEquipos =
  new ConsultarEquipos(equipoDAO)

const actualizarEquipo =
  new ActualizarEquipo(equipoDAO)

const desactivarEquipo =
  new DesactivarEquipo(equipoDAO)

const activarEquipo =
  new ActivarEquipo(equipoDAO)


// MANTENIMIENTOS

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

const cerrarMantenimiento =
  new CerrarMantenimiento(
    mantenimientoDAO,
    equipoDAO,
    ticketDAO
  )

const registrarDiagnostico =
  new RegistrarDiagnostico(mantenimientoDAO)


// USUARIOS

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

const cambiarClave =
  new CambiarClave(
    usuarioDAO,
    servicioClaves
  )


// TICKETS

const registrarTicket =
  new RegistrarTicket(ticketDAO)

const consultarTickets =
  new ConsultarTickets(ticketDAO)

const actualizarTicket =
  new ActualizarTicket(ticketDAO)

const asignarTecnico =
  new AsignarTecnico(
    ticketDAO,
    usuarioDAO
  )


// REPUESTOS

const gestionarRepuestos =
  new GestionarRepuestos(repuestoDAO)

const asociarRepuestoMantenimiento =
  new AsociarRepuestoMantenimiento(
    mantenimientoDAO,
    repuestoDAO
  )


// ==========================================
// 6. CREACIÓN DEL SERVIDOR HTTP
// ==========================================

const app = crearServidor({

  equipos: {
    registrarEquipo,
    consultarEquipos,
    actualizarEquipo,
    desactivarEquipo,
    activarEquipo,
  },

  mantenimientos: {
    registrarMantenimiento,
    consultarMantenimientos,
    actualizarEstadoMantenimiento,
    registrarDiagnostico,
    cerrarMantenimiento,
  },

  usuarios: {
    registrarUsuario,
    consultarUsuarios,
    actualizarUsuario,
    iniciarSesion,
    cambiarClave,
  },

  tickets: {
    registrarTicket,
    consultarTickets,
    actualizarTicket,
    asignarTecnico,
  },

  repuestos: {
    gestionarRepuestos,
    asociarRepuestoMantenimiento,
  },

})


// ==========================================
// 7. INICIAR SERVIDOR
// ==========================================

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
