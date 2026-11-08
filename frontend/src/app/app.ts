
import {
  Component,
  ViewEncapsulation,
  signal,
  computed,
  inject,
  HostListener
} from '@angular/core';

import {
  Router,
  RouterOutlet,
  RouterLink,
  RouterLinkActive,
  NavigationEnd
} from '@angular/router';

import { HttpErrorResponse } from '@angular/common/http';
import { filter } from 'rxjs';

import {
  UsuarioService
} from './core/services/usuario.service';

import type {
  Usuario
} from './core/services/usuario.service';


@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  styleUrl: './app.css',
  templateUrl: './app.html',
  encapsulation: ViewEncapsulation.None,
})
export class App {

  private readonly router = inject(Router);

  private readonly usuarioService = inject(UsuarioService);

  protected readonly title = signal('mantenimiento_equipos');

  protected readonly mostrarMenu = signal(
    this.router.url !== '/login'
  );

  protected readonly paginaActual = signal(
    'Sistema de mantenimiento'
  );


  // ==========================================
  // INFORMACIÓN DEL USUARIO AUTENTICADO
  // ==========================================

  protected readonly nombreUsuario = signal('Usuario');

  protected readonly rolUsuario = signal('Usuario');

  protected readonly inicialUsuario = signal('U');

  protected readonly panelPerfilAbierto = signal(false);


  // ==========================================
  // CAMBIAR CONTRASEÑA
  // ==========================================

  protected readonly modalCambioClaveAbierto = signal(false);

  protected readonly claveActual = signal('');

  protected readonly claveNueva = signal('');

  protected readonly confirmarClave = signal('');

  protected readonly mostrarClaveActual = signal(false);

  protected readonly mostrarClaveNueva = signal(false);

  protected readonly mostrarConfirmacion = signal(false);

  protected readonly cambiandoClave = signal(false);

  protected readonly errorCambioClave = signal('');

  protected readonly exitoCambioClave = signal('');


  // ==========================================
  // INDICADOR DE SEGURIDAD DE CONTRASEÑA
  // ==========================================

  protected readonly nivelSeguridad = computed(() => {

    const clave = this.claveNueva();

    // Si no hay contraseña, no mostrar progreso
    if (!clave) {

      return {
        porcentaje: 0,
        texto: 'Sin evaluar',
        clase: 'vacio'
      };

    }

    let puntos = 0;

    // Mínimo 8 caracteres
    if (clave.length >= 8) {
      puntos++;
    }

    // Mayúsculas y minúsculas
    if (/[A-Z]/.test(clave) && /[a-z]/.test(clave)) {
      puntos++;
    }

    // Números
    if (/[0-9]/.test(clave)) {
      puntos++;
    }

    // Caracteres especiales
    if (/[^A-Za-z0-9]/.test(clave)) {
      puntos++;
    }

    // Longitud de 12 caracteres o más
    if (clave.length >= 12) {
      puntos++;
    }

    // Contraseña débil
    if (puntos <= 2) {

      return {
        porcentaje: puntos * 20,
        texto: 'Débil',
        clase: 'debil'
      };

    }

    // Contraseña aceptable
    if (puntos === 3) {

      return {
        porcentaje: 60,
        texto: 'Aceptable',
        clase: 'media'
      };

    }

    // Contraseña fuerte
    if (puntos === 4) {

      return {
        porcentaje: 80,
        texto: 'Fuerte',
        clase: 'fuerte'
      };

    }

    // Contraseña muy fuerte
    return {
      porcentaje: 100,
      texto: 'Muy fuerte',
      clase: 'fuerte'
    };

  });


  // ==========================================
  // CONSTRUCTOR
  // ==========================================

  constructor() {

    // Cargar información del usuario
    this.cargarUsuario();

    // Actualizar página actual
    this.actualizarPagina(this.router.url);

    // Escuchar cambios de navegación
    this.router.events
      .pipe(
        filter(
          (evento): evento is NavigationEnd =>
            evento instanceof NavigationEnd
        )
      )
      .subscribe((evento) => {

        this.mostrarMenu.set(
          evento.urlAfterRedirects !== '/login'
        );

        this.actualizarPagina(evento.urlAfterRedirects);

        // Actualizar usuario al navegar
        this.cargarUsuario();

      });

  }


