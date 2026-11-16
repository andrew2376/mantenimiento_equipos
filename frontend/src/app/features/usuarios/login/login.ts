import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { UsuarioService } from '../../../core/services/usuario.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    FormsModule
  ],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {

  // ==========================================
  // SERVICIOS
  // ==========================================

  private readonly usuarioService = inject(UsuarioService);
  private readonly router = inject(Router);

  // ==========================================
  // DATOS DEL FORMULARIO
  // ==========================================

  correo = '';
  clave = '';

  // ==========================================
  // ESTADOS DEL COMPONENTE
  // ==========================================

  error = '';
  cargando = false;
  mostrarClave = false;

  // ==========================================
  // INICIAR SESIÓN
  // ==========================================

  iniciarSesion(): void {

    // Limpiar errores anteriores.
    this.error = '';

    // Validar campos obligatorios.
    if (!this.correo || !this.clave) {
      this.error = 'Ingrese el correo y la contraseña';
      return;
    }

    // Activar estado de carga.
    this.cargando = true;

    // Consultar autenticación en el backend.
    this.usuarioService.login({
      correo: this.correo,
      clave: this.clave
    }).subscribe({

      // ========================================
      // RESPUESTA EXITOSA
      // ========================================

      next: (respuesta) => {

        // Guardar token de autenticación.
        localStorage.setItem(
          'token',
          respuesta.token
        );

        // Guardar información del usuario.
        localStorage.setItem(
          'usuario',
          JSON.stringify(respuesta.usuario)
        );

        // Redirigir al Dashboard.
        this.router.navigate(['/dashboard']);

      },

      // ========================================
      // MANEJO DE ERRORES
      // ========================================

      error: (error) => {

        this.cargando = false;

        if (error.status === 401) {

          this.error = 'Correo o contraseña incorrectos';

        } else {

          this.error = 'No se pudo conectar con el servidor';

        }

      },

      // ========================================
      // FINALIZAR CARGA
      // ========================================

      complete: () => {

        this.cargando = false;

      }

    });

  }

}