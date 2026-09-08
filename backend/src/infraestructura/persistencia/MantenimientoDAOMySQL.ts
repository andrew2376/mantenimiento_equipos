import { ResultSetHeader, RowDataPacket } from 'mysql2/promise'
import { pool } from './database.js'
import type { Mantenimiento, MantenimientoNuevo } from '../../dominio/modelo/Mantenimiento.js'
import type { MantenimientoDAO } from '../../dominio/puertos/index.js'

interface MantenimientoRow extends RowDataPacket {
  id: number
  equipo_id: number
  solicitante: string
  tecnico_asignado: string | null
  tipo: string
  descripcion_falla: string
  diagnostico: string | null
  actividades_realizadas: string | null
  repuestos_utilizados: string | null
  estado: string
  fecha_solicitud: Date
  fecha_finalizacion: Date | null
  created_at: Date
  updated_at: Date
}

export class MantenimientoDAOMySQL implements MantenimientoDAO {

  async guardar(mantenimiento: MantenimientoNuevo | Mantenimiento): Promise<Mantenimiento> {
    const [resultado] = await pool.execute<ResultSetHeader>(
      `
      INSERT INTO mantenimientos (
        equipo_id,
        solicitante,
        tecnico_asignado,
        tipo,
        descripcion_falla,
        diagnostico,
        actividades_realizadas,
        repuestos_utilizados,
        estado,
        fecha_solicitud,
        fecha_finalizacion
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        mantenimiento.equipoId,
        mantenimiento.solicitante,
        mantenimiento.tecnicoAsignado ?? null,
        mantenimiento.tipo,
        mantenimiento.descripcionFalla,
        mantenimiento.diagnostico ?? null,
        mantenimiento.actividadesRealizadas ?? null,
        mantenimiento.repuestosUtilizados ?? null,
        mantenimiento.estado,
        mantenimiento.fechaSolicitud ?? new Date(),
        mantenimiento.fechaFinalizacion ?? null
      ]
    )

    const creado = await this.porId(resultado.insertId)
    if (!creado) {
      throw new Error(`No se pudo recuperar el mantenimiento creado con id ${resultado.insertId}`)
    }
    return creado
  }

  async listar(): Promise<Mantenimiento[]> {
    const [filas] = await pool.execute<MantenimientoRow[]>(
      `
      SELECT *
      FROM mantenimientos
      ORDER BY id DESC
      `
    )

    return filas.map(this.mapearMantenimiento)
  }

  async porId(id: number): Promise<Mantenimiento | null> {
    const [filas] = await pool.execute<MantenimientoRow[]>(
      `
      SELECT *
      FROM mantenimientos
      WHERE id = ?
      `,
      [id]
    )

    if (filas.length === 0) {
      return null
    }

    return this.mapearMantenimiento(filas[0])
  }

  async porEquipoId(equipoId: number): Promise<Mantenimiento[]> {
    const [filas] = await pool.execute<MantenimientoRow[]>(
      `
      SELECT *
      FROM mantenimientos
      WHERE equipo_id = ?
      ORDER BY id DESC
      `,
      [equipoId]
    )

    return filas.map(this.mapearMantenimiento)
  }

  async actualizar(mantenimiento: Mantenimiento): Promise<Mantenimiento> {
    await pool.execute<ResultSetHeader>(
      `
      UPDATE mantenimientos
      SET
        equipo_id = ?,
        solicitante = ?,
        tecnico_asignado = ?,
        tipo = ?,
        descripcion_falla = ?,
        diagnostico = ?,
        actividades_realizadas = ?,
        repuestos_utilizados = ?,
        estado = ?,
        fecha_solicitud = ?,
        fecha_finalizacion = ?
      WHERE id = ?
      `,
      [
        mantenimiento.equipoId,
        mantenimiento.solicitante,
        mantenimiento.tecnicoAsignado ?? null,
        mantenimiento.tipo,
        mantenimiento.descripcionFalla,
        mantenimiento.diagnostico ?? null,
        mantenimiento.actividadesRealizadas ?? null,
        mantenimiento.repuestosUtilizados ?? null,
        mantenimiento.estado,
        mantenimiento.fechaSolicitud,
        mantenimiento.fechaFinalizacion ?? null,
        mantenimiento.id
      ]
    )

    const actualizado = await this.porId(mantenimiento.id)
    if (!actualizado) {
      throw new Error(`Mantenimiento con id ${mantenimiento.id} no encontrado para actualizar`)
    }
    return actualizado
  }

  async eliminar(id: number): Promise<void> {
    await pool.execute(
      `
      DELETE FROM mantenimientos
      WHERE id = ?
      `,
      [id]
    )
  }

  private mapearMantenimiento(fila: MantenimientoRow): Mantenimiento {
    return {
      id: fila.id,
      equipoId: fila.equipo_id,
      solicitante: fila.solicitante,
      tecnicoAsignado: fila.tecnico_asignado ?? undefined,
      tipo: fila.tipo,
      descripcionFalla: fila.descripcion_falla,
      diagnostico: fila.diagnostico ?? undefined,
      actividadesRealizadas: fila.actividades_realizadas ?? undefined,
      repuestosUtilizados: fila.repuestos_utilizados ?? undefined,
      estado: fila.estado,
      fechaSolicitud: fila.fecha_solicitud,
      fechaFinalizacion: fila.fecha_finalizacion ?? undefined,
      createdAt: fila.created_at,
      updatedAt: fila.updated_at
    }
  }
}

export { MantenimientoDAOMySQL as RepositorioMantenimientosMySQL }

