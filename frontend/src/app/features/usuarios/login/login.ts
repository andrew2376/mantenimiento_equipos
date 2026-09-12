import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import {
  UsuarioService
} from '../../../core/services/usuario.service';

@Component({
  selector: 'app-login',
  imports: [FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {

  private readonly usuarioService = inject(UsuarioService);
  private readonly router = inject(Router);

  correo = '';
  clave = '';

  error = '';
  cargando = false;

  iniciarSesion(): void {

    this.error = '';

    if (!this.correo || !this.clave) {
      this.error = 'Ingrese el correo y la contraseña';
      return;
    }

    this.cargando = true;

    this.usuarioService.login({
      correo: this.correo,
      clave: this.clave
    }).subscribe({
      next: (respuesta) => {

        localStorage.setItem(
          'token',
          respuesta.token
        );

        localStorage.setItem(
          'usuario',
          JSON.stringify(respuesta.usuario)
        );

        this.router.navigate(['/equipos']);

      },

      error: (error) => {

        this.cargando = false;

        if (error.status === 401) {
          this.error = 'Correo o contraseña incorrectos';
        } else {
          this.error = 'No se pudo conectar con el servidor';
        }

      },

      complete: () => {
        this.cargando = false;
      }
    });
  }
}