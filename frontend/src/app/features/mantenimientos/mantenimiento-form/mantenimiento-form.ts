import { CurrencyPipe } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Mantenimiento, MantenimientoService } from '../../../core/services/mantenimiento.service';
import { Repuesto, RepuestoUsado, RepuestoService } from '../../../core/services/repuesto.service';

interface Equipo {
  id: number;
  codigoInventario: string;
  nombre: string;
}

interface Ticket {
  id: number;
  titulo: string;
  equipoId: number;
  estado: string;
}

interface Usuario {
  id: number;
  nombre: string;
  rol: string;
}

@Component({
  selector: 'app-mantenimiento-form',
  standalone: true,
  imports: [FormsModule, CurrencyPipe],
  templateUrl: './mantenimiento-form.html',
})
export class MantenimientoForm implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly mantenimientoService = inject(MantenimientoService);
  private readonly repuestoService = inject(RepuestoService);

  @Input() mantenimientoEditar?: Mantenimiento;
  @Input() ticketIdInicial?: number;

  @Output() cerrar = new EventEmitter<void>();
  @Output() guardado = new EventEmitter<void>();

  equipos: Equipo[] = [];
  tickets: Ticket[] = [];
  usuarios: Usuario[] = [];
  catalogoRepuestos: Repuesto[] = [];
  repuestosUsados: RepuestoUsado[] = [];

  cargando = false;
  guardando = false;
  error = '';
  mensajeRepuesto = '';

  descripcion = '';
  equipoId: number | null = null;
  ticketId: number | null = null;
  tipo: 'PREVENTIVO' | 'CORRECTIVO' = 'CORRECTIVO';
  estado: 'PENDIENTE' | 'EN_PROCESO' | 'FINALIZADO' | 'CANCELADO' = 'PENDIENTE';
  tecnico = '';
  diagnostico = '';

  // Formulario rápido para agregar repuesto en la intervención
  nuevoRepuestoId: number | null = null;
  nuevaCantidad = 1;

  ngOnInit(): void {
    this.cargarEquipos();
    this.cargarTickets();
    this.cargarUsuarios();
    this.cargarCatalogoRepuestos();
    this.cargarDatosEdicion();
  }

  cargarDatosEdicion(): void {
    if (this.mantenimientoEditar) {
      this.descripcion = this.mantenimientoEditar.descripcion;
      this.equipoId = this.mantenimientoEditar.equipoId;
      this.ticketId = this.mantenimientoEditar.ticketId ?? null;
      this.tipo = this.mantenimientoEditar.tipo;
      this.estado = this.mantenimientoEditar.estado;
      this.tecnico = this.mantenimientoEditar.tecnico ?? '';
      this.diagnostico = this.mantenimientoEditar.diagnostico ?? '';
      this.cargarRepuestosUsados();
    } else if (this.ticketIdInicial) {
      this.ticketId = this.ticketIdInicial;
    }
  }

  cargarEquipos(): void {
    this.http.get<Equipo[]>('http://localhost:3000/api/equipos').subscribe({
      next: (equipos) => {
        this.equipos = equipos;
      },
      error: () => {
        this.error = 'No se pudieron cargar los equipos.';
      }
    });
  }

  cargarTickets(): void {
    this.http.get<Ticket[]>('http://localhost:3000/api/tickets').subscribe({
      next: (tickets) => {
        this.tickets = tickets;
        if (this.ticketId && !this.equipoId) {
          const t = tickets.find(x => x.id === this.ticketId);
          if (t) {
            this.equipoId = t.equipoId;
          }
        }
      },
      error: () => {
        this.error = 'No se pudieron cargar los tickets.';
      }
    });
  }

  cargarUsuarios(): void {
    this.http.get<Usuario[]>('http://localhost:3000/api/usuarios').subscribe({
      next: (usuarios) => {
        this.usuarios = usuarios;
      }
    });
  }

  cargarCatalogoRepuestos(): void {
    this.repuestoService.obtenerTodos().subscribe({
      next: (repuestos) => {
        this.catalogoRepuestos = repuestos;
      }
    });
  }

  cargarRepuestosUsados(): void {
    if (!this.mantenimientoEditar) return;
    this.repuestoService.obtenerPorMantenimiento(this.mantenimientoEditar.id).subscribe({
      next: (usados) => {
        this.repuestosUsados = usados;
      }
    });
  }

  agregarRepuestoIntervencion(): void {
    if (!this.mantenimientoEditar || !this.nuevoRepuestoId || this.nuevaCantidad <= 0) return;

    this.mensajeRepuesto = '';
    this.repuestoService.asignarAMantenimiento(this.mantenimientoEditar.id, {
      repuestoId: Number(this.nuevoRepuestoId),
      cantidad: Number(this.nuevaCantidad)
    }).subscribe({
      next: () => {
        this.nuevoRepuestoId = null;
        this.nuevaCantidad = 1;
        this.cargarRepuestosUsados();
        this.cargarCatalogoRepuestos();
        this.mensajeRepuesto = 'Repuesto asignado correctamente.';
      },
      error: (err) => {
        this.error = err?.error?.error ?? 'No se pudo asignar el repuesto (comprueba el stock).';
      }
    });
  }

  get costoTotalRepuestos(): number {
    return this.repuestosUsados.reduce((sum, r) => sum + (Number(r.costoUnitario) * r.cantidad), 0);
  }

  onTicketChange(): void {
    if (this.ticketId) {
      const ticket = this.tickets.find(t => Number(t.id) === Number(this.ticketId));
      if (ticket) {
        this.equipoId = ticket.equipoId;
        if (!this.descripcion) {
          this.descripcion = `Atención al Ticket #${ticket.id}: ${ticket.titulo}`;
        }
      }
    }
  }

  guardar(): void {
    this.error = '';

    if (!this.descripcion.trim()) {
      this.error = 'La descripción es obligatoria.';
      return;
    }

    if (!this.equipoId) {
      this.error = 'Debes seleccionar un equipo.';
      return;
    }

    this.guardando = true;

    if (this.mantenimientoEditar) {
      this.mantenimientoService.actualizar(this.mantenimientoEditar.id, {
        estado: this.estado,
        diagnostico: this.diagnostico.trim() || undefined,
        tecnico: this.tecnico.trim() || undefined
      }).subscribe({
        next: () => {
          this.guardando = false;
          this.guardado.emit();
        },
        error: (err) => {
          this.guardando = false;
          this.error = err?.error?.error ?? 'Error al actualizar el mantenimiento.';
        }
      });
      return;
    }

    this.mantenimientoService.crear({
      descripcion: this.descripcion.trim(),
      equipoId: Number(this.equipoId),
      ticketId: this.ticketId ? Number(this.ticketId) : null,
      tipo: this.tipo,
      estado: this.estado,
      tecnico: this.tecnico.trim() || null,
      diagnostico: this.diagnostico.trim() || null
    }).subscribe({
      next: () => {
        this.guardando = false;
        this.guardado.emit();
      },
      error: (err) => {
        this.guardando = false;
        this.error = err?.error?.error ?? 'Error al registrar el mantenimiento.';
      }
    });
  }

  cancelar(): void {
    this.cerrar.emit();
  }
}
