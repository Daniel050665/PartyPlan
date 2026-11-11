import { DecimalPipe } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../core/api.service';
import { ContadorService } from '../core/contador.service';
import { ConfirmService } from '../core/confirm.service';
import { Lugar } from '../core/models';
import { ToastService } from '../core/toast.service';
import { IconComponent } from '../shared/icon.component';
import { ModalComponent } from '../shared/modal.component';

// =====================================================================
// PAGINA DE LUGARES
// Muestra la tabla de lugares (museos, bares, discotecas...) con PAGINACION
// (5 por pagina) y permite crear, editar, eliminar y buscar.
// =====================================================================

@Component({
  selector: 'app-lugares',
  imports: [FormsModule, DecimalPipe, IconComponent, ModalComponent],
  templateUrl: './lugares.page.html',
})
export class LugaresPage implements OnInit {
  lugares: Lugar[] = []; // los lugares de la PAGINA actual (maximo 5)
  cargando = true; // true mientras llegan los datos (se ven los rectangulos grises)
  guardando = false; // true mientras se guarda (el boton Guardar se desactiva)
  textoBusqueda = ''; // lo que el usuario escribe en el buscador
  modalAbierto = false; // true = se ve la ventana del formulario

  // ---- Paginacion ----
  paginaActual = 0; // el backend cuenta las paginas desde 0 (la primera es la 0)
  tamanoPagina = 5; // cuantos lugares se muestran por pagina
  totalPaginas = 0; // cuantas paginas hay en total
  totalElementos = 0; // cuantos lugares hay en total

  // Datos del formulario (conectados a los <input> con [(ngModel)])
  formulario: Lugar = this.crearFormularioVacio();

  // inject() le pide a Angular el servicio que necesitamos (inyeccion de dependencias)
  private apiService = inject(ApiService);
  private toastService = inject(ToastService);
  private contadorService = inject(ContadorService);
  private confirmService = inject(ConfirmService);

  // ngOnInit se ejecuta solo una vez, cuando se abre la pagina
  ngOnInit(): void {
    this.cargarLugares();
  }

  // Pide al backend UNA pagina de lugares.
  // Ejemplo: GET /api/lugares/paginado?pagina=0&tamano=5&texto=museo
  // El backend responde: { contenido: [...], pagina: 0, totalPaginas: 2, totalElementos: 9 }
  cargarLugares(): void {
    this.cargando = true;
    const ruta =
      'lugares/paginado?pagina=' + this.paginaActual +
      '&tamano=' + this.tamanoPagina +
      '&texto=' + encodeURIComponent(this.textoBusqueda.trim()); // encodeURIComponent: permite espacios y tildes
    this.apiService.get(ruta).subscribe({
      next: (respuesta) => {
        // Si borramos el ultimo lugar de la ultima pagina, esa pagina queda vacia:
        // volvemos a la pagina anterior.
        if (respuesta.contenido.length === 0 && this.paginaActual > 0) {
          this.paginaActual = this.paginaActual - 1;
          this.cargarLugares();
          return;
        }
        this.lugares = respuesta.contenido;
        this.totalPaginas = respuesta.totalPaginas;
        this.totalElementos = respuesta.totalElementos;
        this.cargando = false;
      },
      error: (error) => {
        this.toastService.error(this.apiService.obtenerMensajeError(error));
        this.cargando = false;
      },
    });
  }

  // Cada vez que se escribe en el buscador volvemos a la primera pagina
  // y le pedimos al backend que busque (la busqueda la hace una consulta JPQL).
  buscar(texto: string): void {
    this.textoBusqueda = texto;
    this.paginaActual = 0;
    this.cargarLugares();
  }

  // Boton "Anterior"
  paginaAnterior(): void {
    if (this.paginaActual > 0) {
      this.paginaActual = this.paginaActual - 1;
      this.cargarLugares();
    }
  }

  // Boton "Siguiente"
  paginaSiguiente(): void {
    if (this.paginaActual + 1 < this.totalPaginas) {
      this.paginaActual = this.paginaActual + 1;
      this.cargarLugares();
    }
  }

  crearFormularioVacio(): Lugar {
    return { nombre: '', categoria: '', direccion: '', capacidad: null };
  }

  // Boton "Nuevo lugar": formulario en blanco
  abrirNuevo(): void {
    this.formulario = this.crearFormularioVacio();
    this.modalAbierto = true;
  }

  // Boton del lapiz: copiamos los datos del lugar al formulario.
  // Hacemos una COPIA para que, si el usuario cancela, la tabla no cambie.
  abrirEditar(lugar: Lugar): void {
    this.formulario = {
      id: lugar.id,
      nombre: lugar.nombre,
      categoria: lugar.categoria,
      direccion: lugar.direccion,
      capacidad: lugar.capacidad,
    };
    this.modalAbierto = true;
  }

  cerrarModal(): void {
    this.modalAbierto = false;
  }

  // Boton "Guardar": si el formulario tiene id, es una edicion (PUT);
  // si no tiene id, es un lugar nuevo (POST).
  guardar(): void {
    this.guardando = true;

    if (this.formulario.id) {
      this.apiService.put('lugares/' + this.formulario.id, this.formulario).subscribe({
        next: () => this.terminarDeGuardar('Lugar actualizado correctamente'),
        error: (error) => this.mostrarErrorAlGuardar(error),
      });
    } else {
      this.apiService.post('lugares', this.formulario).subscribe({
        next: () => this.terminarDeGuardar('Lugar creado correctamente'),
        error: (error) => this.mostrarErrorAlGuardar(error),
      });
    }
  }

  // Cuando el guardado salio bien
  terminarDeGuardar(mensaje: string): void {
    this.toastService.exito(mensaje);
    this.contadorService.registrarAccion(); // signal: suma 1 al contador
    this.modalAbierto = false;
    this.guardando = false;
    this.cargarLugares(); // recargamos la tabla con los datos nuevos
  }

  // Cuando el guardado fallo: mostramos el error y dejamos la ventana abierta
  mostrarErrorAlGuardar(error: any): void {
    this.toastService.error(this.apiService.obtenerMensajeError(error));
    this.guardando = false;
  }

  // Boton de la papelera: primero pregunta, y si dice que si, elimina
  eliminar(lugar: Lugar): void {
    this.confirmService.preguntar(
      'Eliminar lugar',
      '¿Seguro que quieres eliminar "' + lugar.nombre + '"? Esta acción no se puede deshacer.',
      'Eliminar',
      () => {
        this.apiService.delete('lugares/' + lugar.id).subscribe({
          next: () => {
            this.toastService.exito('Lugar eliminado');
            this.contadorService.registrarAccion(); // signal: suma 1 al contador
            this.cargarLugares();
          },
          error: (error) => {
            this.toastService.error(this.apiService.obtenerMensajeError(error));
          },
        });
      },
    );
  }
}
