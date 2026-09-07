import express from 'express'

import { CrearEquipo } from './aplicacion/casos-uso/CrearEquipo.js'
import { RepositorioEquiposMySQL } from './infraestructura/persistencia/RepositorioEquiposMySQL.js'
import { EquipoController } from './interfaces/controllers/EquipoController.js'
import { crearEquipoRoutes } from './interfaces/routes/EquipoRoutes.js'

const app = express()

app.use(express.json())

const PORT = 3000

// Composición de dependencias
const repositorioEquipos = new RepositorioEquiposMySQL()
const crearEquipo = new CrearEquipo(repositorioEquipos)
const equipoController = new EquipoController(crearEquipo)

// Rutas
app.use(crearEquipoRoutes(equipoController))

app.get('/', (_req, res) => {
  res.json({
    message: 'API Sistema de Mantenimiento de Equipos'
  })
})

app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en http://localhost:${PORT}`)
})