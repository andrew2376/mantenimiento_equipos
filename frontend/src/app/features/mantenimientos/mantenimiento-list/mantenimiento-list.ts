import { DatePipe } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  OnInit,
  inject
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  Mantenimiento,
  MantenimientoService,
  EstadoMantenimiento
} from '../../../core/services/mantenimiento.service';
import { Equipo, EquipoService } from '../../../core/services/equipo.service';
import { Ticket, TicketService } from '../../../core/services/ticket.service';
import { MantenimientoForm } from '../mantenimiento-form/mantenimiento-form';

@Component({
  selector: 'app-mantenimiento-list',
  standalone: true,
  imports: [
    FormsModule,
    DatePipe,
    MantenimientoForm
  ],
  templateUrl: './mantenimiento-list.html'
})
export class MantenimientoList implements OnInit {
  private readonly mantenimientoService = inject(MantenimientoService);
  private readonly equipoService = inject(EquipoService);
  private readonly ticketService = inject(TicketService);
  private readonly changeDetectorRef = inject(ChangeDetectorRef);

  mantenimientos: Mantenimiento[] = [];
  mantenimientosFiltrados: Mantenimiento[] = [];

  equipos: Equipo[] = [];
  tickets: Ticket[] = [];
  equiposMap = new Map<number, Equipo>();
  ticketsMap = new Map<number, Ticket>();

  cargando = true;
  error = '';
  textoBusqueda = '';
  filtroEstado: string = 'TODOS';

  mostrarFormulario = false;
  mantenimientoSeleccionado?: Mantenimiento;

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos(): void {
    this.cargando = true;
    this.error = '';

    // Cargar equipos primero para resolver nombres y códigos
    this.equipoService.obtenerTodos().subscribe({
      next: (equipos) => {
        this.equipos = equipos;
        this.equiposMap.clear();
        equipos.forEach((e) => this.equiposMap.set(e.id, e));

        // Cargar tickets para resolver títulos
        this.ticketService.obtenerTodos().subscribe({
          next: (tickets) => {
            this.tickets = tickets;
            this.ticketsMap.clear();
            tickets.forEach((t) => this.ticketsMap.set(t.id, t));

            // Cargar mantenimientos
            this.cargarMantenimientos();
          },
          error: () => {
            this.cargarMantenimientos();
          }
        });
      },
      error: () => {
        this.cargarMantenimientos();
      }
    });
  }

  cargarMantenimientos(): void {
    this.mantenimientoService.obtenerTodos().subscribe({
      next: (data) => {
        this.mantenimientos = data;
        this.aplicarFiltros();
        this.cargando = false;
        this.changeDetectorRef.detectChanges();
      },
      error: (err) => {
        console.error('Error al cargar mantenimientos:', err);
        this.error = 'No se pudieron cargar los mantenimientos.';
        this.cargando = false;
        this.changeDetectorRef.detectChanges();
      }
    });
  }

  aplicarFiltros(): void {
    const texto = this.textoBusqueda.trim().toLowerCase();

    this.mantenimientosFiltrados = this.mantenimientos.filter((m) => {
      // Filtro de estado
      const coincideEstado =
        this.filtroEstado === 'TODOS' || m.estado === this.filtroEstado;

      if (!coincideEstado) {
        return false;
      }

      if (!texto) {
        return true;
      }

      // Buscar por descripción, técnico, diagnóstico, código equipo, ticket
      const equipo = this.equiposMap.get(m.equipoId);
      const codigoEquipo = equipo?.codigoInventario?.toLowerCase() ?? '';
      const nombreEquipo = equipo?.nombre?.toLowerCase() ?? '';
      const ticketIdStr = m.ticketId ? `#${m.ticketId}` : '';

      return (
        m.descripcion.toLowerCase().includes(texto) ||
        (m.tecnico ?? '').toLowerCase().includes(texto) ||
        (m.diagnostico ?? '').toLowerCase().includes(texto) ||
        m.tipo.toLowerCase().includes(texto) ||
        codigoEquipo.includes(texto) ||
        nombreEquipo.includes(texto) ||
        ticketIdStr.includes(texto)
      );
    });
  }

  cambiarFiltroEstado(nuevoEstado: string): void {
    this.filtroEstado = nuevoEstado;
    this.aplicarFiltros();
  }

  limpiarBusqueda(): void {
    this.textoBusqueda = '';
    this.aplicarFiltros();
  }

  abrirFormulario(): void {
    this.mantenimientoSeleccionado = undefined;
    this.mostrarFormulario = true;
  }

  abrirEditar(m: Mantenimiento): void {
    this.mantenimientoSeleccionado = m;
    this.mostrarFormulario = true;
  }

  cerrarFormulario(): void {
    this.mostrarFormulario = false;
    this.mantenimientoSeleccionado = undefined;
  }

  onGuardado(): void {
    this.cargarDatos();
  }

  cambiarEstadoRapido(m: Mantenimiento, nuevoEstado: EstadoMantenimiento): void {
    this.mantenimientoService
      .actualizarEstado(m.id, { estado: nuevoEstado })
      .subscribe({
        next: () => {
          this.cargarDatos();
        },
        error: (err) => {
          alert(err.error?.error || 'No se pudo actualizar el estado.');
        }
      });
  }

  obtenerNombreEquipo(equipoId: number): string {
    const eq = this.equiposMap.get(equipoId);
    return eq ? `[${eq.codigoInventario}] ${eq.nombre}` : `Equipo #${equipoId}`;
  }

  obtenerTicket(ticketId?: number | null): string {
    if (!ticketId) return 'Sin ticket';
    const tk = this.ticketsMap.get(ticketId);
    return tk ? `#${tk.id} - ${tk.titulo}` : `#${ticketId}`;
  }
}
