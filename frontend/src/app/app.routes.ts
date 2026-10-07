import { Routes } from '@angular/router';

import { EquipoList } from './features/equipos/equipo-list/equipo-list';
import { UsuarioList } from './features/usuarios/usuario-list/usuario-list';
import { TicketList } from './features/tickets/ticket-list/ticket-list';
import { MantenimientoList } from './features/mantenimientos/mantenimiento-list/mantenimiento-list';

import { Login } from './features/usuarios/login/login';

import { authGuard } from './guards/auth.guard';

export const routes: Routes = [

  // ==============================
  // LOGIN
  // ==============================
  {
    path: 'login',
    component: Login
  },

  // ==============================
  // MÓDULOS PROTEGIDOS
  // ==============================
  {
    path: 'equipos',
    component: EquipoList,
    canActivate: [authGuard]
  },

  {
    path: 'usuarios',
    component: UsuarioList,
    canActivate: [authGuard]
  },

  {
    path: 'tickets',
    component: TicketList,
    canActivate: [authGuard]
  },

  {
    path: 'mantenimientos',
    component: MantenimientoList,
    canActivate: [authGuard]
  },

  // ==============================
  // RUTA INICIAL
  // ==============================
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full'
  },

  // ==============================
  // RUTAS QUE NO EXISTEN
  // ==============================
  {
    path: '**',
    redirectTo: '/login'
  }

];