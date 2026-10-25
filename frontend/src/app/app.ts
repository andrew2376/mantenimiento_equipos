
import { Component, ViewEncapsulation, signal, inject } from '@angular/core';

import {
  Router,
  RouterOutlet,
  RouterLink,
  RouterLinkActive,
  NavigationEnd
} from '@angular/router';

import { filter } from 'rxjs';

import {
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

        this.actualizarPagina(
          evento.urlAfterRedirects
        );

        // Actualizar usuario al navegar
        this.cargarUsuario();

      });

  }


  // ==========================================
  // CARGAR USUARIO DESDE LOCALSTORAGE
  // ==========================================

  private cargarUsuario(): void {

    const usuarioGuardado =
      localStorage.getItem('usuario');


    // Si no existe usuario
    if (!usuarioGuardado) {

      this.nombreUsuario.set('Usuario');

      this.rolUsuario.set('Usuario');

      this.inicialUsuario.set('U');

      return;

    }


    try {

      const usuario: Usuario =
        JSON.parse(usuarioGuardado);


      // Nombre real del usuario
      const nombre =
        usuario.nombre?.trim() || 'Usuario';


      // Rol real del usuario
      const rol =
        usuario.rol || 'SOLICITANTE';


      // Actualizar nombre
      this.nombreUsuario.set(nombre);


      // Actualizar rol
      this.rolUsuario.set(
        this.formatearRol(rol)
      );


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

  private formatearRol(
    rol: Usuario['rol']
  ): string {

    const roles: Record<Usuario['rol'], string> = {

      ADMINISTRADOR: 'Administrador',

      TECNICO: 'Técnico',

      SOLICITANTE: 'Solicitante',

      SUPERVISOR: 'Supervisor',

    };


    return roles[rol] ?? rol;

  }


  // ==========================================
  // PERMITIR RUTA
  // ==========================================

  permitirRuta(ruta: string): void {

    localStorage.setItem(
      'rutaPermitida',
      ruta
    );

  }


  // ==========================================
  // ACTUALIZAR PÁGINA ACTUAL
  // ==========================================

  private actualizarPagina(
    url: string
  ): void {

    const ruta =
      url.split('?')[0].split('/')[1];


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
