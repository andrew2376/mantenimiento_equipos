import {
  ChangeDetectorRef,
  Component,
  OnInit,
  inject
} from '@angular/core';

import { FormsModule } from '@angular/forms';

import {
  Equipo,
  EquipoService
} from '../../../core/services/equipo.service';

import { EquipoForm } from '../equipo-form/equipo-form';


@Component({
  selector: 'app-equipo-list',
  standalone: true,

  imports: [
    FormsModule,
    EquipoForm
  ],

  templateUrl: './equipo-list.html'
})
export class EquipoList implements OnInit {

  private readonly equipoService =
    inject(EquipoService);

  private readonly changeDetectorRef =
    inject(ChangeDetectorRef);


  // ==========================================
  // DATOS
  // ==========================================

  equipos: Equipo[] = [];

  equiposFiltrados: Equipo[] = [];


  // ==========================================
  // ESTADO
  // ==========================================

  cargando = true;

  error = '';

  mostrarFormulario = false;

  equipoSeleccionado?: Equipo;


  // ==========================================
  // BÚSQUEDA
  // ==========================================

  textoBusqueda = '';


  // ==========================================
  // INICIO
  // ==========================================

  ngOnInit(): void {

    this.cargarEquipos();

  }


  // ==========================================
  // CARGAR EQUIPOS
  // ==========================================

  cargarEquipos(): void {

    this.equipoService
      .obtenerTodos()
      .subscribe({

        next: (equipos) => {

          console.log(
            '✅ EQUIPOS RECIBIDOS:',
            equipos
          );

          this.equipos = equipos;

          this.equiposFiltrados = equipos;

          this.cargando = false;

          console.log(
            '✅ cargando:',
            this.cargando
          );

          console.log(
            '✅ cantidad de equipos:',
            this.equipos.length
          );

          this.changeDetectorRef
            .detectChanges();

        },


        error: (error) => {

          console.error(
            '❌ ERROR AL CARGAR EQUIPOS:',
            error
          );

          this.error =
            'No se pudieron cargar los equipos.';

          this.cargando = false;

          this.changeDetectorRef
            .detectChanges();

        }

      });

  }


  // ==========================================
  // BUSCAR EQUIPOS
  // ==========================================

  buscarEquipos(): void {

    const texto =
      this.textoBusqueda
        .trim()
        .toLowerCase();


    // Si no hay búsqueda,
    // mostramos todos los equipos.

    if (!texto) {

      this.equiposFiltrados =
        this.equipos;

      return;

    }


    // Buscar en diferentes campos
    // del equipo.

    this.equiposFiltrados =
      this.equipos.filter((equipo) => {

        return (

          equipo.codigoInventario
            .toLowerCase()
            .includes(texto)

          ||

          equipo.nombre
            .toLowerCase()
            .includes(texto)

          ||

          equipo.tipo
            .toLowerCase()
            .includes(texto)

          ||

          equipo.marca
            .toLowerCase()
            .includes(texto)

          ||

          (equipo.modelo ?? '')
            .toLowerCase()
            .includes(texto)

          ||

          (equipo.numeroSerie ?? '')
            .toLowerCase()
            .includes(texto)

          ||

          equipo.ubicacion
            .toLowerCase()
            .includes(texto)

        );

      });

  }


  // ==========================================
  // LIMPIAR BÚSQUEDA
  // ==========================================

  limpiarBusqueda(): void {

    this.textoBusqueda = '';

    this.equiposFiltrados =
      this.equipos;

  }


  // ==========================================
  // ABRIR FORMULARIO
  // ==========================================

  abrirFormulario(
    equipo?: Equipo
  ): void {

    this.equipoSeleccionado =
      equipo;

    this.mostrarFormulario =
      true;

  }


  // ==========================================
  // CERRAR FORMULARIO
  // ==========================================

  cerrarFormulario(): void {

    this.mostrarFormulario =
      false;

    this.equipoSeleccionado =
      undefined;

  }

}