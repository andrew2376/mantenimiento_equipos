import { Routes } from '@angular/router';

import { EquipoList } from './features/equipos/equipo-list/equipo-list';

export const routes: Routes = [
  {
    path: 'equipos',
    component: EquipoList
  },
  {
    path: '',
    redirectTo: 'equipos',
    pathMatch: 'full'
  }
];