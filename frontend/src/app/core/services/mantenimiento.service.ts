import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Mantenimiento {
  id: number;
  descripcion: string;
  tipo: 'PREVENTIVO' | 'CORRECTIVO';
  estado: 'PENDIENTE' | 'EN_PROCESO' | 'FINALIZADO' | 'CANCELADO';
  diagnostico?: string | null;
  tecnico?: string | null;
  fecha: string;
  equipoId: number;
  ticketId?: number | null;
  equipoNombre?: string;
  equipoCodigo?: string;
  ticketTitulo?: string;
}

export interface RegistroMantenimientoPayload {
  descripcion: string;
  equipoId: number;
  ticketId?: number | null;
  tipo?: 'PREVENTIVO' | 'CORRECTIVO';
  estado?: 'PENDIENTE' | 'EN_PROCESO' | 'FINALIZADO' | 'CANCELADO';
  diagnostico?: string | null;
  tecnico?: string | null;
}

export interface ActualizarMantenimientoPayload {
  estado?: 'PENDIENTE' | 'EN_PROCESO' | 'FINALIZADO' | 'CANCELADO';
  diagnostico?: string;
  tecnico?: string;
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

  obtenerHistorialPorEquipo(equipoId: number): Observable<Mantenimiento[]> {
    return this.http.get<Mantenimiento[]>(`${this.apiUrl}/equipo/${equipoId}`);
  }

  crear(datos: RegistroMantenimientoPayload): Observable<Mantenimiento> {
    return this.http.post<Mantenimiento>(this.apiUrl, datos);
  }

  actualizar(id: number, datos: ActualizarMantenimientoPayload): Observable<Mantenimiento> {
    return this.http.patch<Mantenimiento>(`${this.apiUrl}/${id}`, datos);
  }
}
