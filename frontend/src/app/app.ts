import {
  Component,
  ViewEncapsulation,
  signal
} from '@angular/core';

import {
  RouterOutlet,
  RouterLink,
  RouterLinkActive
} from '@angular/router';


@Component({
  selector: 'app-root',

  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive
  ],

  styleUrl: './app.css',

  templateUrl: './app.html',

  encapsulation: ViewEncapsulation.None
})
export class App {

  protected readonly title =
    signal('mantenimiento_equipos');

}