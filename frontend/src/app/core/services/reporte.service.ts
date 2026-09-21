import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ResumenGeneral {
  equipos: {
    total: number;
    operativos: number;
    enMantenimiento: number;
    inactivos: number;
  };
  tickets: {
    total: number;
    abiertos: number;
    enProceso: number;
    resueltos: number;
    tasaResolucion: number;
  };
  mantenimientos: {
    total: number;
    preventivos: number;
    correctivos: number;
    finalizados: number;
    pendientes: number;
  };
  repuestos: {
    totalReferencias: number;
    unidadesEnStock: number;
    unidadesConsumidas: number;
    costoTotalInvertido: number;
  };
  topEquiposIntervenidos: Array<{
    id: number;
    codigo: string;
    nombre: string;
    totalMantenimientos: number;
  }>;
  topRepuestosUtilizados: Array<{
    id: number;
    codigo: string;
    nombre: string;
    cantidadConsumida: number;
    costoTotal: number;
  }>;
}

@Injectable({
  providedIn: 'root'
})
export class ReporteService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:3000/api/reportes';

  obtenerResumen(): Observable<ResumenGeneral> {
    return this.http.get<ResumenGeneral>(`${this.apiUrl}/resumen`);
  }
}
