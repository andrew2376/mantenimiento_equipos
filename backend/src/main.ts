import { EquipoDAOMySQL } from './infraestructura/persistencia/EquipoDAOMySQL.js'
import { MantenimientoDAOMySQL } from './infraestructura/persistencia/MantenimientoDAOMySQL.js'

import { RegistrarEquipo } from './aplicacion/casos-uso/RegistrarEquipo.js'
import { ObtenerEquipos } from './aplicacion/casos-uso/ObtenerEquipos.js'
import { RegistrarMantenimiento } from './aplicacion/casos-uso/RegistrarMantenimiento.js'
import { ObtenerMantenimientos } from './aplicacion/casos-uso/ObtenerMantenimientos.js'

import { crearServidor } from './infraestructura/http/servidor.js'

const PORT = Number(process.env.PORT) || 3000

// 1. Instanciación de adaptadores de infraestructura (Persistencia MySQL)
const equipoDAO = new EquipoDAOMySQL()
const mantenimientoDAO = new MantenimientoDAOMySQL()

// 2. Instanciación de casos de uso (Capa de Aplicación)
const registrarEquipo = new RegistrarEquipo(equipoDAO)
const obtenerEquipos = new ObtenerEquipos(equipoDAO)
const registrarMantenimiento = new RegistrarMantenimiento(mantenimientoDAO)
const obtenerMantenimientos = new ObtenerMantenimientos(mantenimientoDAO)

// 3. Creación y arranque del servidor HTTP
const app = crearServidor({
  registrarEquipo,
  obtenerEquipos,
  registrarMantenimiento,
  obtenerMantenimientos
})

app.listen(PORT, () => {
  console.log(`⚡ Servidor ejecutándose en http://localhost:${PORT}`)
})