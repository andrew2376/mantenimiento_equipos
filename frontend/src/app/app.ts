import { Component, ViewEncapsulation, signal, inject } from '@angular/core';

import { Router, RouterOutlet, RouterLink, RouterLinkActive, NavigationEnd } from '@angular/router';

import { filter } from 'rxjs';

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

  protected readonly mostrarMenu = signal(this.router.url !== '/login');

  protected readonly paginaActual = signal('Sistema de mantenimiento');

  constructor() {
    this.actualizarPagina(this.router.url);

    this.router.events
      .pipe(filter((evento): evento is NavigationEnd => evento instanceof NavigationEnd))
      .subscribe((evento) => {
        this.mostrarMenu.set(evento.urlAfterRedirects !== '/login');

        this.actualizarPagina(evento.urlAfterRedirects);
      });
  }

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

    this.paginaActual.set(paginas[ruta] ?? 'Sistema de mantenimiento');
  }
}
