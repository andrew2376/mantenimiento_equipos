import { Component, EventEmitter, OnInit, Output, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RepuestoService } from '../../../core/services/repuesto.service';

@Component({
  selector: 'app-repuesto-form',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './repuesto-form.html',
})
export class RepuestoForm implements OnInit {
  private readonly repuestoService = inject(RepuestoService);

  @Output() cerrar = new EventEmitter<void>();
  @Output() guardado = new EventEmitter<void>();

  guardando = false;
  error = '';

  codigo = '';
  nombre = '';
  descripcion = '';
  stock = 10;
  precioUnitario = 0;

  ngOnInit(): void {}

  guardar(): void {
    this.error = '';

    if (!this.codigo.trim()) {
      this.error = 'El código del repuesto es obligatorio.';
      return;
    }

    if (!this.nombre.trim()) {
      this.error = 'El nombre del repuesto es obligatorio.';
      return;
    }

    if (this.stock < 0) {
      this.error = 'El stock inicial no puede ser negativo.';
      return;
    }

    if (this.precioUnitario < 0) {
      this.error = 'El precio unitario no puede ser negativo.';
      return;
    }

    this.guardando = true;

    this.repuestoService.crear({
      codigo: this.codigo.trim().toUpperCase(),
      nombre: this.nombre.trim(),
      descripcion: this.descripcion.trim() || null,
      stock: Number(this.stock),
      precioUnitario: Number(this.precioUnitario)
    }).subscribe({
      next: () => {
        this.guardando = false;
        this.guardado.emit();
      },
      error: (err) => {
        this.guardando = false;
        this.error = err?.error?.error ?? 'Error al registrar el repuesto.';
      }
    });
  }

  cancelar(): void {
    this.cerrar.emit();
  }
}
