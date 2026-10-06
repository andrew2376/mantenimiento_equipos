import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Usuario {
  id: number;
  nombre: string;
  correo: string;
  rol:
    | 'SOLICITANTE'
    | 'TECNICO'
    | 'ADMINISTRADOR'
    | 'SUPERVISOR';
  activo: boolean;
  creadoEn: string;
}

export interface UsuarioNuevo {
  nombre: string;
  correo: string;
  clave: string;
  rol: Usuario['rol'];
  activo: boolean;
}

export interface LoginDatos {
  correo: string;
  clave: string;
}

export interface LoginRespuesta {
  token: string;
  usuario: Usuario;
}

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {

  private readonly http = inject(HttpClient);

  private readonly apiUrl =
    'http://localhost:3000/api/usuarios';

  listar(): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(
      this.apiUrl
    );
  }

  porId(id: number): Observable<Usuario> {
    return this.http.get<Usuario>(
      `${this.apiUrl}/${id}`
    );
  }

  crear(usuario: UsuarioNuevo): Observable<Usuario> {
    return this.http.post<Usuario>(
      this.apiUrl,
      usuario
    );
  }

  login(datos: LoginDatos): Observable<LoginRespuesta> {
    return this.http.post<LoginRespuesta>(
      `${this.apiUrl}/login`,
      datos
    );
  }
}