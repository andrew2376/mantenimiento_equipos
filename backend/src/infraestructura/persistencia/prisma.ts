import { PrismaClient } from '@prisma/client'

const connectionString = process.env['DATABASE_URL']
if (!connectionString) {
  console.warn('⚠️ Advertencia: No se encontró DATABASE_URL en las variables de entorno. Copia .env.example a .env')
}

export const prisma = new PrismaClient()
