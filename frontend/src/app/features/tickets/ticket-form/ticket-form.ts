import { Component, EventEmitter, Input, OnInit, Output, inject } from '@angular/core';

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

@Component({
  selector: 'app-ticket-form',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './ticket-form.html',
})
export class TicketForm implements OnInit {
  private readonly http = inject(HttpClient);

  private readonly ticketService = inject(TicketService);

  /*
   * ==========================================
   * TICKET QUE SE VA A EDITAR
   * ==========================================
   */

  @Input()
  ticketEditar?: Ticket;

  /*
   * ==========================================
   * EVENTOS
   * ==========================================
   */

  @Output()
  cerrar = new EventEmitter<void>();

  @Output()
  guardado = new EventEmitter<void>();

  /*
   * ==========================================
   * DATOS PARA LOS SELECT
   * ==========================================
   */

  equipos: Equipo[] = [];

  usuarios: Usuario[] = [];

  /*
   * ==========================================
   * ESTADOS
   * ==========================================
   */

  cargando = false;

  guardando = false;

  error = '';

  /*
   * ==========================================
   * CAMPOS DEL FORMULARIO
   * ==========================================
   */

  titulo = '';

  descripcion = '';

  prioridad: 'BAJA' | 'MEDIA' | 'ALTA' | 'CRITICA' = 'MEDIA';

  estado:
    | 'ABIERTO'
    | 'ASIGNADO'
    | 'EN_DIAGNOSTICO'
    | 'EN_MANTENIMIENTO'
    | 'RESUELTO'
    | 'CERRADO'
    | 'CANCELADO' = 'ABIERTO';

  equipoId: number | null = null;

  solicitanteId: number | null = null;

  /*
   * ==========================================
   * INICIO
   * ==========================================
   */

  ngOnInit(): void {
    this.cargarEquipos();

    this.cargarUsuarios();

    this.cargarDatosEditar();
  }

  /*
   * ==========================================
   * CARGAR DATOS DEL TICKET PARA EDITAR
   * ==========================================
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

  /*
   * ==========================================
   * CARGAR EQUIPOS
   * ==========================================
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

  /*
   * ==========================================
   * CARGAR USUARIOS
   * ==========================================
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

  /*
   * ==========================================
   * GUARDAR
   * ==========================================
   */

  guardar(): void {
    this.error = '';

    /*
     * ========================================
     * VALIDACIONES
     * ========================================
     */

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

    /*
     * ==========================================
     * EDITAR TICKET
     * ==========================================
     */

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

            this.error = error?.error?.error ?? 'No se pudo actualizar el ticket.';
          },
        });

      return;
    }

    /*
     * ==========================================
     * CREAR NUEVO TICKET
     * ==========================================
     */

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

          this.error = error?.error?.error ?? 'No se pudo guardar el ticket.';
        },
      });
  }

  /*
   * ==========================================
   * CANCELAR / CERRAR MODAL
   * ==========================================
   */

  cancelar(): void {
    this.cerrar.emit();
  }
}
