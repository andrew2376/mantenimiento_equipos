import { PrismaClient } from './generado/client'
import { PrismaMariaDb } from '@prisma/adapter-mariadb'

const host = process.env['DB_HOST'] ?? 'localhost'
const port = Number(process.env['DB_PORT'] ?? 3306)
const user = process.env['DB_USER'] ?? 'root'
const password = process.env['DB_PASSWORD'] ?? ''
const database =
  process.env['DB_NAME'] ?? 'mantenimiento_equipos'

const adapter = new PrismaMariaDb({
  host,
  port,
  user,
  password,
  database
})

export const prisma = new PrismaClient({
  adapter
})