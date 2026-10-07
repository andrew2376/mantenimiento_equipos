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

  // ==========================================
  // AGREGADO PARA ACT-014
  // Usuario que se está editando
  // ==========================================

  usuarioEditandoId: number | null = null;

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

    // ==========================================
    // AGREGADO PARA ACT-014
    // null = estamos creando
    // ==========================================

    this.usuarioEditandoId = null;

    this.errorFormulario.set('');
    this.modalAbierto.set(true);
  }

  // ==========================================
  // AGREGADO PARA ACT-014
  // Abrir modal para editar
  // ==========================================

  abrirModalEdicion(usuario: Usuario): void {

    this.usuarioEditandoId = usuario.id;

    this.nombre = usuario.nombre;
    this.correo = usuario.correo;
    this.clave = '';
    this.rol = usuario.rol;
    this.activo = usuario.activo;

    this.errorFormulario.set('');
    this.modalAbierto.set(true);
  }

  cerrarModal(): void {
    if (this.guardando()) {
      return;
    }

    this.modalAbierto.set(false);
    this.errorFormulario.set('');

    // ==========================================
    // AGREGADO PARA ACT-014
    // Limpiar usuario en edición
    // ==========================================

    this.usuarioEditandoId = null;
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

    // ==========================================
    // AGREGADO PARA ACT-014
    // La contraseña solamente es obligatoria
    // cuando estamos CREANDO un usuario.
    // ==========================================

    if (
      this.usuarioEditandoId === null &&
      !this.clave.trim()
    ) {
      this.errorFormulario.set(
        'La contraseña es obligatoria.'
      );
      return;
    }

    this.guardando.set(true);

    // ==========================================
    // ACT-014
    // EDITAR USUARIO
    // ==========================================

    if (this.usuarioEditandoId !== null) {

      this.usuarioService.actualizar(
        this.usuarioEditandoId,
        {
          nombre: this.nombre.trim(),
          correo: this.correo.trim(),
          rol: this.rol,
          activo: this.activo
        }
      ).subscribe({

        next: () => {

          this.guardando.set(false);
          this.modalAbierto.set(false);
          this.usuarioEditandoId = null;

          this.cargarUsuarios();
        },

        error: (error: any) => {

          this.guardando.set(false);

          this.errorFormulario.set(
            error?.error?.error ??
            error?.error?.mensaje ??
            'No se pudo actualizar el usuario.'
          );
        }

      });

      return;
    }

    // ==========================================
    // CREAR USUARIO
    // ==========================================

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