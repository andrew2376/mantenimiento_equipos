import { CurrencyPipe, DatePipe } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { HistorialEquipo, HistorialService } from '../../core/services/historial.service';

interface EquipoResumen {
  id: number;
  codigoInventario: string;
  nombre: string;
  tipo: string;
}

@Component({
  selector: 'app-historial',
  standalone: true,
  imports: [FormsModule, DatePipe, CurrencyPipe],
  templateUrl: './historial.html',
  styleUrl: './historial.css',
})
export class Historial implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly historialService = inject(HistorialService);
  private readonly changeDetectorRef = inject(ChangeDetectorRef);

  equipos: EquipoResumen[] = [];
  equipoSeleccionadoId: number | null = null;
  historial?: HistorialEquipo;

  cargandoEquipos = true;
  cargandoHistorial = false;
  error = '';
  filtroTipo = 'TODOS';

  ngOnInit(): void {
    this.cargarListaEquipos();
  }

  cargarListaEquipos(): void {
    this.http.get<EquipoResumen[]>('http://localhost:3000/api/equipos').subscribe({
      next: (datos) => {
        this.equipos = datos;
        this.cargandoEquipos = false;
        if (datos.length > 0) {
          this.seleccionarEquipo(datos[0].id);
        }
        this.changeDetectorRef.detectChanges();
      },
      error: () => {
        this.cargandoEquipos = false;
        this.error = 'No se pudieron cargar los equipos.';
        this.changeDetectorRef.detectChanges();
      }
    });
  }

  seleccionarEquipo(id: number): void {
    this.equipoSeleccionadoId = Number(id);
    this.cargandoHistorial = true;
    this.error = '';

    this.historialService.obtenerHistorialEquipo(this.equipoSeleccionadoId).subscribe({
      next: (res) => {
        this.historial = res;
        this.cargandoHistorial = false;
        this.changeDetectorRef.detectChanges();
      },
      error: () => {
        this.cargandoHistorial = false;
        this.error = 'No se pudo cargar el historial del equipo seleccionado.';
        this.changeDetectorRef.detectChanges();
      }
    });
  }

  cambiarFiltro(tipo: string): void {
    this.filtroTipo = tipo;
  }

  get eventosFiltrados() {
    if (!this.historial) return [];
    if (this.filtroTipo === 'TODOS') return this.historial.lineaDeTiempo;
    return this.historial.lineaDeTiempo.filter(e => e.tipo === this.filtroTipo);
  }
}
