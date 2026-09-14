import { DatePipe } from '@angular/common';

import {
  ChangeDetectorRef,
  Component,
  OnInit,
  inject
} from '@angular/core';

import { FormsModule } from '@angular/forms';

import {
  Ticket,
  TicketService
} from '../../../core/services/ticket.service';

import { TicketForm } from '../ticket-form/ticket-form';


@Component({
  selector: 'app-ticket-list',
  standalone: true,
  imports: [
    FormsModule,
    DatePipe,
    TicketForm
  ],
  templateUrl: './ticket-list.html'
})
export class TicketList implements OnInit {

  private readonly ticketService =
    inject(TicketService);

  private readonly changeDetectorRef =
    inject(ChangeDetectorRef);


  tickets: Ticket[] = [];

  ticketsFiltrados: Ticket[] = [];

  cargando = true;

  error = '';

  textoBusqueda = '';

  mostrarFormulario = false;

  ticketSeleccionado?: Ticket;


  ngOnInit(): void {
    this.cargarTickets();
  }


  cargarTickets(): void {

    this.cargando = true;

    this.ticketService
      .obtenerTodos()
      .subscribe({

        next: (tickets) => {

          console.log(
            '✅ TICKETS RECIBIDOS:',
            tickets
          );

          this.tickets = tickets;

          this.ticketsFiltrados = tickets;

          this.cargando = false;

          this.changeDetectorRef.detectChanges();

        },

        error: (error) => {

          console.error(
            '❌ ERROR AL CARGAR TICKETS:',
            error
          );

          this.error =
            'No se pudieron cargar los tickets.';

          this.cargando = false;

          this.changeDetectorRef.detectChanges();

        }

      });

  }


  buscarTickets(): void {

    const texto =
      this.textoBusqueda
        .trim()
        .toLowerCase();


    if (!texto) {

      this.ticketsFiltrados =
        this.tickets;

      return;

    }


    this.ticketsFiltrados =
      this.tickets.filter((ticket) => {

        return (

          ticket.titulo
            .toLowerCase()
            .includes(texto)

          ||

          ticket.descripcion
            .toLowerCase()
            .includes(texto)

          ||

          ticket.prioridad
            .toLowerCase()
            .includes(texto)

          ||

          ticket.estado
            .toLowerCase()
            .includes(texto)

          ||

          ticket.equipoId
            .toString()
            .includes(texto)

          ||

          ticket.solicitanteId
            .toString()
            .includes(texto)

        );

      });

  }


  limpiarBusqueda(): void {

    this.textoBusqueda = '';

    this.ticketsFiltrados =
      this.tickets;

  }


  abrirFormulario(ticket?: Ticket): void {

    this.ticketSeleccionado = ticket;

    this.mostrarFormulario = true;

  }


  cerrarFormulario(): void {

    this.mostrarFormulario = false;

    this.ticketSeleccionado = undefined;

  }


  ticketGuardado(): void {

    this.mostrarFormulario = false;

    this.ticketSeleccionado = undefined;

    this.cargarTickets();

  }

}