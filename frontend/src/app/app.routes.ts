import { Routes } from '@angular/router';

import { EquipoList } from './features/equipos/equipo-list/equipo-list';

import { UsuarioList } from './features/usuarios/usuario-list/usuario-list';

import { TicketList } from './features/tickets/ticket-list/ticket-list';

import { Login } from './features/usuarios/login/login';

export const routes: Routes = [

  {
    path: 'login',
    component: Login
  },

  {
    path: 'equipos',
    component: EquipoList
  },

  {
    path: 'tickets',
    component: TicketList
  },

  {
    path: 'usuarios',
    component: UsuarioList
  },

  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  }

];