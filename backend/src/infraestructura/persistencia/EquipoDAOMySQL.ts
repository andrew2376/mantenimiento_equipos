import { ResultSetHeader, RowDataPacket } from 'mysql2/promise'
import { pool } from './database.js'
import type { Equipo, EquipoNuevo } from '../../dominio/modelo/Equipo.js'
import type { EquipoDAO } from '../../dominio/puertos/index.js'

interface EquipoRow extends RowDataPacket {
  id: number
  codigo_inventario: string
  nombre: string
  tipo: string
  marca: string
  modelo: string | null
  numero_serie: string | null
  ubicacion: string
  estado: string | number
  created_at: Date
  updated_at: Date
}

export class EquipoDAOMySQL implements EquipoDAO {

  async guardar(equipo: EquipoNuevo | Equipo): Promise<Equipo> {
    const [resultado] = await pool.execute<ResultSetHeader>(
      `
      INSERT INTO equipos (
        codigo_inventario,
        nombre,
        tipo,
        marca,
        modelo,
        numero_serie,
        ubicacion,
        estado
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        equipo.codigoInventario,
        equipo.nombre,
        equipo.tipo,
        equipo.marca,
        equipo.modelo ?? null,
        equipo.numeroSerie ?? null,
        equipo.ubicacion,
        equipo.estado
      ]
    )

    const creado = await this.porId(resultado.insertId)
    if (!creado) {
      throw new Error(`No se pudo recuperar el equipo recién creado con id ${resultado.insertId}`)
    }
    return creado
  }

  async listar(): Promise<Equipo[]> {
    const [filas] = await pool.execute<EquipoRow[]>(
      `
      SELECT *
      FROM equipos
      ORDER BY id DESC
      `
    )

    return filas.map(this.mapearEquipo)
  }

  async porId(id: number): Promise<Equipo | null> {
    const [filas] = await pool.execute<EquipoRow[]>(
      `
      SELECT *
      FROM equipos
      WHERE id = ?
      `,
      [id]
    )

    if (filas.length === 0) {
      return null
    }

    return this.mapearEquipo(filas[0])
  }

  async porCodigoInventario(codigo: string): Promise<Equipo | null> {
    const [filas] = await pool.execute<EquipoRow[]>(
      `
      SELECT *
      FROM equipos
      WHERE codigo_inventario = ?
      `,
      [codigo]
    )

    if (filas.length === 0) {
      return null
    }

    return this.mapearEquipo(filas[0])
  }

  async actualizar(equipo: Equipo): Promise<Equipo> {
    await pool.execute<ResultSetHeader>(
      `
      UPDATE equipos
      SET
        codigo_inventario = ?,
        nombre = ?,
        tipo = ?,
        marca = ?,
        modelo = ?,
        numero_serie = ?,
        ubicacion = ?,
        estado = ?
      WHERE id = ?
      `,
      [
        equipo.codigoInventario,
        equipo.nombre,
        equipo.tipo,
        equipo.marca,
        equipo.modelo ?? null,
        equipo.numeroSerie ?? null,
        equipo.ubicacion,
        equipo.estado,
        equipo.id
      ]
    )

    const actualizado = await this.porId(equipo.id)
    if (!actualizado) {
      throw new Error(`Equipo con id ${equipo.id} no encontrado para actualizar`)
    }
    return actualizado
  }

  async eliminar(id: number): Promise<void> {
    await pool.execute(
      `
      DELETE FROM equipos
      WHERE id = ?
      `,
      [id]
    )
  }

  private mapearEquipo(fila: EquipoRow): Equipo {
    return {
      id: fila.id,
      codigoInventario: fila.codigo_inventario,
      nombre: fila.nombre,
      tipo: fila.tipo,
      marca: fila.marca,
      modelo: fila.modelo ?? undefined,
      numeroSerie: fila.numero_serie ?? undefined,
      ubicacion: fila.ubicacion,
      estado: String(fila.estado),
      createdAt: fila.created_at,
      updatedAt: fila.updated_at
    }
  }
}

// Alias para compatibilidad con código previo de Andrew
export { EquipoDAOMySQL as RepositorioEquiposMySQL }
