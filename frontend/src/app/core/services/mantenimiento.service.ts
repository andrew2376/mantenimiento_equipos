import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export type TipoMantenimiento = 'PREVENTIVO' | 'CORRECTIVO';
export type EstadoMantenimiento = 'PENDIENTE' | 'EN_PROCESO' | 'FINALIZADO' | 'CANCELADO';

export interface Mantenimiento {
  id: number;
  descripcion: string;
  tipo: TipoMantenimiento;
  estado: EstadoMantenimiento;
  diagnostico: string | null;
  tecnico: string | null;
  fecha: string;
  equipoId: number;
  ticketId?: number | null;
}

export interface CrearMantenimiento {
  descripcion: string;
  tipo: TipoMantenimiento;
  estado?: EstadoMantenimiento;
  diagnostico?: string | null;
  tecnico?: string | null;
  equipoId: number;
  ticketId?: number | null;
}

export interface ActualizarMantenimiento {
  estado?: EstadoMantenimiento;
  diagnostico?: string | null;
  tecnico?: string | null;
  descripcion?: string;
  tipo?: TipoMantenimiento;
  equipoId?: number;
  ticketId?: number | null;
}

@Injectable({
  providedIn: 'root'
})
export class MantenimientoService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:3000/api/mantenimientos';

  obtenerTodos(): Observable<Mantenimiento[]> {
    return this.http.get<Mantenimiento[]>(this.apiUrl);
  }

  obtenerPorId(id: number): Observable<Mantenimiento> {
    return this.http.get<Mantenimiento>(`${this.apiUrl}/${id}`);
  }

  obtenerPorEquipo(equipoId: number): Observable<Mantenimiento[]> {
    return this.http.get<Mantenimiento[]>(`${this.apiUrl}/equipo/${equipoId}`);
  }

  crear(mantenimiento: CrearMantenimiento): Observable<Mantenimiento> {
    return this.http.post<Mantenimiento>(this.apiUrl, mantenimiento);
  }

  actualizarEstado(id: number, datos: ActualizarMantenimiento): Observable<Mantenimiento> {
    return this.http.patch<Mantenimiento>(`${this.apiUrl}/${id}`, datos);
  }
}
