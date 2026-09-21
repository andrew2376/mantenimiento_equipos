import { DatePipe } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Mantenimiento, MantenimientoService } from '../../../core/services/mantenimiento.service';
import { MantenimientoForm } from '../mantenimiento-form/mantenimiento-form';

@Component({
  selector: 'app-mantenimiento-list',
  standalone: true,
  imports: [FormsModule, DatePipe, MantenimientoForm],
  templateUrl: './mantenimiento-list.html',
})
export class MantenimientoList implements OnInit {
  private readonly mantenimientoService = inject(MantenimientoService);
  private readonly changeDetectorRef = inject(ChangeDetectorRef);

  mantenimientos: Mantenimiento[] = [];
  mantenimientosFiltrados: Mantenimiento[] = [];
  cargando = true;
  error = '';
  textoBusqueda = '';
  filtroEstado = 'TODOS';

  mostrarFormulario = false;
  mantenimientoSeleccionado?: Mantenimiento;

  ngOnInit(): void {
    this.cargarMantenimientos();
  }

  cargarMantenimientos(): void {
    this.cargando = true;
    this.error = '';

    this.mantenimientoService.obtenerTodos().subscribe({
      next: (datos) => {
        this.mantenimientos = datos;
        this.aplicarFiltros();
        this.cargando = false;
        this.changeDetectorRef.detectChanges();
      },
      error: (err) => {
        this.cargando = false;
        this.error = 'No se pudieron cargar los registros de mantenimiento.';
        this.changeDetectorRef.detectChanges();
      }
    });
  }

  aplicarFiltros(): void {
    let resultado = [...this.mantenimientos];

    if (this.filtroEstado !== 'TODOS') {
      resultado = resultado.filter(m => m.estado === this.filtroEstado);
    }

    if (this.textoBusqueda.trim()) {
      const q = this.textoBusqueda.toLowerCase();
      resultado = resultado.filter(m =>
        m.descripcion.toLowerCase().includes(q) ||
        (m.tecnico && m.tecnico.toLowerCase().includes(q)) ||
        (m.equipoNombre && m.equipoNombre.toLowerCase().includes(q)) ||
        (m.equipoCodigo && m.equipoCodigo.toLowerCase().includes(q)) ||
        (m.ticketTitulo && m.ticketTitulo.toLowerCase().includes(q))
      );
    }

    this.mantenimientosFiltrados = resultado;
  }

  buscar(): void {
    this.aplicarFiltros();
  }

  limpiarBusqueda(): void {
    this.textoBusqueda = '';
    this.aplicarFiltros();
  }

  cambiarFiltroEstado(estado: string): void {
    this.filtroEstado = estado;
    this.aplicarFiltros();
  }

  abrirNuevo(): void {
    this.mantenimientoSeleccionado = undefined;
    this.mostrarFormulario = true;
  }

  editar(mantenimiento: Mantenimiento): void {
    this.mantenimientoSeleccionado = mantenimiento;
    this.mostrarFormulario = true;
  }

  cerrarFormulario(): void {
    this.mostrarFormulario = false;
    this.mantenimientoSeleccionado = undefined;
  }

  alGuardar(): void {
    this.cerrarFormulario();
    this.cargarMantenimientos();
  }

  iniciarIntervencion(m: Mantenimiento): void {
    this.mantenimientoService.actualizar(m.id, { estado: 'EN_PROCESO' }).subscribe({
      next: () => {
        this.cargarMantenimientos();
      }
    });
  }
}
