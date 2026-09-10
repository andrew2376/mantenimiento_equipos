import { Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';

import {
  Usuario,
  UsuarioService
} from '../../../core/services/usuario.service';

@Component({
  selector: 'app-usuario-list',
  imports: [
    DatePipe,
    FormsModule
  ],
  templateUrl: './usuario-list.html'
})
export class UsuarioList implements OnInit {

  private readonly usuarioService =
    inject(UsuarioService);

  usuarios = signal<Usuario[]>([]);
  cargando = signal(true);
  error = signal('');

  // Modal
  modalAbierto = signal(false);
  guardando = signal(false);
  errorFormulario = signal('');

  // Formulario
  nombre = '';
  correo = '';
  clave = '';
  rol: Usuario['rol'] = 'SOLICITANTE';
  activo = true;

  ngOnInit(): void {
    this.cargarUsuarios();
  }

  cargarUsuarios(): void {
    this.cargando.set(true);
    this.error.set('');

    this.usuarioService.listar().subscribe({
      next: (usuarios) => {
        this.usuarios.set(usuarios);
        this.cargando.set(false);
      },

      error: () => {
        this.error.set(
          'No se pudieron cargar los usuarios.'
        );

        this.cargando.set(false);
      }
    });
  }

  abrirModal(): void {
    this.nombre = '';
    this.correo = '';
    this.clave = '';
    this.rol = 'SOLICITANTE';
    this.activo = true;

    this.errorFormulario.set('');
    this.modalAbierto.set(true);
  }

  cerrarModal(): void {
    if (this.guardando()) {
      return;
    }

    this.modalAbierto.set(false);
    this.errorFormulario.set('');
  }

  guardarUsuario(): void {
    this.errorFormulario.set('');

    if (!this.nombre.trim()) {
      this.errorFormulario.set(
        'El nombre es obligatorio.'
      );
      return;
    }

    if (!this.correo.trim()) {
      this.errorFormulario.set(
        'El correo es obligatorio.'
      );
      return;
    }

    if (!this.clave.trim()) {
      this.errorFormulario.set(
        'La contraseña es obligatoria.'
      );
      return;
    }

    this.guardando.set(true);

    this.usuarioService.crear({
      nombre: this.nombre.trim(),
      correo: this.correo.trim(),
      clave: this.clave,
      rol: this.rol,
      activo: this.activo
    }).subscribe({

      next: () => {
        this.guardando.set(false);
        this.modalAbierto.set(false);
        this.cargarUsuarios();
      },

      error: (error: any) => {
        this.guardando.set(false);

        this.errorFormulario.set(
          error?.error?.mensaje ??
          'No se pudo crear el usuario.'
        );
      }

    });
  }
}