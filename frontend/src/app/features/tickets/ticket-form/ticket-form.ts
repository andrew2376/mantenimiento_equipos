import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  inject,
} from '@angular/core';

import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Ticket, TicketService } from '../../../core/services/ticket.service';

interface Equipo {
  id: number;
  codigoInventario: string;
  nombre: string;
}

interface Usuario {
  id: number;
  nombre: string;
  correo: string;
  rol: string;
}

type EstadoTicket =
  | 'ABIERTO'
  | 'ASIGNADO'
  | 'EN_DIAGNOSTICO'
  | 'EN_MANTENIMIENTO'
  | 'RESUELTO'
  | 'CERRADO'
  | 'CANCELADO';

@Component({
  selector: 'app-ticket-form',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './ticket-form.html',
})
export class TicketForm implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly ticketService = inject(TicketService);

  // Ticket que se va a editar.
  @Input()
  ticketEditar?: Ticket;

  // Eventos del componente.
  @Output()
  cerrar = new EventEmitter<void>();

  @Output()
  guardado = new EventEmitter<void>();

  // Datos para los select.
  equipos: Equipo[] = [];
  usuarios: Usuario[] = [];

  // Estados del formulario.
  cargando = false;
  guardando = false;
  error = '';

  // Campos del formulario.
  titulo = '';
  descripcion = '';

  prioridad: 'BAJA' | 'MEDIA' | 'ALTA' | 'CRITICA' = 'MEDIA';

  estado: EstadoTicket = 'ABIERTO';

  equipoId: number | null = null;
  solicitanteId: number | null = null;

  /**
   * Define las transiciones permitidas por ACT-022.
   *
   * Se conserva el estado actual en el formulario para permitir
   * actualizar otros datos sin necesidad de cambiar el estado.
   */
  private readonly transicionesPermitidas: Record<
    EstadoTicket,
    EstadoTicket[]
  > = {
    ABIERTO: ['ASIGNADO', 'CANCELADO'],
    ASIGNADO: ['EN_DIAGNOSTICO', 'CANCELADO'],
    EN_DIAGNOSTICO: [
      'ASIGNADO',
      'EN_MANTENIMIENTO',
      'RESUELTO',
      'CANCELADO',
    ],
    EN_MANTENIMIENTO: [
      'EN_DIAGNOSTICO',
      'RESUELTO',
      'CANCELADO',
    ],
    RESUELTO: ['EN_DIAGNOSTICO', 'CERRADO'],
    CERRADO: [],
    CANCELADO: [],
  };

  /**
   * Estados disponibles en el selector.
   *
   * Al editar, muestra el estado actual y los estados a los que
   * se permite cambiar según las reglas de ACT-022.
   */
  get estadosDisponibles(): EstadoTicket[] {
    if (!this.ticketEditar) {
      return ['ABIERTO'];
    }

    const estadoActual = this.ticketEditar.estado as EstadoTicket;
    const siguientesEstados =
      this.transicionesPermitidas[estadoActual] ?? [];

    return [estadoActual, ...siguientesEstados];
  }

  /**
   * Indica si el ticket tiene otros estados disponibles.
   */
  get sinTransicionesDisponibles(): boolean {
    if (!this.ticketEditar) {
      return false;
    }

    const estadoActual = this.ticketEditar.estado as EstadoTicket;

    return this.transicionesPermitidas[estadoActual]?.length === 0;
  }

  // Inicialización.
  ngOnInit(): void {
    this.cargarEquipos();
    this.cargarUsuarios();
    this.cargarDatosEditar();
  }

  /**
   * Carga los datos del ticket cuando se abre el formulario
   * en modo edición.
   */
  cargarDatosEditar(): void {
    if (!this.ticketEditar) {
      console.log('🆕 CREANDO NUEVO TICKET');
      return;
    }

    console.log('✏️ TICKET RECIBIDO PARA EDITAR:', this.ticketEditar);

    this.titulo = this.ticketEditar.titulo;
    this.descripcion = this.ticketEditar.descripcion;
    this.prioridad = this.ticketEditar.prioridad;
    this.estado = this.ticketEditar.estado;
    this.equipoId = this.ticketEditar.equipoId;
    this.solicitanteId = this.ticketEditar.solicitanteId;
  }

  /**
   * Carga los equipos disponibles.
   */
  cargarEquipos(): void {
    this.http.get<Equipo[]>('http://localhost:3000/api/equipos').subscribe({
      next: (equipos) => {
        console.log('✅ EQUIPOS PARA TICKET:', equipos);
        this.equipos = equipos;
      },
      error: (error) => {
        console.error('❌ ERROR CARGANDO EQUIPOS:', error);
        this.error = 'No se pudieron cargar los equipos.';
      },
    });
  }

  /**
   * Carga los usuarios disponibles.
   */
  cargarUsuarios(): void {
    this.http.get<Usuario[]>('http://localhost:3000/api/usuarios').subscribe({
      next: (usuarios) => {
        console.log('✅ USUARIOS PARA TICKET:', usuarios);
        this.usuarios = usuarios;
      },
      error: (error) => {
        console.error('❌ ERROR CARGANDO USUARIOS:', error);
        this.error = 'No se pudieron cargar los usuarios.';
      },
    });
  }

  /**
   * Valida que el cambio de estado esté permitido.
   */
  private validarTransicionEstado(): boolean {
    if (!this.ticketEditar) {
      return true;
    }

    const estadoActual = this.ticketEditar.estado as EstadoTicket;

    // Si no se cambia el estado, se permite actualizar los demás datos.
    if (this.estado === estadoActual) {
      return true;
    }

    const siguientesEstados =
      this.transicionesPermitidas[estadoActual] ?? [];

    if (!siguientesEstados.includes(this.estado)) {
      this.error =
        `No se permite cambiar el estado de ${estadoActual} a ${this.estado}.`;

      return false;
    }

    return true;
  }

  /**
   * Guarda un ticket nuevo o actualiza uno existente.
   */
  guardar(): void {
    this.error = '';

    // Validaciones generales.
    if (!this.titulo.trim()) {
      this.error = 'El título es obligatorio.';
      return;
    }

    if (!this.descripcion.trim()) {
      this.error = 'La descripción es obligatoria.';
      return;
    }

    if (this.equipoId === null) {
      this.error = 'Debes seleccionar un equipo.';
      return;
    }

    if (this.solicitanteId === null) {
      this.error = 'Debes seleccionar un solicitante.';
      return;
    }

    // Validación ACT-022: transiciones de estado.
    if (!this.validarTransicionEstado()) {
      return;
    }

    this.guardando = true;

    // Editar un ticket existente.
    if (this.ticketEditar) {
      console.log('✏️ ACTUALIZANDO TICKET:', this.ticketEditar.id);

      this.ticketService
        .actualizar(this.ticketEditar.id, {
          titulo: this.titulo.trim(),
          descripcion: this.descripcion.trim(),
          prioridad: this.prioridad,
          estado: this.estado,
          equipoId: this.equipoId,
          solicitanteId: this.solicitanteId,
        })
        .subscribe({
          next: (ticket) => {
            console.log('✅ TICKET ACTUALIZADO:', ticket);

            this.guardando = false;
            this.guardado.emit();
          },
          error: (error) => {
            console.error('❌ ERROR ACTUALIZANDO TICKET:', error);

            this.guardando = false;

            this.error =
              error?.error?.mensaje ??
              error?.error?.error ??
              error?.error?.message ??
              'No se pudo actualizar el ticket.';
          },
        });

      return;
    }

    // Crear un ticket nuevo.
    console.log('🆕 CREANDO TICKET');

    this.ticketService
      .crear({
        titulo: this.titulo.trim(),
        descripcion: this.descripcion.trim(),
        prioridad: this.prioridad,
        equipoId: this.equipoId,
        solicitanteId: this.solicitanteId,
      })
      .subscribe({
        next: (ticket) => {
          console.log('✅ TICKET CREADO:', ticket);

          this.guardando = false;
          this.guardado.emit();
        },
        error: (error) => {
          console.error('❌ ERROR CREANDO TICKET:', error);

          this.guardando = false;

          this.error =
            error?.error?.mensaje ??
            error?.error?.error ??
            error?.error?.message ??
            'No se pudo guardar el ticket.';
        },
      });
  }

  /**
   * Cancela y cierra el formulario.
   */
  cancelar(): void {
    this.cerrar.emit();
  }
}