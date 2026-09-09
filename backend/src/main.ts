// Raíz de composición: único punto de entrada donde se instancian las implementaciones
// concretas de infraestructura y se inyectan en los casos de uso y servidor HTTP.

import { prisma } from './infraestructura/persistencia/prisma'

import { EquipoDAOPrisma } from './infraestructura/persistencia/EquipoDAOPrisma'

import { MantenimientoDAOPrisma } from './infraestructura/persistencia/MantenimientoDAOPrisma'

import { RegistrarEquipo } from './aplicacion/casos-uso/RegistrarEquipo'

import { ConsultarEquipos } from './aplicacion/casos-uso/ConsultarEquipos'

import { ActualizarEquipo } from './aplicacion/casos-uso/ActualizarEquipo'

import { RegistrarMantenimiento } from './aplicacion/casos-uso/RegistrarMantenimiento'

import { ConsultarMantenimientos } from './aplicacion/casos-uso/ConsultarMantenimientos'

import { ActualizarEstadoMantenimiento } from './aplicacion/casos-uso/ActualizarEstadoMantenimiento'

import { crearServidor } from './infraestructura/http/servidor'


// 1. Adaptadores de persistencia (Infraestructura)

const equipoDAO = new EquipoDAOPrisma(prisma)

const mantenimientoDAO = new MantenimientoDAOPrisma(prisma)


// 2. Casos de uso (Aplicación)

const registrarEquipo = new RegistrarEquipo(equipoDAO)

const consultarEquipos = new ConsultarEquipos(equipoDAO)

const actualizarEquipo = new ActualizarEquipo(equipoDAO)

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
    equipoDAO
  )


// 3. Servidor HTTP (Infraestructura)

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

})


// 4. Iniciar servidor

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