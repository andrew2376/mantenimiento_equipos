import { Routes } from '@angular/router';

import { EquipoList } from './features/equipos/equipo-list/equipo-list';
import { UsuarioList } from './features/usuarios/usuario-list/usuario-list';

export const routes: Routes = [

  {
    path: 'equipos',
    component: EquipoList
  },

  {
    path: 'usuarios',
    component: UsuarioList
  },

  {
    path: '',
    redirectTo: 'equipos',
    pathMatch: 'full'
  }

];