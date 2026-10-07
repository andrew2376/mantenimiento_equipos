import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Repuesto {
  id: number;
  nombre: string;
  codigo: string;
  descripcion?: string | null;
  costoUnitario: number;
  stock: number;
  activo: boolean;
  creadoEn: string;
}

export interface CrearRepuesto {
  nombre: string;
  codigo: string;
  descripcion?: string | null;
  costoUnitario: number;
  stock?: number;
  activo?: boolean;
}

export interface MantenimientoRepuesto {
  id: number;
  mantenimientoId: number;
  repuestoId: number;
  cantidad: number;
  costoUnitario: number;
  subtotal: number;
  creadoEn: string;
  repuesto?: Repuesto;
}

export interface AsociarRepuesto {
  mantenimientoId: number;
  repuestoId: number;
  cantidad: number;
  costoUnitario?: number;
}

@Injectable({
  providedIn: 'root'
})
export class RepuestoService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:3000/api/repuestos';

  obtenerTodos(): Observable<Repuesto[]> {
    return this.http.get<Repuesto[]>(this.apiUrl);
  }

  obtenerPorId(id: number): Observable<Repuesto> {
    return this.http.get<Repuesto>(`${this.apiUrl}/${id}`);
  }

  crear(repuesto: CrearRepuesto): Observable<Repuesto> {
    return this.http.post<Repuesto>(this.apiUrl, repuesto);
  }

  obtenerPorMantenimiento(mantenimientoId: number): Observable<MantenimientoRepuesto[]> {
    return this.http.get<MantenimientoRepuesto[]>(`${this.apiUrl}/mantenimiento/${mantenimientoId}`);
  }

  asociarAMantenimiento(datos: AsociarRepuesto): Observable<MantenimientoRepuesto> {
    return this.http.post<MantenimientoRepuesto>(`${this.apiUrl}/mantenimiento`, datos);
  }

  eliminarDeMantenimiento(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/mantenimiento/${id}`);
  }
}
