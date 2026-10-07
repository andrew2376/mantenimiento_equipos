import {
  Component,
  EventEmitter,
  Output,
  Input,
  OnInit,
  ChangeDetectorRef,
  inject
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import {
  Mantenimiento,
  MantenimientoService,
  TipoMantenimiento,
  EstadoMantenimiento
} from '../../../core/services/mantenimiento.service';
import { Equipo, EquipoService } from '../../../core/services/equipo.service';
import { Ticket, TicketService } from '../../../core/services/ticket.service';
import {
  Repuesto,
  RepuestoService,
  MantenimientoRepuesto
} from '../../../core/services/repuesto.service';

export interface FilaRepuestoForm {
  repuestoId: number | null;
  cantidad: number;
  costoUnitario: number;
}

@Component({
  selector: 'app-mantenimiento-form',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './mantenimiento-form.html',
  styleUrl: './mantenimiento-form.css'
})
export class MantenimientoForm implements OnInit {
  private readonly mantenimientoService = inject(MantenimientoService);
  private readonly equipoService = inject(EquipoService);
  private readonly ticketService = inject(TicketService);
  private readonly repuestoService = inject(RepuestoService);
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

  // Repuestos
  repuestosCatalogo: Repuesto[] = [];
  repuestosGuardados: MantenimientoRepuesto[] = [];
  repuestosSeleccionados: FilaRepuestoForm[] = [];

  // Edición inline de repuestos ya guardados
  repuestoEnEdicionId: number | null = null;
  repuestoIdEdicion: number | null = null;
  cantidadEdicion = 1;
  guardandoEdicion = false;

  guardando = false;
  error = '';

  ngOnInit(): void {
    if (!this.equipos || this.equipos.length === 0) {
      this.cargarEquipos();
    }
    if (!this.tickets || this.tickets.length === 0) {
      this.cargarTickets();
    }

    this.cargarRepuestosCatalogo();

    if (this.mantenimientoEditar) {
      this.equipoId = this.mantenimientoEditar.equipoId;
      this.ticketId = this.mantenimientoEditar.ticketId ?? null;
      this.tipo = this.mantenimientoEditar.tipo;
      this.estado = this.mantenimientoEditar.estado;
      this.tecnico = this.mantenimientoEditar.tecnico ?? '';
      this.descripcion = this.mantenimientoEditar.descripcion;
      this.diagnostico = this.mantenimientoEditar.diagnostico ?? '';

      this.cargarRepuestosMantenimiento(this.mantenimientoEditar.id);
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

  cargarRepuestosCatalogo(): void {
    this.repuestoService.obtenerTodos().subscribe({
      next: (data) => {
        this.repuestosCatalogo = data;
        this.changeDetectorRef.detectChanges();
      },
      error: (err) => {
        console.error('Error al cargar catálogo de repuestos', err);
      }
    });
  }

  cargarRepuestosMantenimiento(mantenimientoId: number): void {
    this.repuestoService.obtenerPorMantenimiento(mantenimientoId).subscribe({
      next: (data) => {
        this.repuestosGuardados = data;
        this.changeDetectorRef.detectChanges();
      },
      error: (err) => {
        console.error('Error al cargar repuestos del mantenimiento', err);
      }
    });
  }

  agregarRepuestoFila(): void {
    this.repuestosSeleccionados.push({
      repuestoId: null,
      cantidad: 1,
      costoUnitario: 0
    });
    this.changeDetectorRef.detectChanges();
  }

  eliminarRepuestoFila(index: number): void {
    this.repuestosSeleccionados.splice(index, 1);
    this.changeDetectorRef.detectChanges();
  }

  obtenerRepuesto(id: number | null): Repuesto | undefined {
    if (!id) return undefined;
    return this.repuestosCatalogo.find((r) => r.id === Number(id));
  }

  obtenerStockDisponible(id: number | null): number {
    const rep = this.obtenerRepuesto(id);
    return rep ? rep.stock : 0;
  }

  esCantidadExcedida(fila: FilaRepuestoForm): boolean {
    if (!fila.repuestoId) return false;
    const stock = this.obtenerStockDisponible(fila.repuestoId);
    return Number(fila.cantidad) > stock;
  }

  hayErroresDeStock(): boolean {
    return this.repuestosSeleccionados.some((f) => this.esCantidadExcedida(f));
  }

  prevenirTeclasNegativas(event: KeyboardEvent): void {
    if (['-', '+', 'e', 'E', '.', ','].includes(event.key)) {
      event.preventDefault();
    }
  }

  validarCantidadFila(fila: FilaRepuestoForm): void {
    if (fila.cantidad === null || fila.cantidad === undefined || isNaN(fila.cantidad) || fila.cantidad < 1) {
      fila.cantidad = 1;
    } else {
      fila.cantidad = Math.floor(Math.abs(Number(fila.cantidad)));
    }
    this.changeDetectorRef.detectChanges();
  }

  alSeleccionarRepuesto(index: number): void {
    const fila = this.repuestosSeleccionados[index];
    if (fila && fila.repuestoId) {
      const rep = this.obtenerRepuesto(fila.repuestoId);
      if (rep) {
        fila.costoUnitario = Number(rep.costoUnitario);
        if (rep.stock > 0 && fila.cantidad > rep.stock) {
          fila.cantidad = rep.stock;
        }
      }
    }
    this.changeDetectorRef.detectChanges();
  }

  eliminarRepuestoGuardado(id: number): void {
    this.repuestoService.eliminarDeMantenimiento(id).subscribe({
      next: () => {
        if (this.mantenimientoEditar) {
          this.cargarRepuestosMantenimiento(this.mantenimientoEditar.id);
        }
      },
      error: (err) => {
        console.error('Error al eliminar repuesto del mantenimiento', err);
      }
    });
  }

  iniciarEdicionRepuesto(rg: MantenimientoRepuesto): void {
    this.repuestoEnEdicionId = rg.id;
    this.repuestoIdEdicion = rg.repuestoId;
    this.cantidadEdicion = rg.cantidad;
    this.changeDetectorRef.detectChanges();
  }

  cancelarEdicionRepuesto(): void {
    this.repuestoEnEdicionId = null;
    this.repuestoIdEdicion = null;
    this.cantidadEdicion = 1;
    this.changeDetectorRef.detectChanges();
  }

  obtenerCostoUnitarioEdicion(): number {
    if (!this.repuestoIdEdicion) return 0;
    const rep = this.obtenerRepuesto(this.repuestoIdEdicion);
    return rep ? Number(rep.costoUnitario) : 0;
  }

  validarCantidadEdicion(): void {
    if (this.cantidadEdicion === null || this.cantidadEdicion === undefined || isNaN(this.cantidadEdicion) || this.cantidadEdicion < 1) {
      this.cantidadEdicion = 1;
    } else {
      this.cantidadEdicion = Math.floor(Math.abs(Number(this.cantidadEdicion)));
    }
    this.changeDetectorRef.detectChanges();
  }

  async guardarEdicionRepuesto(rg: MantenimientoRepuesto): Promise<void> {
    this.error = '';
    const repId = this.repuestoIdEdicion ?? rg.repuestoId;
    const rep = this.obtenerRepuesto(repId);
    const stock = rep ? rep.stock : 0;

    if (this.cantidadEdicion > stock) {
      this.error = `No se puede actualizar: Solicitas ${this.cantidadEdicion} unidades pero solo hay ${stock} en catálogo.`;
      this.changeDetectorRef.detectChanges();
      return;
    }

    this.guardandoEdicion = true;
    this.changeDetectorRef.detectChanges();

    try {
      await firstValueFrom(this.repuestoService.eliminarDeMantenimiento(rg.id));
      await firstValueFrom(
        this.repuestoService.asociarAMantenimiento({
          mantenimientoId: rg.mantenimientoId,
          repuestoId: repId,
          cantidad: Number(this.cantidadEdicion),
          costoUnitario: rep ? Number(rep.costoUnitario) : Number(rg.costoUnitario)
        })
      );

      this.guardandoEdicion = false;
      this.repuestoEnEdicionId = null;
      this.repuestoIdEdicion = null;

      if (this.mantenimientoEditar) {
        this.cargarRepuestosMantenimiento(this.mantenimientoEditar.id);
      }
    } catch (err: any) {
      this.guardandoEdicion = false;
      this.error = err.error?.error || 'Error al actualizar el repuesto del mantenimiento.';
      this.changeDetectorRef.detectChanges();
    }
  }

  calcularTotalRepuestos(): number {
    const totalNuevos = this.repuestosSeleccionados.reduce(
      (sum, r) => sum + (Number(r.cantidad) * Number(r.costoUnitario)),
      0
    );
    const totalGuardados = this.repuestosGuardados.reduce(
      (sum, r) => sum + Number(r.subtotal),
      0
    );
    return totalNuevos + totalGuardados;
  }

  async guardarMantenimiento(): Promise<void> {
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

    const filaSinSeleccionar = this.repuestosSeleccionados.find((f) => f.repuestoId === null);
    if (filaSinSeleccionar) {
      this.error = 'Debes seleccionar un repuesto para cada ítem agregado o eliminar la fila.';
      this.changeDetectorRef.detectChanges();
      return;
    }

    const repuestoCantidadInvalida = this.repuestosSeleccionados.find(
      (f) => !f.cantidad || f.cantidad < 1
    );
    if (repuestoCantidadInvalida) {
      this.error = 'La cantidad de cada repuesto debe ser un número entero mayor a 0.';
      this.changeDetectorRef.detectChanges();
      return;
    }

    if (this.hayErroresDeStock()) {
      this.error = 'No se puede guardar: Uno o más repuestos superan el stock disponible en inventario.';
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

    try {
      let idMantenimiento = 0;

      if (this.mantenimientoEditar) {
        idMantenimiento = this.mantenimientoEditar.id;
        await firstValueFrom(
          this.mantenimientoService.actualizarEstado(idMantenimiento, payload)
        );
      } else {
        const creado = await firstValueFrom(
          this.mantenimientoService.crear(payload)
        );
        idMantenimiento = creado.id;
      }

      // Guardar repuestos nuevos si se agregaron
      const repuestosValidos = this.repuestosSeleccionados.filter(
        (r) => r.repuestoId !== null && Number(r.cantidad) > 0
      );

      for (const rep of repuestosValidos) {
        await firstValueFrom(
          this.repuestoService.asociarAMantenimiento({
            mantenimientoId: idMantenimiento,
            repuestoId: Number(rep.repuestoId),
            cantidad: Number(rep.cantidad),
            costoUnitario: Number(rep.costoUnitario)
          })
        );
      }

      this.guardando = false;
      this.guardado.emit();
      this.cerrar.emit();
    } catch (err: any) {
      this.guardando = false;
      this.error = err.error?.error || 'Error al procesar el mantenimiento.';
      this.changeDetectorRef.detectChanges();
    }
  }

  cerrarFormulario(): void {
    this.cerrar.emit();
  }
}
