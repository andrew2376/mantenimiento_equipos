
import { DatePipe } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  OnInit,
  inject
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

import {
  Ticket,
  TicketService
} from '../../../core/services/ticket.service';

import { TicketForm } from '../ticket-form/ticket-form';

interface Usuario {
  id: number;
  nombre: string;
  correo: string;
  rol: 'ADMINISTRADOR' | 'SOLICITANTE' | 'TECNICO';
  activo: boolean;
}

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

  private readonly http =
    inject(HttpClient);

  private readonly usuariosUrl =
    'http://localhost:3000/api/usuarios';


  tickets: Ticket[] = [];

  ticketsFiltrados: Ticket[] = [];

  cargando = true;

  error = '';

  textoBusqueda = '';

  mostrarFormulario = false;

  ticketSeleccionado?: Ticket;


  // ACT-023: asignación de técnicos
  tecnicos: Usuario[] = [];

  tecnicoSeleccionado: {
    [ticketId: number]: number | null;
  } = {};

  asignandoTicketId: number | null = null;

  mensajeAsignacion = '';

  errorAsignacion = '';


  ngOnInit(): void {
    this.cargarTickets();
    this.cargarTecnicos();
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


  // ACT-023: cargar solamente técnicos activos
  cargarTecnicos(): void {

    this.http
      .get<Usuario[]>(this.usuariosUrl)
      .subscribe({

        next: (usuarios) => {

          this.tecnicos = usuarios.filter(
            (usuario) =>
              usuario.rol === 'TECNICO' &&
              usuario.activo === true
          );

          console.log(
            '✅ TÉCNICOS ACTIVOS:',
            this.tecnicos
          );

          this.changeDetectorRef.detectChanges();

        },

        error: (error) => {

          console.error(
            '❌ ERROR AL CARGAR TÉCNICOS:',
            error
          );

          this.errorAsignacion =
            'No se pudieron cargar los técnicos.';

          this.changeDetectorRef.detectChanges();

        }

      });

  }


  // ACT-023: asignar un técnico al ticket
  asignarTecnico(ticket: Ticket): void {

    const tecnicoId =
      this.tecnicoSeleccionado[ticket.id];

    this.mensajeAsignacion = '';
    this.errorAsignacion = '';

    if (!tecnicoId) {

      this.errorAsignacion =
        'Selecciona un técnico antes de asignar.';

      return;

    }

    this.asignandoTicketId = ticket.id;

    this.ticketService
      .asignarTecnico(ticket.id, tecnicoId)
      .subscribe({

        next: (ticketActualizado) => {

          console.log(
            '✅ TÉCNICO ASIGNADO:',
            ticketActualizado
          );

          this.mensajeAsignacion =
            `Técnico asignado al ticket #${ticket.id}.`;

          this.asignandoTicketId = null;

          // Recargar para mostrar el técnico asignado
          this.cargarTickets();

        },

        error: (error) => {

          console.error(
            '❌ ERROR AL ASIGNAR TÉCNICO:',
            error
          );

          this.errorAsignacion =
            error?.error?.mensaje ??
            error?.error?.error ??
            error?.error?.message ??
            'No se pudo asignar el técnico.';

          this.asignandoTicketId = null;

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