  // ==========================================
  // CARGAR USUARIO DESDE LOCALSTORAGE
  // ==========================================

  private cargarUsuario(): void {

    const usuarioGuardado = localStorage.getItem('usuario');

    // Si no existe usuario
    if (!usuarioGuardado) {

      this.nombreUsuario.set('Usuario');

      this.rolUsuario.set('Usuario');

      this.inicialUsuario.set('U');

      return;

    }

    try {

      const usuario: Usuario = JSON.parse(usuarioGuardado);

      // Nombre real del usuario
      const nombre = usuario.nombre?.trim() || 'Usuario';

      // Rol real del usuario
      const rol = usuario.rol || 'SOLICITANTE';

      // Actualizar nombre
      this.nombreUsuario.set(nombre);

      // Actualizar rol
      this.rolUsuario.set(this.formatearRol(rol));

      // Actualizar inicial
      this.inicialUsuario.set(
        nombre.charAt(0).toUpperCase()
      );

    } catch (error) {

      console.error(
        'Error al cargar información del usuario:',
        error
      );

      this.nombreUsuario.set('Usuario');

      this.rolUsuario.set('Usuario');

      this.inicialUsuario.set('U');

    }

  }


  // ==========================================
  // FORMATEAR ROL
  // ==========================================

  private formatearRol(rol: Usuario['rol']): string {

    const roles: Record<Usuario['rol'], string> = {

      ADMINISTRADOR: 'Administrador',

      TECNICO: 'Técnico',

      SOLICITANTE: 'Solicitante',

      SUPERVISOR: 'Supervisor',

    };

    return roles[rol] ?? rol;

  }


  // ==========================================
  // PANEL DE PERFIL DE USUARIO
  // ==========================================

  // Abrir o cerrar el panel
  alternarPanelPerfil(): void {

    this.panelPerfilAbierto.update(
      (abierto) => !abierto
    );

  }


  // Cerrar al hacer clic fuera del panel
  @HostListener('document:click')
  cerrarPanelPerfil(): void {

    this.panelPerfilAbierto.set(false);

  }


  // Cerrar al presionar Escape
  @HostListener('document:keydown.escape')
  cerrarPanelConEscape(): void {

    if (this.modalCambioClaveAbierto()) {

      this.cerrarModalCambioClave();

      return;

    }

    this.panelPerfilAbierto.set(false);

  }


  // ==========================================
  // MODAL CAMBIAR CONTRASEÑA
  // ==========================================

  abrirModalCambioClave(): void {

    // Cerrar el panel de perfil
    this.panelPerfilAbierto.set(false);

    // Limpiar el formulario
    this.limpiarFormularioClave();

    // Abrir modal
    this.modalCambioClaveAbierto.set(true);

  }


  cerrarModalCambioClave(): void {

    // Evitar cerrar mientras se procesa la petición
    if (this.cambiandoClave()) {
      return;
    }

    this.modalCambioClaveAbierto.set(false);

    this.limpiarFormularioClave();

  }


  private limpiarFormularioClave(): void {

    this.claveActual.set('');

    this.claveNueva.set('');

    this.confirmarClave.set('');

    this.mostrarClaveActual.set(false);

    this.mostrarClaveNueva.set(false);

    this.mostrarConfirmacion.set(false);

    this.errorCambioClave.set('');

    this.exitoCambioClave.set('');

  }


  // ==========================================
  // MOSTRAR / OCULTAR CONTRASEÑAS
  // ==========================================

  alternarVisibilidadClaveActual(): void {

    this.mostrarClaveActual.update(
      (visible) => !visible
    );

  }


  alternarVisibilidadClaveNueva(): void {

    this.mostrarClaveNueva.update(
      (visible) => !visible
    );

  }


