import {
  Component,
  EventEmitter,
  Output,
  Input,
  OnInit,
  ChangeDetectorRef,
  inject
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  Mantenimiento,
  MantenimientoService,
  TipoMantenimiento,
  EstadoMantenimiento
} from '../../../core/services/mantenimiento.service';
import { Equipo, EquipoService } from '../../../core/services/equipo.service';
import { Ticket, TicketService } from '../../../core/services/ticket.service';

@Component({
  selector: 'app-mantenimiento-form',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './mantenimiento-form.html'
})
export class MantenimientoForm implements OnInit {
  private readonly mantenimientoService = inject(MantenimientoService);
  private readonly equipoService = inject(EquipoService);
  private readonly ticketService = inject(TicketService);
  private readonly changeDetectorRef = inject(ChangeDetectorRef);

  @Input() mantenimientoEditar?: Mantenimiento;
  @Input() equipos: Equipo[] = [];
  @Input() tickets: Ticket[] = [];

  @Output() cerrar = new EventEmitter<void>();
  @Output() guardado = new EventEmitter<void>();

  // Campos del formulario
  equipoId: number | null = null;
  ticketId: number | null = null;
  tipo: TipoMantenimiento = 'CORRECTIVO';
  estado: EstadoMantenimiento = 'PENDIENTE';
  tecnico = '';
  descripcion = '';
  diagnostico = '';

  guardando = false;
  error = '';

  ngOnInit(): void {
    if (!this.equipos || this.equipos.length === 0) {
      this.cargarEquipos();
    }
    if (!this.tickets || this.tickets.length === 0) {
      this.cargarTickets();
    }

    if (this.mantenimientoEditar) {
      this.equipoId = this.mantenimientoEditar.equipoId;
      this.ticketId = this.mantenimientoEditar.ticketId ?? null;
      this.tipo = this.mantenimientoEditar.tipo;
      this.estado = this.mantenimientoEditar.estado;
      this.tecnico = this.mantenimientoEditar.tecnico ?? '';
      this.descripcion = this.mantenimientoEditar.descripcion;
      this.diagnostico = this.mantenimientoEditar.diagnostico ?? '';
    } else {
      this.equipoId = null;
      this.ticketId = null;
    }

    this.changeDetectorRef.detectChanges();
  }

  cargarEquipos(): void {
    this.equipoService.obtenerTodos().subscribe({
      next: (data) => {
        this.equipos = data;
        this.changeDetectorRef.detectChanges();
      },
      error: () => {
        console.error('Error al cargar equipos para el formulario de mantenimiento');
      }
    });
  }

  cargarTickets(): void {
    this.ticketService.obtenerTodos().subscribe({
      next: (data) => {
        this.tickets = data;
        this.changeDetectorRef.detectChanges();
      },
      error: () => {
        console.error('Error al cargar tickets para el formulario de mantenimiento');
      }
    });
  }

  guardarMantenimiento(): void {
    this.error = '';

    if (!this.equipoId) {
      this.error = 'Debes seleccionar un equipo.';
      this.changeDetectorRef.detectChanges();
      return;
    }

    if (!this.descripcion.trim() || this.descripcion.trim().length < 5) {
      this.error = 'La descripción es obligatoria (mínimo 5 caracteres).';
      this.changeDetectorRef.detectChanges();
      return;
    }

    this.guardando = true;
    this.changeDetectorRef.detectChanges();

    const payload = {
      equipoId: Number(this.equipoId),
      ticketId: this.ticketId ? Number(this.ticketId) : null,
      tipo: this.tipo,
      estado: this.estado,
      tecnico: this.tecnico.trim() || null,
      descripcion: this.descripcion.trim(),
      diagnostico: this.diagnostico.trim() || null
    };

    if (this.mantenimientoEditar) {
      this.mantenimientoService
        .actualizarEstado(this.mantenimientoEditar.id, {
          equipoId: Number(this.equipoId),
          ticketId: this.ticketId ? Number(this.ticketId) : null,
          tipo: this.tipo,
          estado: this.estado,
          tecnico: this.tecnico.trim() || null,
          descripcion: this.descripcion.trim(),
          diagnostico: this.diagnostico.trim() || null
        })
        .subscribe({
          next: () => {
            this.guardando = false;
            this.guardado.emit();
            this.cerrar.emit();
          },
          error: (err) => {
            this.guardando = false;
            this.error = err.error?.error || 'Error al actualizar el mantenimiento.';
            this.changeDetectorRef.detectChanges();
          }
        });
    } else {
      this.mantenimientoService.crear(payload).subscribe({
        next: () => {
          this.guardando = false;
          this.guardado.emit();
          this.cerrar.emit();
        },
        error: (err) => {
          this.guardando = false;
          this.error = err.error?.error || 'Error al registrar el mantenimiento.';
          this.changeDetectorRef.detectChanges();
        }
      });
    }
  }

  cerrarFormulario(): void {
    this.cerrar.emit();
  }
}
