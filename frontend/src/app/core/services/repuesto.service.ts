import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Repuesto {
  id: number;
  codigo: string;
  nombre: string;
  descripcion?: string | null;
  stock: number;
  precioUnitario: number;
  creadoEn: string;
}

export interface RepuestoUsado {
  id: number;
  mantenimientoId: number;
  repuestoId: number;
  cantidad: number;
  costoUnitario: number;
  subtotal: number;
  creadoEn: string;
  repuestoNombre?: string;
  repuestoCodigo?: string;
}

export interface RegistroRepuestoPayload {
  codigo: string;
  nombre: string;
  descripcion?: string | null;
  stock?: number;
  precioUnitario?: number;
}

export interface AsignarRepuestoPayload {
  repuestoId: number;
  cantidad: number;
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

  crear(datos: RegistroRepuestoPayload): Observable<Repuesto> {
    return this.http.post<Repuesto>(this.apiUrl, datos);
  }

  obtenerPorMantenimiento(mantenimientoId: number): Observable<RepuestoUsado[]> {
    return this.http.get<RepuestoUsado[]>(`${this.apiUrl}/mantenimiento/${mantenimientoId}`);
  }

  asignarAMantenimiento(mantenimientoId: number, datos: AsignarRepuestoPayload): Observable<RepuestoUsado> {
    return this.http.post<RepuestoUsado>(`${this.apiUrl}/mantenimiento/${mantenimientoId}`, datos);
  }
}
