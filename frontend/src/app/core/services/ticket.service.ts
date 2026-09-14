import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface EquipoTicket {
  id: number;
  codigoInventario: string;
  nombre: string;
}

export interface UsuarioTicket {
  id: number;
  nombre: string;
}

export interface Ticket {
  id: number;

  titulo: string;

  descripcion: string;

  prioridad:
    | 'BAJA'
    | 'MEDIA'
    | 'ALTA'
    | 'CRITICA';

  estado:
    | 'ABIERTO'
    | 'ASIGNADO'
    | 'EN_DIAGNOSTICO'
    | 'EN_MANTENIMIENTO'
    | 'RESUELTO'
    | 'CERRADO'
    | 'CANCELADO';

  equipoId: number;

  solicitanteId: number;

  tecnicoId?: number;

  equipo?: EquipoTicket;

  solicitante?: UsuarioTicket;

  tecnico?: UsuarioTicket;

  fechaCierre?: string;

  creadoEn: string;

  actualizadoEn: string;
}

@Injectable({
  providedIn: 'root'
})
export class TicketService {

  private readonly http = inject(HttpClient);

  private readonly apiUrl =
    'http://localhost:3000/api/tickets';


  obtenerTodos(): Observable<Ticket[]> {

    return this.http.get<Ticket[]>(
      this.apiUrl
    );

  }


  obtenerPorId(
    id: number
  ): Observable<Ticket> {

    return this.http.get<Ticket>(
      `${this.apiUrl}/${id}`
    );

  }


  crear(
    ticket: Omit<
      Ticket,
      | 'id'
      | 'estado'
      | 'creadoEn'
      | 'actualizadoEn'
    >
  ): Observable<Ticket> {

    return this.http.post<Ticket>(
      this.apiUrl,
      ticket
    );

  }


  actualizar(
    id: number,
    datos: Partial<Ticket>
  ): Observable<Ticket> {

    return this.http.put<Ticket>(
      `${this.apiUrl}/${id}`,
      datos
    );

  }

}