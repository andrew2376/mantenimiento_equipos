
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
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

// ==========================================
// AGREGADO PARA ACT-014
// Datos que se pueden actualizar
// ==========================================

export interface UsuarioActualizar {
  nombre?: string;
  correo?: string;
  rol?: Usuario['rol'];
  activo?: boolean;
}

export interface LoginDatos {
  correo: string;
  clave: string;
}

export interface LoginRespuesta {
  token: string;
  usuario: Usuario;
}

// ==========================================
// DATOS PARA CAMBIAR CONTRASEÑA
// ==========================================

export interface CambioClaveDatos {
  claveActual: string;
  claveNueva: string;
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

  // ==========================================
  // AGREGADO PARA ACT-014
  // Actualizar usuario existente
  // ==========================================

  actualizar(
    id: number,
    usuario: UsuarioActualizar
  ): Observable<Usuario> {

    return this.http.put<Usuario>(
      `${this.apiUrl}/${id}`,
      usuario
    );
  }

  // ==========================================
  // INICIAR SESIÓN
  // ==========================================

  login(datos: LoginDatos): Observable<LoginRespuesta> {
    return this.http.post<LoginRespuesta>(
      `${this.apiUrl}/login`,
      datos
    );
  }

  // ==========================================
  // CAMBIAR CONTRASEÑA
  // ==========================================

  cambiarClave(
    datos: CambioClaveDatos
  ): Observable<{ mensaje: string }> {

    const token = localStorage.getItem('token');

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

    return this.http.put<{ mensaje: string }>(
      `${this.apiUrl}/cambiar-clave`,
      datos,
      { headers }
    );
  }
}
