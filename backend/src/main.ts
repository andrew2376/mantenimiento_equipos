import express from 'express'

const app = express()

app.use(express.json())

const PORT = 3000

app.get('/', (_req, res) => {
  res.json({
    message: 'API Sistema de Mantenimiento de Equipos'
  })
})

app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en http://localhost:${PORT}`)
})