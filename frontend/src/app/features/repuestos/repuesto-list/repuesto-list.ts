import { CurrencyPipe, DatePipe } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Repuesto, RepuestoService } from '../../../core/services/repuesto.service';
import { RepuestoForm } from '../repuesto-form/repuesto-form';

@Component({
  selector: 'app-repuesto-list',
  standalone: true,
  imports: [FormsModule, DatePipe, CurrencyPipe, RepuestoForm],
  templateUrl: './repuesto-list.html',
})
export class RepuestoList implements OnInit {
  private readonly repuestoService = inject(RepuestoService);
  private readonly changeDetectorRef = inject(ChangeDetectorRef);

  repuestos: Repuesto[] = [];
  repuestosFiltrados: Repuesto[] = [];
  cargando = true;
  error = '';
  textoBusqueda = '';

  mostrarFormulario = false;

  ngOnInit(): void {
    this.cargarRepuestos();
  }

  cargarRepuestos(): void {
    this.cargando = true;
    this.error = '';

    this.repuestoService.obtenerTodos().subscribe({
      next: (datos) => {
        this.repuestos = datos;
        this.aplicarFiltro();
        this.cargando = false;
        this.changeDetectorRef.detectChanges();
      },
      error: () => {
        this.cargando = false;
        this.error = 'No se pudo cargar el inventario de repuestos.';
        this.changeDetectorRef.detectChanges();
      }
    });
  }

  aplicarFiltro(): void {
    if (!this.textoBusqueda.trim()) {
      this.repuestosFiltrados = [...this.repuestos];
      return;
    }

    const q = this.textoBusqueda.toLowerCase();
    this.repuestosFiltrados = this.repuestos.filter(r =>
      r.codigo.toLowerCase().includes(q) ||
      r.nombre.toLowerCase().includes(q) ||
      (r.descripcion && r.descripcion.toLowerCase().includes(q))
    );
  }

  buscar(): void {
    this.aplicarFiltro();
  }

  limpiarBusqueda(): void {
    this.textoBusqueda = '';
    this.aplicarFiltro();
  }

  abrirNuevo(): void {
    this.mostrarFormulario = true;
  }

  cerrarFormulario(): void {
    this.mostrarFormulario = false;
  }

  alGuardar(): void {
    this.cerrarFormulario();
    this.cargarRepuestos();
  }

  get totalUnidadesStock(): number {
    return this.repuestos.reduce((sum, r) => sum + Number(r.stock), 0);
  }

  get totalStockBajo(): number {
    return this.repuestos.filter(r => r.stock <= 2).length;
  }
}
