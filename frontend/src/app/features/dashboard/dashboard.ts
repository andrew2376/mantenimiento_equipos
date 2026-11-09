import {
  Component,
  OnInit,
  inject,
  signal,
  ChangeDetectorRef,
  ViewChildren,
  QueryList
} from '@angular/core';

import { CurrencyPipe, DatePipe, NgClass } from '@angular/common';

import { BaseChartDirective } from 'ng2-charts';

import { Chart, registerables } from 'chart.js';

import type {
  ChartData,
  ChartOptions
} from 'chart.js';

import { DashboardService } from '../../core/services/dashboard.service';

import type {
  Dashboard,
  DistribucionDashboard
} from '../../core/services/dashboard.service';

// Registrar todos los componentes de Chart.js.
Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    BaseChartDirective,
    CurrencyPipe,
    DatePipe,
    NgClass
  ],
  templateUrl: './dashboard.html'
})
export class DashboardComponent implements OnInit {

  // ==========================================
  // SERVICIOS Y REFERENCIAS
  // ==========================================

  private readonly dashboardService = inject(DashboardService);
  private readonly cdr = inject(ChangeDetectorRef);

  @ViewChildren(BaseChartDirective)
  private graficas!: QueryList<BaseChartDirective>;

  // ==========================================
  // ESTADO DEL COMPONENTE
  // ==========================================

  dashboard = signal<Dashboard | null>(null);

  cargando = signal<boolean>(true);

  error = signal<string>('');

  // ==========================================
  // PALETA DE COLORES
  // ==========================================

  private readonly colorMorado = '#6c5ce7';
  private readonly colorVerde = '#20a779';
  private readonly colorNaranja = '#f59e0b';
  private readonly colorRojo = '#ef4444';

  // Disponible para utilizarla desde dashboard.html.
  readonly colores = [
    '#6c5ce7',
    '#20a779',
    '#f59e0b',
    '#3b82f6',
    '#ef4444',
    '#8b5cf6',
    '#14b8a6'
  ];

  // ==========================================
  // GRÁFICA: ACTIVIDAD MENSUAL
  // ==========================================

  actividadData = signal<ChartData<'line'>>({
    labels: [],
    datasets: [
      {
        label: 'Tickets',
        data: [],
        borderColor: this.colorMorado,
        backgroundColor: 'rgba(108, 92, 231, 0.10)',
        fill: true,
        tension: 0.4,
        borderWidth: 3,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBackgroundColor: this.colorMorado
      },
      {
        label: 'Mantenimientos',
        data: [],
        borderColor: this.colorVerde,
        backgroundColor: 'rgba(32, 167, 121, 0.08)',
        fill: true,
        tension: 0.4,
        borderWidth: 3,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBackgroundColor: this.colorVerde
      }
    ]
  });

  actividadOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,

    interaction: {
      intersect: false,
      mode: 'index'
    },

    plugins: {
      legend: {
        position: 'top',
        align: 'end',
        labels: {
          usePointStyle: true,
          boxWidth: 8,
          padding: 20,
          color: '#697386',
          font: {
            family: 'Inter',
            size: 12
          }
        }
      },

      tooltip: {
        backgroundColor: '#17152b',
        padding: 12,
        cornerRadius: 8
      }
    },

