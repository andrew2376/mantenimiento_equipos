import {
  Component,
  EventEmitter,
  Output,
  Input,
  OnInit,
  inject
} from '@angular/core';

import { FormsModule } from '@angular/forms';

import {
  CrearEquipo,
  Equipo,
  EquipoService
} from '../../../core/services/equipo.service';


@Component({
  selector: 'app-equipo-form',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './equipo-form.html'
})
export class EquipoForm implements OnInit {

  private readonly equipoService =
    inject(EquipoService);


  @Input()
  equipoEditar?: Equipo;


  @Output()
  cerrar =
    new EventEmitter<void>();


  @Output()
  guardado =
    new EventEmitter<void>();


  codigoInventario = '';

  nombre = '';

  tipo = '';

  marca = '';

  modelo = '';

  numeroSerie = '';

  ubicacion = '';


  guardando = false;

  error = '';


  ngOnInit(): void {

    console.log(
      '📥 EQUIPO RECIBIDO PARA EDITAR:',
      this.equipoEditar
    );


    if (this.equipoEditar) {

      this.codigoInventario =
        this.equipoEditar.codigoInventario;

      this.nombre =
        this.equipoEditar.nombre;

      this.tipo =
        this.equipoEditar.tipo;

      this.marca =
        this.equipoEditar.marca;

      this.modelo =
        this.equipoEditar.modelo ?? '';

      this.numeroSerie =
        this.equipoEditar.numeroSerie ?? '';

      this.ubicacion =
        this.equipoEditar.ubicacion;

    }

  }


  cerrarFormulario(): void {

    this.cerrar.emit();

  }


  guardarEquipo(): void {

    console.log(
      '🟢 BOTÓN GUARDAR PRESIONADO'
    );


    this.error = '';


    if (
      !this.codigoInventario.trim() ||
      !this.nombre.trim() ||
      !this.tipo ||
      !this.marca.trim() ||
      !this.ubicacion.trim()
    ) {

      this.error =
        'Completa todos los campos obligatorios.';

      return;

    }


    const equipo: CrearEquipo = {

      codigoInventario:
        this.codigoInventario.trim(),

      nombre:
        this.nombre.trim(),

      tipo:
        this.tipo,

      marca:
        this.marca.trim(),

      modelo:
        this.modelo.trim() || undefined,

      numeroSerie:
        this.numeroSerie.trim() || undefined,

      ubicacion:
        this.ubicacion.trim(),

      estado:
        this.equipoEditar?.estado ?? 1

    };


    console.log(
      '📦 EQUIPO A GUARDAR:',
      equipo
    );


    this.guardando = true;


    /*
     * ========================================
     * EDITAR EQUIPO
     * ========================================
     */

    if (this.equipoEditar) {

      console.log(
        '✏️ MODO EDICIÓN - ID:',
        this.equipoEditar.id
      );


      this.equipoService
        .actualizar(
          this.equipoEditar.id,
          equipo
        )
        .subscribe({

          next: (equipoActualizado) => {

            console.log(
              '✅ EQUIPO ACTUALIZADO:',
              equipoActualizado
            );

            this.guardando = false;

            this.guardado.emit();

            this.cerrar.emit();

          },


          error: (error) => {

            console.error(
              '❌ ERROR AL ACTUALIZAR EQUIPO:',
              error
            );

            this.guardando = false;

            this.error =
              error?.error?.error ??
              'No se pudo actualizar el equipo.';

          }

        });


      return;

    }


    /*
     * ========================================
     * CREAR EQUIPO
     * ========================================
     */

    console.log(
      '➕ MODO CREACIÓN'
    );


    this.equipoService
      .crear(equipo)
      .subscribe({

        next: (equipoCreado) => {

          console.log(
            '✅ EQUIPO CREADO:',
            equipoCreado
          );

          this.guardando = false;

          this.guardado.emit();

          this.cerrar.emit();

        },


        error: (error) => {

          console.error(
            '❌ ERROR AL CREAR EQUIPO:',
            error
          );

          this.guardando = false;

          this.error =
            error?.error?.error ??
            'No se pudo guardar el equipo.';

        }

      });

  }

}