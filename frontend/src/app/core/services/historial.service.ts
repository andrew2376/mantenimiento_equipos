import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface EventoHistorial {
  id: string;
  fecha: string;
  tipo: 'TICKET' | 'MANTENIMIENTO' | 'REPUESTO';
  titulo: string;
  descripcion: string;
  estado?: string;
  responsable?: string;
  costo?: number;
}

export interface HistorialEquipo {
  equipo: {
    id: number;
    codigoInventario: string;
    nombre: string;
    tipo: string;
    marca: string;
    modelo: string | null;
    numeroSerie: string | null;
    ubicacion: string;
    estado: number;
    creadoEn: string;
  };
  estadisticas: {
    totalTickets: number;
    totalMantenimientos: number;
    totalRepuestosUsados: number;
    costoTotalRepuestos: number;
  };
  lineaDeTiempo: EventoHistorial[];
}

@Injectable({
  providedIn: 'root'
})
export class HistorialService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:3000/api/historial';

  obtenerHistorialEquipo(equipoId: number): Observable<HistorialEquipo> {
    return this.http.get<HistorialEquipo>(`${this.apiUrl}/equipo/${equipoId}`);
  }
}
