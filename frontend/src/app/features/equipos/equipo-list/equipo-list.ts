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



  equipos: Equipo[] = [];

  equiposFiltrados: Equipo[] = [];




  cargando = true;

  error = '';

  mostrarFormulario = false;

  equipoSeleccionado?: Equipo;

  procesandoEstado = false;



  textoBusqueda = '';




  ngOnInit(): void {

    this.cargarEquipos();

  }


  cargarEquipos(): void {

    this.equipoService
      .obtenerTodos()
      .subscribe({

        next: (equipos) => {

          console.log(
            ' EQUIPOS RECIBIDOS:',
            equipos
          );

          this.equipos = equipos;

          this.equiposFiltrados =
            this.filtrarEquipos(equipos);

          this.cargando = false;

          console.log(
            ' cargando:',
            this.cargando
          );

          console.log(
            ' cantidad de equipos:',
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


  private filtrarEquipos(
    equipos: Equipo[]
  ): Equipo[] {

    const texto =
      this.textoBusqueda
        .trim()
        .toLowerCase();


    if (!texto) {

      return equipos;

    }


    return equipos.filter((equipo) => {

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


  buscarEquipos(): void {

    this.equiposFiltrados =
      this.filtrarEquipos(this.equipos);

  }


  limpiarBusqueda(): void {

    this.textoBusqueda = '';

    this.equiposFiltrados =
      this.equipos;

  }



  desactivarEquipo(
    equipo: Equipo
  ): void {

    const confirmar =
      window.confirm(
        `¿Deseas desactivar el equipo "${equipo.nombre}"?\n\n` +
        'El equipo no será eliminado. ' +
        'Simplemente quedará inactivo en el sistema.'
      );


    if (!confirmar) {

      return;

    }


    this.procesandoEstado = true;

    this.error = '';


    this.equipoService
      .desactivar(equipo.id)
      .subscribe({

        next: (equipoActualizado) => {

          console.log(
            ' EQUIPO DESACTIVADO:',
            equipoActualizado
          );

          this.actualizarEquipoEnLista(
            equipoActualizado
          );

          this.procesandoEstado = false;

          this.changeDetectorRef
            .detectChanges();

        },


        error: (error) => {

          console.error(
            ' ERROR AL DESACTIVAR EQUIPO:',
            error
          );

          this.error =
            'No se pudo desactivar el equipo.';

          this.procesandoEstado = false;

          this.changeDetectorRef
            .detectChanges();

        }

      });

  }


  activarEquipo(
    equipo: Equipo
  ): void {

    const confirmar =
      window.confirm(
        `¿Deseas activar nuevamente el equipo "${equipo.nombre}"?\n\n` +
        'El equipo volverá a estar activo en el sistema.'
      );


    if (!confirmar) {

      return;

    }


    this.procesandoEstado = true;

    this.error = '';


    this.equipoService
      .activar(equipo.id)
      .subscribe({

        next: (equipoActualizado) => {

          console.log(
            ' EQUIPO ACTIVADO:',
            equipoActualizado
          );

          this.actualizarEquipoEnLista(
            equipoActualizado
          );

          this.procesandoEstado = false;

          this.changeDetectorRef
            .detectChanges();

        },


        error: (error) => {

          console.error(
            ' ERROR AL ACTIVAR EQUIPO:',
            error
          );

          this.error =
            'No se pudo activar el equipo.';

          this.procesandoEstado = false;

          this.changeDetectorRef
            .detectChanges();

        }

      });

  }


  private actualizarEquipoEnLista(
    equipoActualizado: Equipo
  ): void {

    this.equipos =
      this.equipos.map((equipo) =>
        equipo.id === equipoActualizado.id
          ? equipoActualizado
          : equipo
      );

    this.equiposFiltrados =
      this.filtrarEquipos(this.equipos);

  }

  abrirFormulario(
    equipo?: Equipo
  ): void {

    this.equipoSeleccionado =
      equipo;

    this.mostrarFormulario =
      true;

  }


  cerrarFormulario(): void {

    this.mostrarFormulario =
      false;

    this.equipoSeleccionado =
      undefined;

  }

}