    scales: {
      x: {
        grid: {
          display: false
        },
        border: {
          display: false
        },
        ticks: {
          color: '#98a2b3'
        }
      },

      y: {
        beginAtZero: true,
        border: {
          display: false
        },
        grid: {
          color: '#f0eff6'
        },
        ticks: {
          precision: 0,
          color: '#98a2b3'
        }
      }
    }
  };

  // ==========================================
  // GRÁFICA: TICKETS POR ESTADO
  // ==========================================

  ticketsEstadoData = signal<ChartData<'doughnut'>>({
    labels: [],
    datasets: [
      {
        data: [],
        backgroundColor: this.colores,
        borderWidth: 0,
        hoverOffset: 7
      }
    ]
  });

  ticketsDonaOptions: ChartOptions<'doughnut'> = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '72%',

    plugins: {
      legend: {
        display: false
      },

      tooltip: {
        backgroundColor: '#17152b',
        padding: 12,
        cornerRadius: 8
      }
    }
  };

  // ==========================================
  // GRÁFICA: TICKETS POR PRIORIDAD
  // ==========================================

  ticketsPrioridadData = signal<ChartData<'bar'>>({
    labels: [],
    datasets: [
      {
        label: 'Tickets',
        data: [],
        backgroundColor: [
          '#20a779',
          '#3b82f6',
          '#f59e0b',
          '#ef4444'
        ],
        borderRadius: 7,
        borderSkipped: false,
        barThickness: 22
      }
    ]
  });

  ticketsPrioridadOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,

    indexAxis: 'y',

    plugins: {
      legend: {
        display: false
      },

      tooltip: {
        backgroundColor: '#17152b',
        padding: 12,
        cornerRadius: 8
      }
    },

    scales: {
      x: {
        beginAtZero: true,
        grid: {
          color: '#f0eff6'
        },
        border: {
          display: false
        },
        ticks: {
          precision: 0,
          color: '#98a2b3'
        }
      },

      y: {
        grid: {
          display: false
        },
        border: {
          display: false
        },
        ticks: {
          color: '#697386'
        }
      }
    }
  };

  // ==========================================
  // GRÁFICA: MANTENIMIENTOS POR TIPO
  // ==========================================

  mantenimientoTipoData = signal<ChartData<'doughnut'>>({
    labels: [],
    datasets: [
      {
        data: [],
        backgroundColor: [
          '#6c5ce7',
          '#20a779'
        ],
        borderWidth: 0,
        hoverOffset: 7
      }
    ]
  });

  mantenimientoDonaOptions: ChartOptions<'doughnut'> = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '72%',

    plugins: {
      legend: {
        display: false
      },

      tooltip: {
        backgroundColor: '#17152b',
        padding: 12,
        cornerRadius: 8
      }
    }
  };

  // ==========================================
  // GRÁFICA: MANTENIMIENTOS POR ESTADO
  // ==========================================

  mantenimientoEstadoData = signal<ChartData<'bar'>>({
    labels: [],
    datasets: [
      {
        label: 'Mantenimientos',
        data: [],
        backgroundColor: this.colores,
        borderRadius: 7,
        borderSkipped: false,
        barThickness: 24
      }
    ]
  });

  mantenimientoEstadoOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,

    plugins: {
      legend: {
        display: false
      },

      tooltip: {
        backgroundColor: '#17152b',
        padding: 12,
        cornerRadius: 8
      }
    },

    scales: {
      x: {
        grid: {
          display: false
        },
        border: {
          display: false
        },
        ticks: {
          color: '#697386'
        }
      },

      y: {
        beginAtZero: true,
        grid: {
          color: '#f0eff6'
        },
        border: {
          display: false
        },
        ticks: {
          precision: 0,
          color: '#98a2b3'
        }
      }
    }
  };

  // ==========================================
  // INICIALIZACIÓN
  // ==========================================

  ngOnInit(): void {
    this.cargarDashboard();
  }

  // ==========================================
  // CONSULTAR DASHBOARD
  // ==========================================

  cargarDashboard(): void {
    this.cargando.set(true);
    this.error.set('');

    this.dashboardService.obtenerResumen().subscribe({

      next: (respuesta: Dashboard) => {

        // Guardar información recibida del backend.
        this.dashboard.set(respuesta);

        // Actualizar los datos de todas las gráficas.
        this.actualizarGraficas(respuesta);

        this.cargando.set(false);

        // Forzar la actualización de la vista de Angular.
        this.cdr.detectChanges();

        // Esperar a que los canvas estén renderizados.
        requestAnimationFrame(() => {

          // Ajustar y actualizar todas las gráficas.
          this.graficas.forEach(grafica => {
            grafica.chart?.resize();
            grafica.chart?.update('none');
          });

        });

      },

      error: (error) => {

        console.error(
          'Error al consultar el Dashboard:',
          error
        );

        this.error.set(
          error.status === 401 || error.status === 403
            ? 'Tu sesión no está autorizada. Vuelve a iniciar sesión.'
            : 'No fue posible cargar la información del Dashboard.'
        );

        this.cargando.set(false);

      }

    });
  }

  // ==========================================
  // ACTUALIZAR TODAS LAS GRÁFICAS
  // ==========================================

  private actualizarGraficas(datos: Dashboard): void {

    // Actividad mensual.
    this.actividadData.set({
      labels: datos.actividadMensual.map(
        item => item.mes
      ),

      datasets: [
        {
          label: 'Tickets',
          data: datos.actividadMensual.map(
            item => item.tickets
          ),
          borderColor: this.colorMorado,
          backgroundColor: 'rgba(108, 92, 231, 0.10)',
          fill: true,
          tension: 0.4,
          borderWidth: 3,
          pointRadius: 4,
          pointHoverRadius: 6,
          pointBackgroundColor: this.colorMorado
        },

        {
          label: 'Mantenimientos',
          data: datos.actividadMensual.map(
            item => item.mantenimientos
          ),
          borderColor: this.colorVerde,
          backgroundColor: 'rgba(32, 167, 121, 0.08)',
          fill: true,
          tension: 0.4,
          borderWidth: 3,
          pointRadius: 4,
          pointHoverRadius: 6,
          pointBackgroundColor: this.colorVerde
        }
      ]
    });

    // Tickets por estado.
    this.ticketsEstadoData.set(
      this.crearDatosDona(datos.tickets.porEstado)
    );

    // Tickets por prioridad.
    this.ticketsPrioridadData.set({
      labels: datos.tickets.porPrioridad.map(
        item => this.formatearEstado(item.nombre)
      ),

      datasets: [
        {
          label: 'Tickets',
          data: datos.tickets.porPrioridad.map(
            item => item.cantidad
          ),
          backgroundColor: [
            '#20a779',
            '#3b82f6',
            '#f59e0b',
            '#ef4444'
          ],
          borderRadius: 7,
          borderSkipped: false,
          barThickness: 22
        }
      ]
    });

    // Mantenimientos por tipo.
    this.mantenimientoTipoData.set(
      this.crearDatosDona(datos.mantenimientos.porTipo)
    );

    // Mantenimientos por estado.
    this.mantenimientoEstadoData.set({
      labels: datos.mantenimientos.porEstado.map(
        item => this.formatearEstado(item.nombre)
      ),

      datasets: [
        {
          label: 'Mantenimientos',
          data: datos.mantenimientos.porEstado.map(
            item => item.cantidad
          ),
          backgroundColor: this.colores,
          borderRadius: 7,
          borderSkipped: false,
          barThickness: 24
        }
      ]
    });

  }

  // ==========================================
  // CREAR DATOS PARA GRÁFICAS DE DONA
  // ==========================================

  private crearDatosDona(
    distribucion: DistribucionDashboard[]
  ): ChartData<'doughnut'> {

    return {
      labels: distribucion.map(
        item => this.formatearEstado(item.nombre)
      ),

      datasets: [
        {
          data: distribucion.map(
            item => item.cantidad
          ),
          backgroundColor: this.colores,
          borderWidth: 0,
          hoverOffset: 7
        }
      ]
    };

  }

  // ==========================================
  // FORMATEAR ESTADOS
  // ==========================================

  formatearEstado(valor: string): string {

    const etiquetas: Record<string, string> = {

      ABIERTO: 'Abierto',
      ASIGNADO: 'Asignado',
      EN_DIAGNOSTICO: 'En diagnóstico',
      EN_MANTENIMIENTO: 'En mantenimiento',
      RESUELTO: 'Resuelto',
      CERRADO: 'Cerrado',
      CANCELADO: 'Cancelado',

      PENDIENTE: 'Pendiente',
      EN_PROCESO: 'En proceso',
      FINALIZADO: 'Finalizado',

      PREVENTIVO: 'Preventivo',
      CORRECTIVO: 'Correctivo',

      BAJA: 'Baja',
      MEDIA: 'Media',
      ALTA: 'Alta',
      CRITICA: 'Crítica'

    };

    return etiquetas[valor] ??
      valor.replace(/_/g, ' ').toLowerCase();

  }

  // ==========================================
  // CLASE CSS DE ESTADOS
  // ==========================================

  claseEstado(valor: string): string {

    const clases: Record<string, string> = {

      ABIERTO: 'abierto',
      ASIGNADO: 'asignado',
      EN_DIAGNOSTICO: 'diagnostico',
      EN_MANTENIMIENTO: 'mantenimiento',
      RESUELTO: 'resuelto',
      CERRADO: 'cerrado',
      CANCELADO: 'cancelado',

      PENDIENTE: 'pendiente',
      EN_PROCESO: 'proceso',
      FINALIZADO: 'finalizado'

    };

    return clases[valor] ?? 'neutral';

  }

  // ==========================================
  // CLASE CSS DE PRIORIDAD
  // ==========================================

  clasePrioridad(valor: string): string {

    const clases: Record<string, string> = {

      BAJA: 'prioridad-baja',
      MEDIA: 'prioridad-media',
      ALTA: 'prioridad-alta',
      CRITICA: 'prioridad-critica'

    };

    return clases[valor] ?? 'prioridad-neutral';

  }

  // ==========================================
  // FECHA DE ACTUALIZACIÓN
  // ==========================================

  obtenerFechaActualizacion(): string {

    const fecha = this.dashboard()?.actualizadoEn;

    if (!fecha) {
      return 'Sin información';
    }

    return new Date(fecha).toLocaleString('es-CO', {
      dateStyle: 'medium',
      timeStyle: 'short'
    });

  }

}