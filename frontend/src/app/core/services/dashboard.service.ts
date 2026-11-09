
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// ==========================================
// DISTRIBUCIONES
// ==========================================

export interface DistribucionDashboard {
  nombre: string;
  cantidad: number;
}

// ==========================================
// EQUIPOS
// ==========================================

export interface ResumenEquiposDashboard {
  total: number;
  activos: number;
  inactivos: number;
}

// ==========================================
// TICKETS
// ==========================================

export interface ResumenTicketsDashboard {
  total: number;
  pendientes: number;
  criticosPendientes: number;
  resueltos: number;
  porEstado: DistribucionDashboard[];
  porPrioridad: DistribucionDashboard[];
}

// ==========================================
// MANTENIMIENTOS
// ==========================================

export interface ResumenMantenimientosDashboard {
  total: number;
  pendientes: number;
  enProceso: number;
  finalizados: number;
  preventivos: number;
  correctivos: number;
  porEstado: DistribucionDashboard[];
  porTipo: DistribucionDashboard[];
}

// ==========================================
// REPUESTOS
// ==========================================

export interface ResumenRepuestosDashboard {
  total: number;
  activos: number;
  unidadesDisponibles: number;
  agotados: number;
  valorInventario: number;
}

// ==========================================
// ACTIVIDAD MENSUAL
// ==========================================

export interface ActividadMensualDashboard {
  mes: string;
  tickets: number;
  mantenimientos: number;
}

// ==========================================
// TICKETS RECIENTES
// ==========================================

export interface TicketRecienteDashboard {
  id: number;
  titulo: string;
  estado: string;
  prioridad: string;
  equipo: string;
  creadoEn: string;
}

// ==========================================
// MANTENIMIENTOS RECIENTES
// ==========================================

export interface MantenimientoRecienteDashboard {
  id: number;
  descripcion: string;
  tipo: string;
  estado: string;
  equipoId: number;
  fecha: string;
}

// ==========================================
// EQUIPOS FRECUENTES
// ==========================================

export interface EquipoFrecuenteDashboard {
  id: number;
  nombre: string;
  codigoInventario: string;
  cantidadMantenimientos: number;
}

// ==========================================
// REPUESTOS AGOTADOS
// ==========================================

export interface RepuestoAgotadoDashboard {
  id: number;
  nombre: string;
  codigo: string;
  stock: number;
}

// ==========================================
// DASHBOARD COMPLETO
// ==========================================

export interface Dashboard {
  equipos: ResumenEquiposDashboard;
  tickets: ResumenTicketsDashboard;
  mantenimientos: ResumenMantenimientosDashboard;
  repuestos: ResumenRepuestosDashboard;

  actividadMensual: ActividadMensualDashboard[];

  ticketsRecientes: TicketRecienteDashboard[];

  mantenimientosRecientes: MantenimientoRecienteDashboard[];

  equiposFrecuentes: EquipoFrecuenteDashboard[];

  repuestosAgotados: RepuestoAgotadoDashboard[];

  actualizadoEn: string;
}

// ==========================================
// SERVICIO
// ==========================================

@Injectable({
  providedIn: 'root'
})
export class DashboardService {

  private readonly http = inject(HttpClient);

  private readonly apiUrl =
    'http://localhost:3000/api/dashboard';

  obtenerResumen(): Observable<Dashboard> {
    return this.http.get<Dashboard>(this.apiUrl);
  }

}
