import { Routes } from '@angular/router';

import { EquipoList } from './features/equipos/equipo-list/equipo-list';

import { UsuarioList } from './features/usuarios/usuario-list/usuario-list';

import { TicketList } from './features/tickets/ticket-list/ticket-list';

import { MantenimientoList } from './features/mantenimientos/mantenimiento-list/mantenimiento-list';

import { RepuestoList } from './features/repuestos/repuesto-list/repuesto-list';

import { Historial } from './features/historial/historial';

import { Reportes } from './features/reportes/reportes';

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
    path: 'mantenimientos',
    component: MantenimientoList
  },

  {
    path: 'repuestos',
    component: RepuestoList
  },

  {
    path: 'historial',
    component: Historial
  },

  {
    path: 'reportes',
    component: Reportes
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