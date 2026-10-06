import { Injectable, inject } from '@angular/core';

import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';


export interface Equipo {

  id: number;

  codigoInventario: string;

  nombre: string;

  tipo: string;

  marca: string;

  modelo?: string;

  numeroSerie?: string;

  ubicacion: string;

  estado: number;

  createdAt: string;

  updatedAt: string;

}


export interface CrearEquipo {

  codigoInventario: string;

  nombre: string;

  tipo: string;

  marca: string;

  modelo?: string;

  numeroSerie?: string;

  ubicacion: string;

  estado?: number;

}


@Injectable({

  providedIn: 'root'

})

export class EquipoService {

  private readonly http = inject(HttpClient);

  private readonly apiUrl =
    'http://localhost:3000/api/equipos';


  obtenerTodos(): Observable<Equipo[]> {

    return this.http.get<Equipo[]>(
      this.apiUrl
    );

  }


  obtenerPorId(
    id: number
  ): Observable<Equipo> {

    return this.http.get<Equipo>(
      `${this.apiUrl}/${id}`
    );

  }


  obtenerPorSerial(
    serial: string
  ): Observable<Equipo> {

    return this.http.get<Equipo>(
      `${this.apiUrl}/serial/${encodeURIComponent(serial)}`
    );

  }


  crear(
    equipo: CrearEquipo
  ): Observable<Equipo> {

    return this.http.post<Equipo>(
      this.apiUrl,
      equipo
    );

  }


  actualizar(
    id: number,
    equipo: CrearEquipo
  ): Observable<Equipo> {

    return this.http.put<Equipo>(
      `${this.apiUrl}/${id}`,
      equipo
    );

  }

}