  alternarVisibilidadConfirmacion(): void {

    this.mostrarConfirmacion.update(
      (visible) => !visible
    );

  }


  // ==========================================
  // CAMBIAR CONTRASEÑA
  // ==========================================

  cambiarClave(): void {

    // Evitar envíos duplicados
    if (this.cambiandoClave() || this.exitoCambioClave()) {
      return;
    }

    this.errorCambioClave.set('');

    this.exitoCambioClave.set('');

    const actual = this.claveActual();

    const nueva = this.claveNueva();

    const confirmacion = this.confirmarClave();


    // Validar campos obligatorios
    if (!actual || !nueva || !confirmacion) {

      this.errorCambioClave.set(
        'Debes completar todos los campos.'
      );

      return;

    }


    // Validar longitud
    if (nueva.length < 8) {

      this.errorCambioClave.set(
        'La nueva contraseña debe tener mínimo 8 caracteres.'
      );

      return;

    }


    // Validar mayúscula, minúscula y número
    if (
      !/[A-Z]/.test(nueva) ||
      !/[a-z]/.test(nueva) ||
      !/[0-9]/.test(nueva)
    ) {

      this.errorCambioClave.set(
        'La contraseña debe incluir una mayúscula, una minúscula y un número.'
      );

      return;

    }


    // Validar confirmación
    if (nueva !== confirmacion) {

      this.errorCambioClave.set(
        'Las nuevas contraseñas no coinciden.'
      );

      return;

    }


    // Evitar reutilizar la contraseña actual
    if (actual === nueva) {

      this.errorCambioClave.set(
        'La nueva contraseña debe ser diferente a la actual.'
      );

      return;

    }


    // Iniciar petición al backend
    this.cambiandoClave.set(true);

    this.usuarioService.cambiarClave({

      claveActual: actual,

      claveNueva: nueva

    }).subscribe({

      next: (respuesta) => {

        this.cambiandoClave.set(false);

        // Limpiar las contraseñas ingresadas
        this.claveActual.set('');

        this.claveNueva.set('');

        this.confirmarClave.set('');

        this.mostrarClaveActual.set(false);

        this.mostrarClaveNueva.set(false);

        this.mostrarConfirmacion.set(false);

        // Mostrar confirmación
        this.exitoCambioClave.set(
          respuesta?.mensaje ||
          'Contraseña actualizada correctamente.'
        );

      },

      error: (error: HttpErrorResponse) => {

        this.cambiandoClave.set(false);

        const mensaje =
          error.error?.error ||
          error.error?.message ||
          'No fue posible actualizar la contraseña. Inténtalo nuevamente.';

        this.errorCambioClave.set(
          typeof mensaje === 'string'
            ? mensaje
            : 'No fue posible actualizar la contraseña.'
        );

      }

    });

  }


  // ==========================================
  // PERMITIR RUTA
  // ==========================================

  permitirRuta(ruta: string): void {

    localStorage.setItem('rutaPermitida', ruta);

  }


  // ==========================================
  // CERRAR SESIÓN
  // ==========================================

  cerrarSesion(): void {

    // Cerrar el panel de perfil
    this.panelPerfilAbierto.set(false);

    this.modalCambioClaveAbierto.set(false);

    // Eliminar los datos de autenticación
    localStorage.removeItem('token');

    localStorage.removeItem('usuario');

    // Redirigir al login
    this.router.navigate(['/login']);

  }


  // ==========================================
  // ACTUALIZAR PÁGINA ACTUAL
  // ==========================================

  private actualizarPagina(url: string): void {

    const ruta = url.split('?')[0].split('/')[1];

    const paginas: Record<string, string> = {

      equipos: 'Equipos',

      tickets: 'Tickets de mantenimiento',

      mantenimientos: 'Mantenimiento',

      historial: 'Historial',

      usuarios: 'Usuarios',

      reportes: 'Reportes',

      configuracion: 'Configuración',

    };

    this.paginaActual.set(
      paginas[ruta] ?? 'Sistema de mantenimiento'
    );

  }

}
