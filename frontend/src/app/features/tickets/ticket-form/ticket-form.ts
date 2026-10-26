
import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  inject
} from '@angular/core';

import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import {
  Ticket,
  TicketService
} from '../../../core/services/ticket.service';

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

  // ==========================================
  // MODAL DE ALERTA PARA TICKETS CERRADOS
  // ==========================================

  mostrarAlertaEstadoCerrado = false;

  mensajeAlertaEstadoCerrado =
    'Una vez que un ticket se cierra, no se puede volver a abrir ni modificar su estado.';

  // ==========================================
  // CAMPOS DEL FORMULARIO
  // ==========================================

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

    console.log(
      '✏️ TICKET RECIBIDO PARA EDITAR:',
      this.ticketEditar
    );

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
    this.http
      .get<Equipo[]>('http://localhost:3000/api/equipos')
      .subscribe({
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

  // ==========================================
  // CARGAR USUARIOS
  // ==========================================

  cargarUsuarios(): void {
    this.http
      .get<Usuario[]>('http://localhost:3000/api/usuarios')
      .subscribe({
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

  // ==========================================
  // MOSTRAR ALERTA DE TICKET CERRADO
  // ==========================================

  private mostrarAlertaCerrado(): void {
    this.mensajeAlertaEstadoCerrado =
      'Este ticket ya está cerrado definitivamente. No es posible volver a abrirlo ni cambiar su estado.';

    this.mostrarAlertaEstadoCerrado = true;
  }

  // ==========================================
  // CERRAR ALERTA DE TICKET CERRADO
  // ==========================================

  cerrarAlertaEstadoCerrado(): void {
    this.mostrarAlertaEstadoCerrado = false;
  }

  // ==========================================
  // GUARDAR
  // ==========================================

  guardar(): void {
    this.error = '';

    // ========================================
    // VALIDAR SI EL TICKET YA ESTÁ CERRADO
    // ========================================

    if (
      this.ticketEditar &&
      this.ticketEditar.estado === 'CERRADO' &&
      this.estado !== 'CERRADO'
    ) {
      this.mostrarAlertaCerrado();
      return;
    }

    // ========================================
    // VALIDACIONES DEL FORMULARIO
    // ========================================

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

    this.guardando = true;

    // ========================================
    // ACTUALIZAR TICKET EXISTENTE
    // ========================================

    if (this.ticketEditar) {
      console.log(
        '✏️ ACTUALIZANDO TICKET:',
        this.ticketEditar.id
      );

      const datosActualizacion = {
        titulo: this.titulo.trim(),
        descripcion: this.descripcion.trim(),
        prioridad: this.prioridad,
        estado: this.estado,
        equipoId: this.equipoId,
        solicitanteId: this.solicitanteId,
      };

      console.log(
        '📤 DATOS ENVIADOS PARA ACTUALIZAR:',
        datosActualizacion
      );

      this.ticketService
        .actualizar(
          this.ticketEditar.id,
          datosActualizacion
        )
        .subscribe({
          next: (ticket) => {
            console.log('✅ TICKET ACTUALIZADO:', ticket);

            this.guardando = false;
            this.guardado.emit();
          },
          error: (error) => {
            console.error(
              '❌ ERROR ACTUALIZANDO TICKET:',
              error
            );

            console.error(
              '❌ RESPUESTA DEL BACKEND:',
              error?.error
            );

            this.guardando = false;

            this.error =
              error?.error?.error ??
              error?.error?.mensaje ??
              error?.error?.message ??
              'No se pudo actualizar el ticket.';
          },
        });

      return;
    }

    // ========================================
    // CREAR NUEVO TICKET
    // ========================================

    console.log('🆕 CREANDO TICKET');

    const nuevoTicket = {
      titulo: this.titulo.trim(),
      descripcion: this.descripcion.trim(),
      prioridad: this.prioridad,
      equipoId: this.equipoId,
      solicitanteId: this.solicitanteId,
    };

    console.log(
      '📤 DATOS ENVIADOS PARA CREAR:',
      nuevoTicket
    );

    this.ticketService
      .crear(nuevoTicket)
      .subscribe({
        next: (ticket) => {
          console.log('✅ TICKET CREADO:', ticket);

          this.guardando = false;
          this.guardado.emit();
        },
        error: (error) => {
          console.error(
            '❌ ERROR CREANDO TICKET:',
            error
          );

          console.error(
            '❌ RESPUESTA DEL BACKEND:',
            error?.error
          );

          this.guardando = false;

          this.error =
            error?.error?.error ??
            error?.error?.mensaje ??
            error?.error?.message ??
            'No se pudo guardar el ticket.';
        },
      });
  }

  // ==========================================
  // CANCELAR
  // ==========================================

  cancelar(): void {
    this.cerrar.emit();
  }
}