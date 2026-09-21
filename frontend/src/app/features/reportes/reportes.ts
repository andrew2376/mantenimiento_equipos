import { CurrencyPipe, DatePipe, DecimalPipe } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { ResumenGeneral, ReporteService } from '../../core/services/reporte.service';

@Component({
  selector: 'app-reportes',
  standalone: true,
  imports: [DatePipe, CurrencyPipe, DecimalPipe],
  templateUrl: './reportes.html',
  styleUrl: './reportes.css',
})
export class Reportes implements OnInit {
  private readonly reporteService = inject(ReporteService);
  private readonly changeDetectorRef = inject(ChangeDetectorRef);

  resumen?: ResumenGeneral;
  cargando = true;
  error = '';
  fechaGeneracion = new Date();

  ngOnInit(): void {
    this.cargarResumen();
  }

  cargarResumen(): void {
    this.cargando = true;
    this.error = '';

    this.reporteService.obtenerResumen().subscribe({
      next: (datos) => {
        this.resumen = datos;
        this.fechaGeneracion = new Date();
        this.cargando = false;
        this.changeDetectorRef.detectChanges();
      },
      error: () => {
        this.cargando = false;
        this.error = 'No se pudo cargar el reporte estadístico.';
        this.changeDetectorRef.detectChanges();
      }
    });
  }

  imprimir(): void {
    window.print();
  }
}
